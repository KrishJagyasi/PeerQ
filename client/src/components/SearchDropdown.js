import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MessageSquare, Eye, Clock, User, Tag, TrendingUp } from 'lucide-react';
import axios from 'axios';

const SearchDropdown = ({ query, isVisible, onClose, onResultClick }) => {
  const navigate = useNavigate();
  const [results, setResults] = useState({ questions: [], answers: [], recommendations: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (query.length >= 2 && isVisible) {
      performSearch();
    } else {
      setResults({ questions: [], answers: [], recommendations: {} });
    }
  }, [query, isVisible]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  const performSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/questions/search/comprehensive?q=${encodeURIComponent(query)}&limit=5`);
      setResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (type, item) => {
    onResultClick();
    if (type === 'question') {
      navigate(`/question/${item._id}`);
    } else if (type === 'answer') {
      navigate(`/question/${item.question._id}#answer-${item._id}`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
  };

  if (!isVisible) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
    >
      {loading && (
        <div className="p-4 text-center">
          <div className="spinner mx-auto"></div>
          <p className="text-text-muted mt-2">Searching...</p>
        </div>
      )}

      {error && (
        <div className="p-4 text-center text-red-600">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="p-4">
          {/* Search Results */}
          {(results.questions.length > 0 || results.answers.length > 0) && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-text-secondary mb-2">
                Search Results ({results.totalResults})
              </h3>
              
              {/* Questions */}
              {results.questions.map((question) => (
                <div 
                  key={question._id} 
                  className="p-3 hover:bg-background-secondary rounded-lg cursor-pointer transition-colors"
                  onClick={() => handleResultClick('question', question)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">Q</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 
                        className="text-sm font-medium text-primary hover:text-primary-hover line-clamp-2"
                        dangerouslySetInnerHTML={{ 
                          __html: highlightText(question.title, query) 
                        }}
                      />
                      <p className="text-xs text-text-muted mt-1 line-clamp-2">
                        {question.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-text-muted flex items-center">
                          <User size={12} className="mr-1" />
                          {question.author?.username}
                        </span>
                        <span className="text-xs text-text-muted flex items-center">
                          <Clock size={12} className="mr-1" />
                          {formatDate(question.createdAt)}
                        </span>
                        <span className="text-xs text-text-muted flex items-center">
                          <MessageSquare size={12} className="mr-1" />
                          {question.answers?.length || 0} answers
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Answers */}
              {results.answers.map((answer) => (
                <div 
                  key={answer._id} 
                  className="p-3 hover:bg-background-secondary rounded-lg cursor-pointer transition-colors"
                  onClick={() => handleResultClick('answer', answer)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">A</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-primary hover:text-primary-hover">
                        Answer to: {answer.question?.title}
                      </h4>
                      <p 
                        className="text-xs text-text-muted mt-1 line-clamp-2"
                        dangerouslySetInnerHTML={{ 
                          __html: highlightText(answer.content.substring(0, 100), query) 
                        }}
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-text-muted flex items-center">
                          <User size={12} className="mr-1" />
                          {answer.author?.username}
                        </span>
                        <span className="text-xs text-text-muted flex items-center">
                          <Clock size={12} className="mr-1" />
                          {formatDate(answer.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {results.recommendations && (
            <div className="space-y-4">
              {/* Matching Tags */}
              {results.recommendations.matchingTags && results.recommendations.matchingTags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-text-secondary mb-2 flex items-center">
                    <Tag size={14} className="mr-1" />
                    Popular Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {results.recommendations.matchingTags.map((tag) => (
                      <span 
                        key={tag.name}
                        className="badge badge-primary text-xs cursor-pointer hover:bg-primary-hover"
                      >
                        {tag.name} ({tag.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Questions */}
              {results.recommendations.recentQuestions && results.recommendations.recentQuestions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-text-secondary mb-2 flex items-center">
                    <Clock size={14} className="mr-1" />
                    Recent Questions
                  </h3>
                  <div className="space-y-2">
                    {results.recommendations.recentQuestions.map((question) => (
                      <div 
                        key={question._id}
                        className="p-2 hover:bg-background-secondary rounded cursor-pointer transition-colors"
                        onClick={() => handleResultClick('question', question)}
                      >
                        <h4 className="text-sm font-medium text-primary hover:text-primary-hover line-clamp-1">
                          {question.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-text-muted">
                            {question.author?.username}
                          </span>
                          <span className="text-xs text-text-muted">
                            {formatDate(question.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Questions */}
              {results.recommendations.trendingQuestions && results.recommendations.trendingQuestions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-text-secondary mb-2 flex items-center">
                    <TrendingUp size={14} className="mr-1" />
                    Trending
                  </h3>
                  <div className="space-y-2">
                    {results.recommendations.trendingQuestions.map((question) => (
                      <div 
                        key={question._id}
                        className="p-2 hover:bg-background-secondary rounded cursor-pointer transition-colors"
                        onClick={() => handleResultClick('question', question)}
                      >
                        <h4 className="text-sm font-medium text-primary hover:text-primary-hover line-clamp-1">
                          {question.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-text-muted flex items-center">
                            <Eye size={12} className="mr-1" />
                            {question.views || 0} views
                          </span>
                          <span className="text-xs text-text-muted">
                            {question.author?.username}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Results */}
          {results.totalResults === 0 && query.length >= 2 && (
            <div className="text-center py-4">
              <p className="text-text-muted">No results found for "{query}"</p>
              <p className="text-xs text-text-muted mt-1">Try different keywords or check spelling</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown; 