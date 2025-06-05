import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api'; 
import { useAuth } from '../contexts/AuthContext'; 
import LoadingSpinner from '../components/LoadingSpinner'; 
import AlertMessage from '../components/AlertMessage'; 
import { Briefcase, Users, FilePlus, Eye, Building } from 'lucide-react'; 

const EmployerDashboardPage = () => {
  const { user } = useAuth();
  const [jobPosts, setJobPosts] = useState([]);
  const [applicationsCount, setApplicationsCount] = useState(0); 
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user || user.role !== 'employer') {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError('');
      try {
        // Fetch job posts by this employer
        const jobsRes = await apiClient.get('/jobs/posts/'); 
        const posts = jobsRes.data.results || jobsRes.data;
        setJobPosts(posts);

  
        let totalApps = 0;
        if (posts.length > 0) {
          
          // Consider a backend endpoint like /api/employer/dashboard-summary/
          const appCountPromises = posts.map(post =>
            apiClient.get(`/jobs/applications/`, { params: { job_id: post.id, limit: 1 } }) 
              .then(res => res.data.count || (res.data.results || res.data).length) 
              .catch(() => 0) 
          );
          const counts = await Promise.all(appCountPromises);
          totalApps = counts.reduce((sum, count) => sum + count, 0);
        }
        setApplicationsCount(totalApps);

      } catch (err) {
        console.error("Failed to fetch employer dashboard data:", err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)]">
      <LoadingSpinner size={48} text="Loading Employer Dashboard..." />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-0">Employer Dashboard</h1>
        <Link to="/jobs/create" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium flex items-center self-start sm:self-center">
            <FilePlus size={16} className="mr-2"/> Post New Job
        </Link>
      </div>

      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} className="mb-6" />}

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center">
            <Building size={48} className="text-indigo-600 mr-4 mb-3 sm:mb-0 flex-shrink-0" />
            <div>
                <h2 className="text-2xl font-semibold text-gray-700">Welcome, {user?.name || user?.email}!</h2>
                <p className="text-gray-500">Manage your job postings and connect with talent.</p>
            </div>
        </div>
      </div>

      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
          <Briefcase size={36} className="text-blue-500 mx-auto mb-3" />
          <p className="text-4xl font-bold text-gray-700">{jobPosts.length}</p>
          <p className="text-gray-500 mt-1">Your Job Posts</p>
          <Link to="/jobs/my-posts" className="text-sm text-blue-600 hover:underline mt-3 block font-medium">Manage Posts</Link>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
          <Users size={36} className="text-green-500 mx-auto mb-3" />
          <p className="text-4xl font-bold text-gray-700">{applicationsCount}</p>
          <p className="text-gray-500 mt-1">Total Applications (Approx.)</p>
           
          <Link to="/jobs/my-posts" className="text-sm text-blue-600 hover:underline mt-3 block font-medium">View All Applications</Link>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg text-center flex flex-col items-center justify-center hover:shadow-xl transition-shadow">
          <FilePlus size={36} className="text-indigo-500 mx-auto mb-3" />
          <p className="text-gray-500 mt-1 mb-3">Ready to find new talent?</p>
          <Link
            to="/jobs/create"
            className="w-full mt-auto px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Post a New Job
          </Link>
        </div>
      </div>

      {/* Recent Job Posts List */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Recent Job Posts</h2>
        {jobPosts.length > 0 ? (
          <ul className="space-y-4">
            {jobPosts.slice(0, 5).map(post => ( 
              <li key={post.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between sm:items-center">
                <div className="mb-2 sm:mb-0">
                  <Link to={`/jobs/${post.id}`} className="text-lg font-medium text-blue-600 hover:underline">{post.title}</Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Status: <span className={post.is_active ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{post.is_active ? 'Active' : 'Inactive'}</span> | Posted: {new Date(post.posted_at).toLocaleDateString()}
                  </p>
                </div>
                <Link to={`/jobs/${post.id}/applications`} className="text-sm text-indigo-600 hover:underline flex items-center font-medium py-1 px-3 rounded-md hover:bg-indigo-50 self-start sm:self-center">
                  <Eye size={16} className="mr-1.5" /> View Applications
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 py-4 text-center">You haven't posted any jobs yet. Get started by posting one!</p>
        )}
         {jobPosts.length > 5 && (
            <Link to="/jobs/my-posts" className="mt-6 inline-block text-blue-600 hover:underline font-medium">
                View all your job posts &rarr;
            </Link>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboardPage;
