import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom'; 
import apiClient from '../api';
import { useAuth } from '../contexts/AuthContext';
import AlertMessage from '../components/AlertMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import { FileText, Tag, Send, ArrowLeft, PlusCircle, UserCircle } from 'lucide-react';

const CreatePostPage = () => {
  const { user } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation(); 
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    category: '', 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPostData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to create a post. Please log in and try again.");
      return;
    }
    if (!postData.title.trim() || !postData.content.trim()) {
      setError("Title and content are required fields. Please fill them out.");
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...postData,
        author: user.id, 
      };
      const response = await apiClient.post('/community/posts/', payload);
      setSuccess(`Post "${response.data.title}" created successfully! Redirecting...`);
      setPostData({ title: '', content: '', category: '' }); 
      setTimeout(() => navigate(`/forum/posts/${response.data.id}`), 2000); 
    } catch (err) {
      let errorMessages = [];
      if (err.response?.data) {
        const data = err.response.data;
        if (data.detail) {
            errorMessages.push(data.detail);
        } else {
            for (const key in data) {
                const fieldErrors = Array.isArray(data[key]) ? data[key].join(', ') : data[key];
                // Prepend field name for clarity, e.g., "Author: This field is required."
                errorMessages.push(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${fieldErrors}`);
            }
        }
      }
      setError(errorMessages.length > 0 ? errorMessages.join('; ') : 'Failed to create post. Please check your input and try again.');
      console.error("Create post error:", err.response?.data || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!user) {
    return (
        <div className="container mx-auto py-10 px-4 text-center">
            <AlertMessage type="error" message="You must be logged in to create a post." />
            <Link 
              to="/login" 
              state={{ from: location }} 
              className="mt-4 inline-block text-teal-600 hover:underline"
            >
              Login to Create Post
            </Link>
        </div>
    );
  }


  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Link to="/forum" className="inline-flex items-center text-teal-600 hover:text-teal-700 hover:underline mb-6 text-sm font-medium group">
        <ArrowLeft size={18} className="mr-1.5 group-hover:-translate-x-1 transition-transform" /> Back to Forum
      </Link>
      
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center flex items-center justify-center">
          <PlusCircle size={30} className="mr-3 text-teal-600" /> Create New Forum Post
        </h1>
        <div className="text-center text-sm text-gray-500 mb-8 flex items-center justify-center">
            <UserCircle size={16} className="mr-1.5 text-gray-400" />
            Posting as: <span className="font-medium ml-1">{user.name || user.email}</span>
        </div>

        {error && <AlertMessage type="error" message={error} onClose={() => setError('')} className="mb-6" />}
        {success && <AlertMessage type="success" message={success} className="mb-6" />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Post Title <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="title" 
              id="title" 
              required 
              value={postData.title} 
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm" 
              placeholder="Enter a clear and engaging title"
              aria-describedby="title-error"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FileText size={16} className="mr-1.5 text-gray-500" /> Content <span className="text-red-500">*</span>
            </label>
            <textarea 
              name="content" 
              id="content" 
              rows="10" 
              required 
              value={postData.content} 
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              placeholder="Write your post content here. Markdown might be supported by your backend."
              aria-describedby="content-error"
            ></textarea>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Tag size={16} className="mr-1.5 text-gray-500" /> Category (Optional)
            </label>
            <input 
                type="text" 
                name="category" 
                id="category" 
                value={postData.category} 
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                placeholder="e.g., Interview Tips, Career Advice" 
            />
          </div>

          <div className="pt-5">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400 transition-colors"
            >
              <Send size={18} className="mr-2" /> 
              {isSubmitting ? <LoadingSpinner size={20} text="Submitting Post..." /> : 'Submit Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;
