import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RichTextEditor from '../components/RichTextEditor';
import TagInput from '../components/TagInput';
import axios from 'axios';
import toast from 'react-hot-toast';

// Popular tags for quick selection
const POPULAR_TAGS = [
  // Programming Languages
  'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift',
  'typescript', 'kotlin', 'scala', 'r', 'dart', 'elixir', 'clojure', 'haskell',
  
  // Web Technologies
  'react', 'vue', 'angular', 'nodejs', 'express', 'django', 'flask', 'spring',
  'laravel', 'asp.net', 'jquery', 'bootstrap', 'tailwind', 'sass', 'less',
  
  // Databases
  'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'sql-server',
  'firebase', 'dynamodb', 'cassandra', 'neo4j',
  
  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github',
  'gitlab', 'terraform', 'ansible', 'nginx', 'apache',
  
  // Mobile Development
  'react-native', 'flutter', 'ios', 'android', 'xamarin', 'ionic',
  
  // Data Science & AI
  'machine-learning', 'deep-learning', 'tensorflow', 'pytorch', 'scikit-learn',
  'pandas', 'numpy', 'matplotlib', 'seaborn', 'jupyter',
  
  // Other Technologies
  'graphql', 'rest-api', 'websocket', 'microservices', 'serverless',
  'blockchain', 'ethereum', 'bitcoin', 'solidity',
  
  // General Programming
  'algorithms', 'data-structures', 'design-patterns', 'testing', 'tdd',
  'clean-code', 'refactoring', 'debugging', 'performance', 'security'
];

const AskQuestion = () => {
  const { user, canPost, isGuest } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: []
  });
  const [loading, setLoading] = useState(false);

  // Check if user can post
  if (!user) {
    navigate('/login');
    return null;
  }

  if (!canPost()) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            Guest Access Restricted
          </h1>
          <p className="text-text-secondary mb-6">
            Guest users can browse and read content but cannot post questions or answers.
            Please sign up for a full account to ask questions.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary"
            >
              Sign Up to Ask Questions
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn btn-secondary"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    
    if (formData.tags.length === 0) {
      toast.error('Please add at least one tag');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/questions', formData);
      toast.success('Question posted successfully!');
      navigate(`/question/${response.data.question._id}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to post question';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addPopularTag = (tag) => {
    if (!formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const getAvailablePopularTags = () => {
    return POPULAR_TAGS.filter(tag => !formData.tags.includes(tag));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Ask a Question</h1>
        <p className="text-text-secondary mt-2">
          Share your knowledge and help others learn
        </p>
        {user && (
          <div className="mt-2">
            <span className="text-sm text-text-muted">
              Posting as: {user.username} ({user.role})
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="form-input"
            placeholder="What's your question? Be specific."
            maxLength={200}
          />
          <p className="text-sm text-text-muted mt-1">
            {formData.title.length}/200 characters
          </p>
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description *
          </label>
          <RichTextEditor
            value={formData.description}
            onChange={(value) => handleInputChange('description', value)}
            placeholder="Provide all the information someone would need to answer your question..."
          />
        </div>

        {/* Tags */}
        <div className="form-group">
          <label htmlFor="tags" className="form-label">
            Tags *
          </label>
          <TagInput
            tags={formData.tags}
            onChange={(tags) => handleInputChange('tags', tags)}
            placeholder="Add tags (e.g., react, javascript, nodejs)"
          />
          <p className="text-sm text-text-muted mt-1">
            Add up to 5 tags to help others find your question
          </p>
          
          {/* Popular Tags */}
          {getAvailablePopularTags().length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-text-secondary mb-2">
                Popular tags:
              </p>
              <div className="flex flex-wrap gap-2">
                {getAvailablePopularTags().slice(0, 20).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addPopularTag(tag)}
                    className="px-3 py-1 text-sm bg-bg-secondary hover:bg-bg-tertiary text-text-secondary hover:text-text-primary rounded-full border border-border transition-colors duration-200"
                    disabled={formData.tags.length >= 5}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {getAvailablePopularTags().length > 20 && (
                <p className="text-xs text-text-muted mt-2">
                  Type to search for more tags...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? (
              <>
                <div className="spinner mr-2"></div>
                Posting...
              </>
            ) : (
              'Post Question'
            )}
          </button>
        </div>
      </form>

      {/* Guidelines */}
      <div className="card mt-8">
        <h3 className="card-title">Writing a good question</h3>
        <ul className="space-y-2 text-sm text-text-secondary">
          <li>• Be specific and provide enough context</li>
          <li>• Include code examples if relevant</li>
          <li>• Explain what you've tried and what didn't work</li>
          <li>• Use clear, descriptive language</li>
          <li>• Add relevant tags to help others find your question</li>
        </ul>
      </div>
    </div>
  );
};

export default AskQuestion; 