import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Chatbot.module.css';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const chatLogRef = useRef(null);

  const handleSendMessage = async () => {
    if (userInput.trim()) {
      const newMessage = { text: userInput, sender: 'user' };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setUserInput('');

      try {
        const response = await fetch('http://localhost:5000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: userInput }),
        });

        if (response.ok) {
          const data = await response.json();
          const botMessage = { text: data.answer, sender: 'bot' };
          setMessages((prevMessages) => [...prevMessages, botMessage]);
        } else {
          console.error('Error sending message to chatbot');
          const errorBotMessage = { text: 'Error communicating with chatbot.', sender: 'bot' };
          setMessages((prevMessages) => [...prevMessages, errorBotMessage]);
        }
      } catch (error) {
        console.error('Network error:', error);
        const networkErrorBotMessage = { text: 'Could not connect to chatbot.', sender: 'bot' };
        setMessages((prevMessages) => [...prevMessages, networkErrorBotMessage]);
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
    const greetings = [
      "Hello there! How can I help you with decals today?",
      "Hi! Welcome to Draco, your decal assistant!",
      "Greetings! What can I tell you about our decals?",
      "Hey! Ready to explore our awesome decal collection?",
      "Welcome! Ask me anything about our decals and customization options."
    ];
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    setMessages([{ text: randomGreeting, sender: 'bot' }]);
  }, []);

  const renderMessage = (message) => {
    const linkifiedText = message.text.replace(
      /\[(https?:\/\/[^\s]+)\]/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    return <div dangerouslySetInnerHTML={{ __html: linkifiedText }} />;
  };

  return (
    <div className={styles.chatbotContainer}>
      <div className={styles.chatLog} ref={chatLogRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`${styles.message} ${styles[msg.sender]}`}>
            {renderMessage(msg)}
          </div>
        ))}
      </div>
      <div className={styles.inputArea}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask something about decals"
        />
        <button onClick={handleSendMessage}>Ask</button>
      </div>
    </div>
  );
};

export default ChatbotPage;
