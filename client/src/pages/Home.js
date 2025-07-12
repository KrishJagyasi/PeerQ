import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Eye, Clock, User, CheckCircle, Crown, UserCheck } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Home = () => {
  const { user, canPost, canVote, canModerate, isGuest, isAdmin } = useAuth();
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

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="badge badge-admin flex items-center gap-1"><Crown size={12} /> Admin</span>;
      case 'user':
        return <span className="badge badge-user flex items-center gap-1"><UserCheck size={12} /> User</span>;
      case 'guest':
        return <span className="badge badge-guest">Guest</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Filters and Ask Question */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <button
            className={`px-4 py-2 rounded-lg border transition-colors ${sortBy === 'newest' ? 'bg-primary text-white' : 'bg-surface text-text-primary hover:bg-primary-light'}`}
            onClick={() => handleSortChange('newest')}
          >
            Newest
          </button>
          <button
            className={`px-4 py-2 rounded-lg border transition-colors ${sortBy === 'unanswered' ? 'bg-primary text-white' : 'bg-surface text-text-primary hover:bg-primary-light'}`}
            onClick={() => handleSortChange('unanswered')}
          >
            Unanswered
          </button>
          <button
            className={`px-4 py-2 rounded-lg border transition-colors ${sortBy === 'more' ? 'bg-primary text-white' : 'bg-surface text-text-primary hover:bg-primary-light'}`}
            onClick={() => handleSortChange('more')}
          >
            more ▾
          </button>
        </div>
        {canPost() && (
          <Link to="/ask" className="btn btn-primary">
            Ask New question
          </Link>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="card text-center py-12">
            <h3 className="text-xl font-semibold text-text-secondary mb-2">
              No questions found
            </h3>
            <p className="text-text-muted mb-4">
              {search ? 'Try adjusting your search terms' : 'Be the first to ask a question!'}
            </p>
            {canPost() && (
              <Link to="/ask" className="btn btn-primary">
                Ask Question
              </Link>
            )}
            {isGuest() && (
              <Link to="/login" className="btn btn-secondary">
                Sign Up to Ask
              </Link>
            )}
          </div>
        ) : (
          questions.map((question) => (
            <div key={question._id} className="card flex items-center justify-between p-4">
              <div className="flex-1 min-w-0">
                <Link
                  to={`/question/${question._id}`}
                  className="text-lg font-semibold text-primary hover:text-primary-hover transition-colors block truncate"
                >
                  {question.title}
                </Link>
                <div className="mt-2 text-text-secondary text-sm truncate">
                  {question.description.replace(/<[^>]*>/g, '').substring(0, 120)}...
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {question.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="badge badge-primary">
                      {tag}
                    </span>
                  ))}
                  {question.tags.length > 3 && (
                    <span className="text-text-muted text-xs">
                      +{question.tags.length - 3} more
                    </span>
                  )}
                  <span className="ml-4 text-xs text-text-muted flex items-center">
                    <User size={14} className="mr-1" />
                    {question.author?.username || 'User Name'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center ml-4">
                <span className="bg-primary text-white rounded-lg px-3 py-1 text-sm font-bold">
                  {question.answers?.length || 0} ans
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.total > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={!pagination.hasPrev}
            className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {'<'}
          </button>
          {Array.from({ length: pagination.total }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              onClick={() => handlePageChange(pg)}
              className={`px-3 py-1 rounded ${pg === page ? 'bg-primary text-white' : 'bg-surface text-text-primary hover:bg-primary-light'}`}
            >
              {pg}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={!pagination.hasNext}
            className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {'>'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Home; 