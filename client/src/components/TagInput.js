import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

const TagInput = ({ tags = [], onChange, placeholder = 'Add tags...', maxTags = 5 }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`/api/questions/tags/search?q=${encodeURIComponent(query)}`);
      const filteredSuggestions = response.data.tags
        .filter(tag => !tags.includes(tag))
        .slice(0, 10);
      setSuggestions(filteredSuggestions);
    } catch (error) {
      console.error('Failed to fetch tag suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.includes(',')) {
      const newTag = value.replace(',', '').trim();
      if (newTag && !tags.includes(newTag)) {
        addTag(newTag);
      }
      setInputValue('');
    } else {
      fetchSuggestions(value);
      setShowSuggestions(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        addTag(newTag);
        setInputValue('');
        setShowSuggestions(false);
      }
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const addTag = (tag) => {
    const cleanTag = tag.toLowerCase().trim().replace(/\s+/g, '-');
    if (cleanTag && !tags.includes(cleanTag) && tags.length < maxTags) {
      onChange([...tags, cleanTag]);
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSuggestionClick = (suggestion) => {
    addTag(suggestion);
    setInputValue('');
    setShowSuggestions(false);
  };

  return (
    <div className="tag-input-container">
      <div className="tag-input">
        {tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="tag-remove"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-text-primary placeholder-text-muted"
          disabled={tags.length >= maxTags}
        />
      </div>

      {showSuggestions && (suggestions.length > 0 || loading) && (
        <div ref={suggestionsRef} className="tag-suggestions">
          {loading ? (
            <div className="p-4 text-center text-text-muted">
              <div className="spinner mx-auto"></div>
            </div>
          ) : (
            suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="tag-suggestion"
              >
                {suggestion}
              </button>
            ))
          )}
        </div>
      )}

      {tags.length >= maxTags && (
        <p className="text-sm text-text-muted mt-2">
          Maximum {maxTags} tags allowed
        </p>
      )}
    </div>
  );
};

export default TagInput; 