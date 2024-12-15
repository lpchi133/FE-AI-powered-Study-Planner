import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AISuggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await axios.get('/api/ai/suggestions');
        const data = Array.isArray(response.data) ? response.data : [];
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching AI suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  if (loading) {
    return <div>Loading suggestions...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">AI Suggestions</h2>
      {suggestions.length > 0 ? (
        <ul>
          {suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      ) : (
        <p>No suggestions available.</p>
      )}
    </div>
  );
};

export default AISuggestions;