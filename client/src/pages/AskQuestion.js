import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RichTextEditor from '../components/RichTextEditor';
import TagInput from '../components/TagInput';
import axios from 'axios';
import toast from 'react-hot-toast';

const AskQuestion = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: []
  });
  const [loading, setLoading] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Ask a Question</h1>
        <p className="text-gray-600 mt-2">
          Share your knowledge and help others learn
        </p>
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
          <p className="text-sm text-gray-500 mt-1">
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
          <p className="text-sm text-gray-500 mt-1">
            Add up to 5 tags to help others find your question
          </p>
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
        <ul className="space-y-2 text-sm text-gray-600">
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