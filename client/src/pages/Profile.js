import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Eye, ThumbsUp, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('questions');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, questionsRes, answersRes] = await Promise.all([
        axios.get('/api/users/profile'),
        axios.get('/api/users/questions'),
        axios.get('/api/users/answers')
      ]);

      setProfile(profileRes.data.user);
      setQuestions(questionsRes.data.questions);
      setAnswers(answersRes.data.answers);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-text-secondary">Profile not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="card">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.username}
                className="w-full h-full rounded-full"
              />
            ) : (
              profile.username.charAt(0).toUpperCase()
            )}
          </div>
          
          <div className="profile-info">
            <h1 className="text-2xl font-bold text-text-primary">{profile.username}</h1>
            <p className="text-text-secondary">Member since {new Date(profile.createdAt).toLocaleDateString()}</p>
            {profile.bio && (
              <p className="text-text-secondary mt-2">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="stat-item">
            <div className="stat-number">{questions.length}</div>
            <div className="stat-label">Questions</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{answers.length}</div>
            <div className="stat-label">Answers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{profile.reputation || 0}</div>
            <div className="stat-label">Reputation</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{profile.views || 0}</div>
            <div className="stat-label">Profile Views</div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="mt-8">
        <div className="flex border-b border-surface-border mb-6">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'questions'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Questions ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab('answers')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'answers'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Answers ({answers.length})
          </button>
        </div>

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-text-muted">No questions yet.</p>
              </div>
            ) : (
              questions.map((question) => (
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
                          <a
                            href={`/question/${question._id}`}
                            className="text-lg font-semibold text-primary hover:text-primary-hover transition-colors"
                          >
                            {question.title}
                          </a>
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
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Answers Tab */}
        {activeTab === 'answers' && (
          <div className="space-y-4">
            {answers.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-text-muted">No answers yet.</p>
              </div>
            ) : (
              answers.map((answer) => (
                <div key={answer._id} className={`answer ${answer.isAccepted ? 'accepted' : ''}`}>
                  <div className="flex gap-4">
                    {/* Vote Container */}
                    <div className="vote-container">
                      <div className="vote-count">{answer.voteCount || 0}</div>
                      <div className="text-xs text-text-muted">votes</div>
                    </div>

                    {/* Answer Content */}
                    <div className="flex-1">
                      <div className="answer-header">
                        <div className="answer-author">
                          <div className="text-sm text-text-muted">
                            Answered {formatDate(answer.createdAt)}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {answer.isAccepted && (
                            <div className="flex items-center gap-1 text-success">
                              <CheckCircle size={16} />
                              <span className="text-sm font-medium">Accepted</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <a
                          href={`/question/${answer.question._id}`}
                          className="text-lg font-semibold text-primary hover:text-primary-hover transition-colors"
                        >
                          {answer.question.title}
                        </a>
                      </div>

                      <div 
                        className="prose max-w-none text-text-primary line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: answer.content }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 