import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api'; 
import { useAuth } from '../contexts/AuthContext'; 
import LoadingSpinner from '../components/LoadingSpinner'; 
import AlertMessage from '../components/AlertMessage'; 
import { Briefcase, Users, Edit3, Trash2, PlusCircle, Eye, List, Info } from 'lucide-react';

const EmployerJobPostCard = ({ post, onDelete }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-semibold text-teal-700 mb-2 hover:text-teal-800">
            <Link to={`/jobs/${post.id}`}>{post.title}</Link>
        </h2>
        <p className="text-sm text-gray-500 mb-1">
            Status: <span className={`font-medium ${post.is_active ? 'text-green-600' : 'text-red-600'}`}>{post.is_active ? 'Active' : 'Inactive'}</span>
        </p>
        <p className="text-sm text-gray-500 mb-3">Posted: {new Date(post.posted_at).toLocaleDateString()}</p>
        <p className="text-sm text-gray-600 mb-2">
            Applications: {post.applications_count !== undefined ? post.applications_count : <span className="italic text-xs">N/A</span>} 
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
        <Link to={`/jobs/${post.id}`} className="flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 transition-colors">
          <Eye size={14} className="mr-1.5" /> View Posting
        </Link>
        <Link to={`/jobs/${post.id}/applications`} className="flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors">
          <Users size={14} className="mr-1.5" /> View Applications
        </Link>
      </div>
    </div>
  );
};

const EmployerJobPostsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [jobPosts, setJobPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobPosts = async () => {
    if (!user || user.role !== 'employer') {
      setError("Access denied. You must be logged in as an employer to view your job posts.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      // Calls the new dedicated endpoint for employer's own posts
      const response = await apiClient.get('/jobs/posts/my-posts/'); 
      setJobPosts(response.data.results || response.data || []); 
    } catch (err) {
      console.error("Failed to fetch employer job posts:", err);
      setError('Failed to load your job posts. Please try again.');
      setJobPosts([]); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) { 
        fetchJobPosts();
    } else if (!authLoading && !user) { 
        setError("Please log in as an employer to view this page.");
        setIsLoading(false);
    }
  }, [user, authLoading]);

  if (isLoading || authLoading) return (
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)]">
      <LoadingSpinner size={48} text="Loading Your Job Posts..." />
    </div>
  );

  if (error) return (
    <div className="container mx-auto py-10 px-4">
        <AlertMessage type="error" message={error} onClose={() => setError('')} />
        {(!user || user.role !== 'employer') && <Link to="/login" className="mt-4 inline-block text-teal-600 hover:underline">Login as Employer</Link>}
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center mb-3 sm:mb-0">
          <List size={32} className="mr-3 text-teal-600" /> Your Job Postings
        </h1>
        <Link to="/jobs/create" className="px-4 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium flex items-center self-start sm:self-auto shadow hover:shadow-md">
          <PlusCircle size={18} className="mr-2" /> Post New Job
        </Link>
      </div>

      {jobPosts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-md">
          <Info size={56} className="mx-auto text-gray-300 mb-5" />
          <p className="text-xl text-gray-600 font-semibold">You haven't posted any jobs yet.</p>
          <p className="text-gray-500 mt-2">Click "Post New Job" to get started and find great candidates!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
          {jobPosts.map(post => (
            <EmployerJobPostCard 
              key={post.id} 
              post={post} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployerJobPostsPage;
