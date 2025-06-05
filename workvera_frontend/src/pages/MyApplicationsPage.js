// src/pages/MyApplicationsPage.js (Seeker's view of their applications)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api'; 
import LoadingSpinner from '../components/LoadingSpinner'; 
import AlertMessage from '../components/AlertMessage'; 
import { useAuth } from '../contexts/AuthContext'; 
import { Briefcase, CalendarCheck2, Info, Eye, Building, Clock, ChevronRight } from 'lucide-react'; // Added ChevronRight

const MyApplicationCard = ({ application }) => {
  const statusColors = {
    submitted: 'bg-blue-100 text-blue-700 border-blue-300',
    reviewed: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    shortlisted: 'bg-purple-100 text-purple-700 border-purple-300',
    interviewing: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    offered: 'bg-green-100 text-green-700 border-green-300',
    rejected: 'bg-red-100 text-red-700 border-red-300',
    withdrawn: 'bg-gray-100 text-gray-700 border-gray-300',
  };
  // Ensure application and application.status are defined before trying to access properties
  const statusText = application && application.status 
    ? application.status.charAt(0).toUpperCase() + application.status.slice(1) 
    : 'Unknown';
  const currentStatusColor = application && application.status 
    ? statusColors[application.status] || statusColors.submitted 
    : statusColors.submitted;

  // Defensive checks for application object and its nested properties
  const jobTitle = application?.job_detail?.title || 'Job Title Missing';
  const jobId = application?.job_detail?.id || application?.job; // Fallback to application.job if job_detail is not there
  const companyName = application?.job_detail?.employer_detail?.name || 'Company Not Specified';

  if (!application || typeof application !== 'object') {
    console.error("MyApplicationCard received invalid application data:", application);
    return <div className="bg-red-50 p-4 rounded-md text-red-700 border border-red-200">Error: Invalid application data.</div>;
  }


  return (
    <div className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 flex flex-col justify-between h-full group">
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
          <h2 className="text-xl font-semibold text-teal-700 mb-1 sm:mb-0 group-hover:text-teal-800 transition-colors">
            <Link to={`/jobs/${jobId}`}>{jobTitle}</Link>
          </h2>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${currentStatusColor} self-start sm:self-center whitespace-nowrap`}>
            {statusText}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-1 flex items-center">
          <Building size={14} className="mr-1.5 text-gray-400 flex-shrink-0" /> 
          {companyName}
        </p>
        <p className="text-sm text-gray-500 mb-3 flex items-center">
          <Clock size={14} className="mr-1.5 text-gray-400 flex-shrink-0" /> 
          Applied on: {application.applied_at ? new Date(application.applied_at).toLocaleDateString() : 'N/A'}
        </p>
        {application.cover_letter && (
          <details className="mb-3 group/details">
            <summary className="text-xs text-gray-500 hover:underline cursor-pointer font-medium list-none flex items-center">
                Cover Letter Snippet 
                <ChevronRight size={14} className="ml-1 group-hover/details:rotate-90 transition-transform"/>
            </summary>
            <p className="text-xs text-gray-600 italic mt-1 p-2 bg-slate-50 rounded-md border border-slate-100 line-clamp-3" title={application.cover_letter}>
                {application.cover_letter}
            </p>
          </details>
        )}
      </div>
      <div className="mt-auto pt-3 border-t border-gray-100">
        <Link 
          to={`/jobs/${jobId}`}
          className="text-sm text-teal-600 hover:text-teal-700 hover:underline flex items-center font-medium group/link"
        >
          <Eye size={16} className="mr-1.5" /> View Original Job Posting 
          <ChevronRight size={16} className="ml-auto opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all duration-200"/>
        </Link>
      </div>
    </div>
  );
};

const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState('');
  const { user, loading: authLoading } = useAuth(); // Added authLoading

  useEffect(() => {
    // Wait for authentication to resolve before fetching
    if (authLoading) {
      return; 
    }

    const fetchApplications = async () => {
      if (!user || user.role !== 'seeker') {
        setError("You must be logged in as a seeker to view applications.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError('');
      try {
        const response = await apiClient.get('/jobs/applications/'); 
        setApplications(response.data.results || response.data || []); 
      } catch (err) {
        console.error("Failed to fetch applications:", err);
        setError('Failed to load your applications. Please try again.');
        setApplications([]); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplications();
  }, [user, authLoading]); // Depend on user and authLoading

  if (isLoading || authLoading) return ( // Show loader if either data is loading or auth is still loading
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)]">
      <LoadingSpinner size={48} text="Loading Your Applications..." />
    </div>
  );
  
  if (error) return (
    <div className="container mx-auto py-10 px-4">
        <AlertMessage type="error" message={error} onClose={() => setError('')} />
        {!user && <Link to="/login" className="mt-4 inline-block text-teal-600 hover:underline">Login</Link>}
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center mb-3 sm:mb-0">
          <CalendarCheck2 size={32} className="mr-3 text-teal-600" /> My Job Applications
        </h1>
        <Link to="/jobs" className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors text-sm font-medium flex items-center self-start sm:self-auto shadow hover:shadow-md">
            <Briefcase size={16} className="mr-2"/> Find More Jobs
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-md">
          <Info size={56} className="mx-auto text-gray-300 mb-5" />
          <p className="text-xl text-gray-600 font-semibold">You haven't applied for any jobs yet.</p>
          <p className="text-gray-500 mt-2">Start your job search and track your applications here.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
          {applications.map(app => (
            <MyApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}
      {/* TODO: Add pagination if needed */}
    </div>
  );
};

export default MyApplicationsPage;
