'use client';

import { useState } from 'react';

const FeedbackForm = () => {
  const [clientName, setClientName] = useState('');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !review) {
      setStatus('Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('client_name', clientName);
    formData.append('rating', rating.toString());
    formData.append('review', review);
    if (image) formData.append('scale_model_images', image);

    setStatus('Submitting...');

    const res = await fetch('/api/feedbacks', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      setStatus('Feedback submitted successfully!');
      setClientName('');
      setRating(5);
      setReview('');
      setImage(null);
    } else {
      setStatus('Failed to submit feedback.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-xl font-bold mb-4">Give Your Feedback</h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <label>
          Client Name*:
          <input
            type="text"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mt-1"
            required
          />
        </label>

        <label>
          Rating*:
          <select
            value={rating}
            onChange={e => setRating(parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded p-2 mt-1"
          >
            {[5, 4, 3, 2, 1].map(r => (
              <option key={r} value={r}>
                {r} Star{r > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </label>

        <label>
          Review*:
          <textarea
            value={review}
            onChange={e => setReview(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mt-1"
            rows={4}
            required
          />
        </label>

        <label>
          Upload Image:
          <input
            type="file"
            accept="image/*"
            onChange={e => {
              if (e.target.files?.[0]) setImage(e.target.files[0]);
            }}
            className="mt-1"
          />
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Submit Feedback
        </button>

        {status && <p className="mt-2 text-center">{status}</p>}
      </form>
    </div>
  );
};

export default FeedbackForm;
