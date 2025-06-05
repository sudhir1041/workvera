import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api'; 
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage'; 
import { useAuth } from '../contexts/AuthContext'; 
import { Users, UserCheck, Mail, FileText, Award, Briefcase, Eye, Download, MessageCircle } from 'lucide-react';

const CandidateCard = ({ application, onStatusUpdate }) => {
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false); // For future status update UI

  // Example status update handler (needs backend integration)
  const handleUpdateStatus = async (newStatus) => {
    setIsUpdatingStatus(true);
    try {
      await apiClient.patch(`/jobs/applications/${application.id}/`, { status: newStatus });
      onStatusUpdate(application.id, newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
      // Show error to user
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const statusColors = {
    submitted: 'bg-blue-100 text-blue-700 border-blue-300',
    reviewed: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    shortlisted: 'bg-purple-100 text-purple-700 border-purple-300',
    interviewing: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    offered: 'bg-green-100 text-green-700 border-green-300',
    rejected: 'bg-red-100 text-red-700 border-red-300',
    withdrawn: 'bg-gray-100 text-gray-700 border-gray-300',
  };
  const currentStatusText = application.status.charAt(0).toUpperCase() + application.status.slice(1);


  return (
    <div className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
        <div className="flex items-center mb-2 sm:mb-0">
          <UserCheck size={28} className="mr-3 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{application.user_detail?.name || 'Candidate Name'}</h3>
            <a href={`mailto:${application.user_detail?.email}`} className="text-xs text-blue-500 hover:underline flex items-center" title={`Email ${application.user_detail?.name}`}>
              <Mail size={12} className="mr-1" /> {application.user_detail?.email}
            </a>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusColors[application.status] || statusColors.submitted} self-start sm:self-auto`}>
          {currentStatusText}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-1">Applied: {new Date(application.applied_at).toLocaleDateString()}</p>
      
      {/* Links to Resume/Profile - assuming profile is part of user_detail */}
      {application.user_detail?.profile?.resume && ( 
        <a 
          href={application.user_detail.profile.resume} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs text-green-600 hover:text-green-700 hover:underline flex items-center my-2 font-medium py-1 px-2 bg-green-50 rounded-md border border-green-200 w-fit"
        >
          <Download size={12} className="mr-1.5" /> View Resume
        </a>
      )}
      
      <Link to={`/candidate-profile/${application.user_detail?.id}`} className="text-xs text-indigo-500 hover:underline block my-1">View Full Profile</Link>

      {application.cover_letter && (
        <div className="mt-3">
          <button onClick={() => setShowCoverLetter(!showCoverLetter)} className="text-xs text-gray-600 hover:underline font-medium flex items-center">
            <MessageCircle size={14} className="mr-1" /> {showCoverLetter ? 'Hide' : 'Show'} Cover Letter
          </button>
          {showCoverLetter && (
            <p className="text-xs text-gray-700 mt-1.5 p-3 bg-gray-50 rounded-md border border-gray-200 italic leading-relaxed">
              {application.cover_letter}
            </p>
          )}
        </div>
      )}

      {/* Placeholder for status update actions */}
       <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-500 mb-1">Actions:</p>
        <select 
          // onChange={(e) => handleUpdateStatus(e.target.value)} 
          // value={application.status}
          // disabled={isUpdatingStatus}
          className="text-xs p-1 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500"
        >
          {Object.keys(statusColors).map(statusKey => (
            <option key={statusKey} value={statusKey}>{statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}</option>
          ))}
        </select>
        {isUpdatingStatus && <LoadingSpinner size={16} text="Updating..." className="inline-flex ml-2"/>}
      </div> 
    </div>
  );
};

const JobApplicationsPage = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState('');
  const { user } = useAuth(); 

  useEffect(() => {
    const fetchJobAndApplications = async () => {
      if (!user || user.role !== 'employer') {
        setError("You must be logged in as an employer to view applications.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError('');
      try {
        const [jobRes, appsRes] = await Promise.all([
          apiClient.get(`/jobs/posts/${jobId}/`), 
          apiClient.get(`/jobs/applications/`, { params: { job_id: jobId } }) // Fetch applications for this job
        ]);
        
        // Ensure the current employer owns this job post
        if (jobRes.data.employer !== user.id) {
            setError("You do not have permission to view applications for this job.");
            setJobDetails(null);
            setApplications([]);
        } else {
            setJobDetails(jobRes.data);
            setApplications(appsRes.data.results || appsRes.data || []); 
        }

      } catch (err) {
        console.error("Failed to fetch job applications:", err);
        setError('Failed to load applications for this job. Please ensure the job exists and you have permission.');
        setApplications([]); 
        setJobDetails(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobAndApplications();
  }, [jobId, user]);

  const handleApplicationStatusUpdate = (applicationId, newStatus) => {
    setApplications(prevApps => 
      prevApps.map(app => app.id === applicationId ? { ...app, status: newStatus } : app)
    );
  };

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)]">
      <LoadingSpinner size={48} text="Loading Applications..." />
    </div>
  );
  
  if (error) return (
    <div className="container mx-auto py-10 px-4">
        <AlertMessage type="error" message={error} onClose={() => setError('')} />
        {jobDetails === null && <Link to="/dashboard/employer" className="mt-4 inline-block text-blue-600 hover:underline">&larr; Back to Dashboard</Link>}
    </div>
  );
  
  if (!jobDetails) return ( 
    <div className="container mx-auto py-10 px-4 text-center">
        <p className="text-xl text-gray-600">Job details could not be loaded.</p>
        <Link to="/dashboard/employer" className="mt-4 inline-block text-blue-600 hover:underline">&larr; Back to Dashboard</Link>
    </div>
  );


  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 p-6 bg-gray-50 rounded-xl shadow">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center">
          <Users size={32} className="mr-3 text-blue-600" /> Applications for: <span className="text-blue-700 ml-2">{jobDetails.title}</span>
        </h1>
        <Link to={`/jobs/${jobId}`} className="text-sm text-indigo-600 hover:underline mt-2 inline-block flex items-center">
            <Eye size={14} className="mr-1"/> View Original Job Posting
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-md">
          <Briefcase size={56} className="mx-auto text-gray-300 mb-5" />
          <p className="text-xl text-gray-600 font-semibold">No applications received for this job yet.</p>
          <p className="text-gray-500 mt-2">Check back later or promote your job posting!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
          {applications.map(app => (
            <CandidateCard 
              key={app.id} 
              application={app} 
              onStatusUpdate={handleApplicationStatusUpdate} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default JobApplicationsPage;
