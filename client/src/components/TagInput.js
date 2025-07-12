import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const TagInput = ({ tags = [], onChange, placeholder = "Add tags..." }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Fetch popular tags for suggestions
    fetchPopularTags();
  }, []);

  const fetchPopularTags = async () => {
    try {
      const response = await fetch('/api/questions/tags/popular');
      const data = await response.json();
      setSuggestions(data.tags.map(tag => tag._id));
    } catch (error) {
      console.error('Failed to fetch popular tags:', error);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const tag = inputValue.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      const newTags = [...tags, tag];
      onChange(newTags);
      setInputValue('');
    }
  };

  const removeTag = (index) => {
    const newTags = tags.filter((_, i) => i !== index);
    onChange(newTags);
  };

  const handleSuggestionClick = (suggestion) => {
    if (!tags.includes(suggestion)) {
      const newTags = [...tags, suggestion];
      onChange(newTags);
    }
  };

  return (
    <div className="tag-input-container">
      <div className="tag-input">
        {tags.map((tag, index) => (
          <span key={index} className="tag">
            {tag}
            <button
              type="button"
              className="tag-remove"
              onClick={() => removeTag(index)}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-0 border-none outline-none bg-transparent"
        />
      </div>
      
      {/* Suggestions */}
      {inputValue && suggestions.length > 0 && (
        <div className="tag-suggestions">
          {suggestions
            .filter(suggestion => 
              suggestion.includes(inputValue.toLowerCase()) && 
              !tags.includes(suggestion)
            )
            .slice(0, 5)
            .map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="tag-suggestion"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default TagInput; 