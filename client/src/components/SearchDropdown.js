import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquare, Eye, Clock, User, Tag, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

const SearchDropdown = ({ query, isVisible, onClose, onResultClick }) => {
  const navigate = useNavigate();
  const [results, setResults] = useState({ questions: [], answers: [], recommendations: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedAnswers, setExpandedAnswers] = useState(new Set());
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
    } catch (err) {
      console.error('Search error:', err);
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

  const toggleAnswerExpansion = (answerId, e) => {
    e.stopPropagation();
    setExpandedAnswers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(answerId)) {
        newSet.delete(answerId);
      } else {
        newSet.add(answerId);
      }
      return newSet;
    });
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
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-400 text-black font-semibold px-1 rounded-sm">$1</mark>');
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  if (!isVisible) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 bg-[#1e1e2f] border border-[#2a2a3f] rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto text-white"
    >
      {loading && (
        <div className="p-4 text-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 mt-2">Searching...</p>
        </div>
      )}

      {error && (
        <div className="p-4 text-center text-red-400">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="p-4">
          {(results.questions.length > 0 || results.answers.length > 0) && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                Search Results ({results.totalResults})
              </h3>

              {results.questions.map((question) => (
                <div
                  key={question._id}
                  className="p-3 hover:bg-[#2a2a3f] rounded-lg cursor-pointer transition-colors"
                  onClick={() => handleResultClick('question', question)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">Q</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4
                        className="text-sm font-medium text-blue-400 hover:text-blue-300 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: highlightText(question.title, query) }}
                      />
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {question.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center"><User size={12} className="mr-1" />{question.author?.username}</span>
                        <span className="flex items-center"><Clock size={12} className="mr-1" />{formatDate(question.createdAt)}</span>
                        <span className="flex items-center"><MessageSquare size={12} className="mr-1" />{question.answers?.length || 0} answers</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {results.answers.map((answer) => (
                <div
                  key={answer._id}
                  className="p-3 hover:bg-[#2a2a3f] rounded-lg transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">A</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-blue-400 hover:text-blue-300 cursor-pointer" onClick={() => handleResultClick('answer', answer)}>
                          Answer to: {answer.question?.title}
                        </h4>
                        <button
                          onClick={(e) => toggleAnswerExpansion(answer._id, e)}
                          className="text-gray-400 hover:text-white transition-colors p-1 answer-expand-button"
                          title={expandedAnswers.has(answer._id) ? "Hide answer" : "Show answer"}
                        >
                          {expandedAnswers.has(answer._id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                      
                      {/* Answer preview */}
                      <p
                        className="text-xs text-gray-400 mt-1 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: highlightText(stripHtml(answer.content).substring(0, 100), query) }}
                      />
                      
                      {/* Expanded answer content */}
                      {expandedAnswers.has(answer._id) && (
                        <div className="mt-3 p-3 bg-[#2a2a3f] rounded-lg border border-[#3a3a4f] expanded-answer-content">
                          <div 
                            className="text-sm text-gray-300 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: highlightText(answer.content, query) }}
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center"><User size={12} className="mr-1" />{answer.author?.username}</span>
                        <span className="flex items-center"><Clock size={12} className="mr-1" />{formatDate(answer.createdAt)}</span>
                        <button
                          onClick={() => handleResultClick('answer', answer)}
                          className="text-blue-400 hover:text-blue-300 text-xs font-medium"
                        >
                          View in context →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.recommendations && (
            <div className="space-y-4">
              {results.recommendations.matchingTags?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                    <Tag size={14} className="mr-1" /> Popular Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {results.recommendations.matchingTags.map((tag) => (
                      <span
                        key={tag.name}
                        className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs cursor-pointer hover:bg-blue-700"
                      >
                        {tag.name} ({tag.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {results.recommendations.recentQuestions?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                    <Clock size={14} className="mr-1" /> Recent Questions
                  </h3>
                  <div className="space-y-2">
                    {results.recommendations.recentQuestions.map((question) => (
                      <div
                        key={question._id}
                        className="p-2 hover:bg-[#2a2a3f] rounded cursor-pointer transition-colors"
                        onClick={() => handleResultClick('question', question)}
                      >
                        <h4 className="text-sm font-medium text-blue-400 hover:text-blue-300 line-clamp-1">
                          {question.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{question.author?.username}</span>
                          <span>{formatDate(question.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.recommendations.trendingQuestions?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                    <TrendingUp size={14} className="mr-1" /> Trending
                  </h3>
                  <div className="space-y-2">
                    {results.recommendations.trendingQuestions.map((question) => (
                      <div
                        key={question._id}
                        className="p-2 hover:bg-[#2a2a3f] rounded cursor-pointer transition-colors"
                        onClick={() => handleResultClick('question', question)}
                      >
                        <h4 className="text-sm font-medium text-blue-400 hover:text-blue-300 line-clamp-1">
                          {question.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center"><Eye size={12} className="mr-1" />{question.views || 0} views</span>
                          <span>{question.author?.username}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {results.totalResults === 0 && query.length >= 2 && (
            <div className="text-center py-4">
              <p className="text-gray-400">No results found for "{query}"</p>
              <p className="text-xs text-gray-500 mt-1">Try different keywords or check spelling</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
