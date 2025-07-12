import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Eye, Clock, User, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Home = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [sortBy, setSortBy] = useState('newest');
  const [selectedTag, setSelectedTag] = useState('');
  const [popularTags, setPopularTags] = useState([]);

  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    fetchQuestions();
    fetchPopularTags();
  }, [search, page, sortBy, selectedTag]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        sort: sortBy,
        ...(search && { search }),
        ...(selectedTag && { tag: selectedTag })
      });

      const response = await axios.get(`/api/questions?${params}`);
      setQuestions(response.data.questions);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularTags = async () => {
    try {
      const response = await axios.get('/api/questions/tags/popular');
      setPopularTags(response.data.tags);
    } catch (error) {
      console.error('Failed to fetch popular tags:', error);
    }
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setSearchParams({ ...Object.fromEntries(searchParams), sort: newSort, page: 1 });
  };

  const handleTagClick = (tag) => {
    setSelectedTag(selectedTag === tag ? '' : tag);
    setSearchParams({ ...Object.fromEntries(searchParams), tag: selectedTag === tag ? '' : tag, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ ...Object.fromEntries(searchParams), page: newPage });
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            {search ? `Search results for "${search}"` : 'All Questions'}
          </h1>
          <p className="text-text-secondary mt-2">
            {pagination.total ? `${pagination.total} questions` : 'No questions found'}
          </p>
        </div>
        {user && (
          <Link to="/ask" className="btn btn-primary">
            Ask Question
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="card-title">Sort by</h3>
            <div className="space-y-2">
              {[
                { value: 'newest', label: 'Newest' },
                { value: 'oldest', label: 'Oldest' },
                { value: 'votes', label: 'Most Voted' },
                { value: 'views', label: 'Most Viewed' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    sortBy === option.value
                      ? 'bg-primary-light text-primary-dark'
                      : 'hover:bg-background-secondary text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card mt-4">
            <h3 className="card-title">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.slice(0, 10).map((tag) => (
                <button
                  key={tag._id}
                  onClick={() => handleTagClick(tag._id)}
                  className={`badge ${
                    selectedTag === tag._id ? 'badge-primary' : ''
                  } cursor-pointer hover:scale-105 transition-transform`}
                >
                  {tag._id} ({tag.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="lg:col-span-3">
          {questions.length === 0 ? (
            <div className="card text-center py-12">
              <h3 className="text-xl font-semibold text-text-secondary mb-2">
                No questions found
              </h3>
              <p className="text-text-muted mb-4">
                {search ? 'Try adjusting your search terms' : 'Be the first to ask a question!'}
              </p>
              {user && (
                <Link to="/ask" className="btn btn-primary">
                  Ask Question
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question._id} className="card question-item">
                  <div className="flex gap-4">
                    {/* Vote Stats */}
                    <div className="vote-container">
                      <div className="vote-count">{question.voteCount || 0}</div>
                      <div className="text-xs text-text-muted">votes</div>
                    </div>

                    {/* Question Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link
                            to={`/question/${question._id}`}
                            className="text-lg font-semibold text-primary hover:text-primary-hover transition-colors"
                          >
                            {question.title}
                          </Link>
                          {question.isAnswered && (
                            <CheckCircle className="inline-block ml-2 text-success" size={16} />
                          )}
                        </div>
                      </div>

                      <div className="mt-2 text-text-secondary line-clamp-2">
                        {question.description.replace(/<[^>]*>/g, '').substring(0, 200)}...
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="question-tags">
                          {question.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="badge badge-primary mr-2">
                              {tag}
                            </span>
                          ))}
                          {question.tags.length > 3 && (
                            <span className="text-text-muted text-sm">
                              +{question.tags.length - 3} more
                            </span>
                          )}
                        </div>

                        <div className="question-stats">
                          <div className="flex items-center gap-1">
                            <MessageSquare size={14} />
                            <span>{question.answers?.length || 0} answers</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye size={14} />
                            <span>{question.views || 0} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{formatDate(question.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User size={14} />
                            <span>{question.author?.username}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.total > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={!pagination.hasPrev}
                className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="text-text-secondary">
                Page {page} of {pagination.total}
              </span>
              
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={!pagination.hasNext}
                className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home; 