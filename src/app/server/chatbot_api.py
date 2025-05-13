# server/chatbot_api.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import json
import pickle
import os
from xgboost import XGBClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

app = Flask(__name__)
CORS(app) # Enable CORS for local development

# Define EMBEDDING_MODEL_NAME at the top
EMBEDDING_MODEL_NAME = 'all-MiniLM-L6-v2'

DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../data/Decals.json')
EMBEDDINGS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../models/sentence_embeddings.pkl')
INTENT_MAP_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../models/intent_map.pkl')
CLASSIFIER_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../models/Decal_classifier.pkl')
ENCODER_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../models/Decal_encoder.pkl')

# Ensure models directory exists
os.makedirs(os.path.dirname(EMBEDDINGS_FILE), exist_ok=True)
os.makedirs(os.path.dirname(CLASSIFIER_FILE), exist_ok=True)

# Global variable to store sentences
all_sentences_inference = []

# === Load examples and preprocess (Run once on server start) ===
if not os.path.exists(EMBEDDINGS_FILE) or not os.path.exists(INTENT_MAP_FILE) or not os.path.exists(CLASSIFIER_FILE) or not os.path.exists(ENCODER_FILE):
    print("🛠️ Training/Loading embeddings and classifier...")
    with open(DATA_FILE, "r", encoding='utf-8') as f:
        intents_data = json.load(f)

    sentences = []
    intent_names_clustering = []
    intent_map = {}
    intent_responses = {}
    train_sentences_classifier = []
    train_labels_classifier = []

    for intent_info in intents_data["intents"]:
        name = intent_info["intent"]
        intent_responses[name] = intent_info["responses"]
        for example in intent_info["patterns"]:
            sentences.append(example)
            intent_names_clustering.append(name)
            intent_map[example] = name
            train_sentences_classifier.append(example)
            train_labels_classifier.append(name)

    print(f"📚 Loaded {len(sentences)} examples from {len(set(intent_names_clustering))} intents.")

    # Sentence Embedding
    model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    embeddings = model.encode(sentences)
    with open(EMBEDDINGS_FILE, "wb") as f:
        pickle.dump(embeddings, f)
    with open(INTENT_MAP_FILE, "wb") as f:
        pickle.dump(intent_map, f)
    print("✅ Sentence embeddings and intent map saved.")

    # Classifier Training
    X_classifier = model.encode(train_sentences_classifier)
    label_encoder = LabelEncoder()
    y_classifier = label_encoder.fit_transform(train_labels_classifier)
    X_train, X_test, y_train, y_test = train_test_split(X_classifier, y_classifier, test_size=0.2, random_state=42)
    classifier = XGBClassifier(use_label_encoder=False, eval_metric='mlogloss', random_state=42, max_depth=4, min_child_weight=3, subsample=0.8, colsample_bytree=0.8, reg_alpha=0.1, reg_lambda=1.0)
    classifier.fit(X_train, y_train)
    accuracy = classifier.score(X_test, y_test)
    print(f"✅ XGBoost Classifier trained. Accuracy on test set: {accuracy:.2f}")
    with open(CLASSIFIER_FILE, "wb") as f:
        pickle.dump(classifier, f)
    with open(ENCODER_FILE, "wb") as f:
        pickle.dump(label_encoder, f)
    print("✅ Classifier and label encoder saved.")
else:
    print("✅ Pre-trained embeddings and classifier found. Loading...")
    with open(EMBEDDINGS_FILE, "rb") as f:
        all_sentence_embeddings_inference = pickle.load(f)
    with open(INTENT_MAP_FILE, "rb") as f:
        intent_map_inference = pickle.load(f)
    with open(CLASSIFIER_FILE, "rb") as f:
        classifier_inference = pickle.load(f)
    with open(ENCODER_FILE, "rb") as f:
        label_encoder_inference = pickle.load(f)
    print("✅ Embeddings and classifier loaded.")

    # === Load data for inference and populate all_sentences_inference ===
    model_inference = SentenceTransformer(EMBEDDING_MODEL_NAME)
    with open(DATA_FILE, "r", encoding='utf-8') as f:
        intents_data_inference = json.load(f)
    intent_responses_inference = {}
    for intent_info in intents_data_inference["intents"]:
        intent_responses_inference[intent_info["intent"]] = intent_info["responses"]
        for example in intent_info["patterns"]:
            all_sentences_inference.append(example)

    # Load inference artifacts if they were pre-trained
    if os.path.exists(EMBEDDINGS_FILE) and os.path.exists(INTENT_MAP_FILE):
        with open(EMBEDDINGS_FILE, "rb") as f:
            all_sentence_embeddings_inference = pickle.load(f)
        with open(INTENT_MAP_FILE, "rb") as f:
            intent_map_inference = pickle.load(f)
    else:
        all_sentence_embeddings_inference = None
        intent_map_inference = None

    if os.path.exists(CLASSIFIER_FILE) and os.path.exists(ENCODER_FILE):
        with open(CLASSIFIER_FILE, "rb") as f:
            classifier_inference = pickle.load(f)
        with open(ENCODER_FILE, "rb") as f:
            label_encoder_inference = pickle.load(f)
    else:
        classifier_inference = None
        label_encoder_inference = None

    # === Toggle and Thresholds ===
    USE_HYBRID = True
    CLUSTERING_CONFIDENCE_THRESHOLD_HYBRID = 0.75
    CLASSIFIER_CONFIDENCE_THRESHOLD_HYBRID = 0.35
    COSINE_FALLBACK_THRESHOLD = 0.3

    # === Helper functions ===
    def generate_response_t5(query):
        return "Let me think... (T5 response goes here for now 😄)"

    def find_best_intent_cosine(user_embedding, intent_list):
        intent_embeddings_cosine = model_inference.encode(intent_list)
        scores = cosine_similarity(user_embedding, intent_embeddings_cosine)[0]
        best_index = np.argmax(scores)
        return intent_list[best_index], scores[best_index]

    def predict_intent_unsupervised_inference(user_input):
        if all_sentence_embeddings_inference is None or intent_map_inference is None:
            return None, 0.0
        user_embedding = model_inference.encode([user_input])
        similarities = cosine_similarity(user_embedding, all_sentence_embeddings_inference)[0]
        best_match_index = np.argmax(similarities)
        confidence = similarities[best_match_index]
        predicted_intent = intent_map_inference.get(all_sentences_inference[best_match_index])
        print(f"🔍 (Direct Match) Intent: {predicted_intent} | Similarity: {confidence:.2f}")
        return predicted_intent, confidence

    def predict_intent_supervised_inference(user_input):
        if classifier_inference is None or label_encoder_inference is None:
            return None, 0.0
        user_embedding = model_inference.encode([user_input])
        try:
            intent_probs = classifier_inference.predict_proba(user_embedding)[0]
            predicted_index = np.argmax(intent_probs)
            predicted_intent_label = label_encoder_inference.inverse_transform([predicted_index])[0]
            confidence = intent_probs[predicted_index]
            return predicted_intent_label, confidence
        except AttributeError as e:
            print(f"Error in predict_intent_supervised_inference: {e}")
            return None, 0.0

    @app.route('/api/chat', methods=['POST'])
    def chat():
        data = request.get_json()
        user_input = data.get('query')
        if not user_input:
            return jsonify({'response': 'Please send a message.'}), 400

        user_input_embedding = model_inference.encode([user_input])
        predicted_intent_primary = None
        confidence_primary = 0.0
        response = None
        secondary_intents = []
        secondary_responses = []

        predicted_intent_classifier, classifier_confidence = predict_intent_supervised_inference(user_input)
        print(f"🧠 (Classifier - XGBoost) Intent: {predicted_intent_classifier} | Confidence: {classifier_confidence:.2f}")

        predicted_intent_unsupervised, unsupervised_confidence = predict_intent_unsupervised_inference(user_input)

        if USE_HYBRID:
            if predicted_intent_classifier is not None and classifier_confidence > CLASSIFIER_CONFIDENCE_THRESHOLD_HYBRID:
                predicted_intent_primary = predicted_intent_classifier
                confidence_primary = classifier_confidence
                responses_primary = intent_responses_inference.get(predicted_intent_primary, ["Sorry, I don't have a response for that."])
                response = random.choice(responses_primary)
                print(f"✅ Chosen Response Source: Classifier | Primary Intent: {predicted_intent_primary} | Confidence: {confidence_primary:.2f}")
            elif predicted_intent_unsupervised is not None and unsupervised_confidence > CLUSTERING_CONFIDENCE_THRESHOLD_HYBRID:
                predicted_intent_primary = predicted_intent_unsupervised
                confidence_primary = unsupervised_confidence
                responses_primary = intent_responses_inference.get(predicted_intent_primary, ["Sorry, I don't have a response for that."])
                response = random.choice(responses_primary)
                print(f"✅ Chosen Response Source: Direct Match | Primary Intent: {predicted_intent_primary} | Similarity: {confidence_primary:.2f}")

        if predicted_intent_primary:
            for intent_info in intents_data_inference["intents"]:
                intent_name = intent_info["intent"]
                if intent_name != predicted_intent_primary:
                    for pattern in intent_info["patterns"]:
                        if pattern.lower() in user_input.lower():
                            secondary_intents.append(intent_name)
                            secondary_responses.extend(intent_info["responses"])
                            print(f"✨ Detected Secondary Intent: {intent_name} (based on keyword: '{pattern}')")
                            break

            if secondary_responses:
                response += " Also, regarding your other questions: " + random.choice(secondary_responses)

        if response is None:
            fallback_intent, score = find_best_intent_cosine(user_input_embedding, list(intent_responses_inference.keys()))
            print(f"⚠ Cosine Fallback (All Intents): Intent='{fallback_intent}' | Similarity={score:.2f}")
            if score > COSINE_FALLBACK_THRESHOLD:
                responses = intent_responses_inference.get(fallback_intent, ["Sorry, I don't have a response for that."])
                response = random.choice(responses)
                print(f"✅ Chosen Response Source: Cosine Fallback | Intent: {fallback_intent} | Similarity: {score:.2f}")
            else:
                response = generate_response_t5(user_input)
                print(f"✅ Chosen Response Source: T5 Fallback | Response: {response}")

        return jsonify({'answer': response})

    if __name__ == '__main__':
        app.run(debug=True, port=5000)