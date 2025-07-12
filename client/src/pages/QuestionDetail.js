import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RichTextEditor from '../components/RichTextEditor';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Eye, 
  Clock, 
  User, 
  CheckCircle,
  Edit,
  Trash2
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const QuestionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const fetchQuestion = useCallback(async () => {
    try {
      setLoading(true);
      const [questionResponse, answersResponse] = await Promise.all([
        axios.get(`/api/questions/${id}`),
        axios.get(`/api/answers?questionId=${id}`)
      ]);
      
      setQuestion(questionResponse.data.question);
      setAnswers(answersResponse.data.answers);
    } catch (error) {
      console.error('Failed to fetch question:', error);
      toast.error('Failed to load question');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const handleVote = async (type, itemId, itemType = 'question') => {
    if (!user) {
      toast.error('Please log in to vote');
      return;
    }

    try {
      const endpoint = itemType === 'question' 
        ? `/api/questions/${itemId}/vote`
        : `/api/answers/${itemId}/vote`;
      
      const response = await axios.post(endpoint, { voteType: type });
      
      if (itemType === 'question') {
        setQuestion(prev => ({ ...prev, voteCount: response.data.voteCount }));
      } else {
        setAnswers(prev => 
          (prev || []).map(answer => 
            answer._id === itemId 
              ? { ...answer, voteCount: response.data.voteCount }
              : answer
          )
        );
      }
    } catch (error) {
      console.error('Failed to vote:', error);
      toast.error('Failed to vote');
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    if (!user || !question?.author?._id || question.author._id !== user._id) {
      toast.error('Only the question author can accept answers');
      return;
    }

    try {
      await axios.post(`/api/answers/${answerId}/accept`);
      setAnswers(prev => 
        (prev || []).map(answer => ({
          ...answer,
          isAccepted: answer._id === answerId
        }))
      );
      setQuestion(prev => ({ ...prev, isAnswered: true }));
      toast.success('Answer accepted!');
    } catch (error) {
      console.error('Failed to accept answer:', error);
      toast.error('Failed to accept answer');
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    
    if (!answerContent.trim()) {
      toast.error('Please enter an answer');
      return;
    }

    try {
      setSubmittingAnswer(true);
      const response = await axios.post('/api/answers', {
        content: answerContent,
        questionId: id
      });
      
      setAnswers(prev => [response.data.answer, ...(prev || [])]);
      setAnswerContent('');
      setShowAnswerForm(false);
      toast.success('Answer posted successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to post answer';
      toast.error(message);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await axios.delete(`/api/questions/${id}`);
      toast.success('Question deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Failed to delete question:', error);
      toast.error('Failed to delete question');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
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

  if (!question) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-text-secondary">Question not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Question */}
      <div className="card">
        <div className="flex gap-4">
          {/* Vote Container */}
          <div className="vote-container">
            <button
              onClick={() => handleVote('upvote', question?._id, 'question')}
              className={`vote-button ${
                question?.votes?.upvotes?.includes(user?._id) ? 'active' : ''
              }`}
            >
              <ThumbsUp size={20} />
            </button>
            <div className="vote-count">{question?.voteCount || 0}</div>
            <button
              onClick={() => handleVote('downvote', question?._id, 'question')}
              className={`vote-button ${
                question?.votes?.downvotes?.includes(user?._id) ? 'active' : ''
              }`}
            >
              <ThumbsDown size={20} />
            </button>
          </div>

          {/* Question Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold text-text-primary">{question?.title || 'Untitled Question'}</h1>
              <div className="flex items-center gap-2">
                {user && question?.author?._id === user._id && (
                  <>
                    <button
                      onClick={() => navigate(`/question/${id}/edit`)}
                      className="btn btn-outline btn-sm"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={handleDeleteQuestion}
                      className="btn btn-danger btn-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div 
              className="prose max-w-none mb-6 text-text-primary"
              dangerouslySetInnerHTML={{ __html: question.description || '' }}
            />

            <div className="flex items-center justify-between">
              <div className="question-tags">
                {question.tags && question.tags.map((tag) => (
                  <span key={tag} className="badge badge-primary mr-2">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="question-stats">
                <div className="flex items-center gap-1">
                  <MessageSquare size={14} />
                  <span>{answers?.length || 0} answers</span>
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
                  <span>{question.author?.username || 'Anonymous'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-primary">
            {answers?.length || 0} Answer{(answers?.length || 0) !== 1 ? 's' : ''}
          </h2>
          {user && (
            <button
              onClick={() => setShowAnswerForm(!showAnswerForm)}
              className="btn btn-primary"
            >
              {showAnswerForm ? 'Cancel' : 'Write Answer'}
            </button>
          )}
        </div>

        {/* Answer Form */}
        {showAnswerForm && (
          <div className="card mb-6">
            <h3 className="card-title">Your Answer</h3>
            <form onSubmit={handleSubmitAnswer}>
              <div className="form-group">
                <RichTextEditor
                  value={answerContent}
                  onChange={setAnswerContent}
                  placeholder="Write your answer here..."
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAnswerForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAnswer}
                  className="btn btn-primary"
                >
                  {submittingAnswer ? (
                    <>
                      <div className="spinner mr-2"></div>
                      Posting...
                    </>
                  ) : (
                    'Post Answer'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Answers List */}
        {!answers || answers.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-text-muted">No answers yet. Be the first to answer!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {answers.map((answer) => (
              <div key={answer._id} className={`answer ${answer.isAccepted ? 'accepted' : ''}`}>
                <div className="flex gap-4">
                  {/* Vote Container */}
                  <div className="vote-container">
                    <button
                      onClick={() => handleVote('upvote', answer._id, 'answer')}
                      className={`vote-button ${
                        answer.votes?.upvotes?.includes(user?._id) ? 'active' : ''
                      }`}
                    >
                      <ThumbsUp size={20} />
                    </button>
                    <div className="vote-count">{answer.voteCount || 0}</div>
                    <button
                      onClick={() => handleVote('downvote', answer._id, 'answer')}
                      className={`vote-button ${
                        answer.votes?.downvotes?.includes(user?._id) ? 'active' : ''
                      }`}
                    >
                      <ThumbsDown size={20} />
                    </button>
                  </div>

                  {/* Answer Content */}
                  <div className="flex-1">
                    <div className="answer-header">
                                              <div className="answer-author">
                          <div className="answer-avatar">
                            {answer.author?.avatar ? (
                              <img
                                src={answer.author.avatar}
                                alt={answer.author?.username || 'User'}
                                className="w-full h-full rounded-full"
                              />
                            ) : (
                              answer.author?.username?.charAt(0)?.toUpperCase() || 'U'
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-text-primary">
                              {answer.author?.username || 'Anonymous'}
                            </div>
                            <div className="text-sm text-text-muted">
                              {formatDate(answer.createdAt)}
                            </div>
                          </div>
                        </div>
                      
                      <div className="flex items-center gap-2">
                        {answer.isAccepted && (
                          <div className="flex items-center gap-1 text-success">
                            <CheckCircle size={16} />
                            <span className="text-sm font-medium">Accepted</span>
                          </div>
                        )}
                        {user && question?.author?._id === user._id && !answer.isAccepted && (
                          <button
                            onClick={() => handleAcceptAnswer(answer._id)}
                            className="btn btn-success btn-sm"
                          >
                            Accept
                          </button>
                        )}
                      </div>
                    </div>

                    <div 
                      className="prose max-w-none text-text-primary"
                      dangerouslySetInnerHTML={{ __html: answer.content || '' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetail; 