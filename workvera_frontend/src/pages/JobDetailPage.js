import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api'; 
import LoadingSpinner from '../components/LoadingSpinner'; 
import AlertMessage from '../components/AlertMessage'; 
import { useAuth } from '../contexts/AuthContext'; 
import { Briefcase, MapPin, CalendarDays, Tag, CheckCircle, Send, UserCircle, ExternalLink, Building, Edit3, Trash2, User, Users } from 'lucide-react';

const JobDetailPage = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState({ type: '', text: '' });
  const [isApplied, setIsApplied] = useState(false); 

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchJobDetails = async () => {
      setIsLoading(true);
      setError('');
      setApplicationMessage({ type: '', text: '' }); 
      try {
        const response = await apiClient.get(`/jobs/posts/${jobId}/`);
        setJob(response.data);
        
        // Check if user has already applied (if logged in and seeker)
        if (user && user.role === 'seeker') {
            try {
                const applicationsResponse = await apiClient.get('/jobs/applications/'); 
                const userApplications = applicationsResponse.data.results || applicationsResponse.data;
                if (userApplications.some(app => app.job === parseInt(jobId))) {
                    setIsApplied(true);
                } else {
                    setIsApplied(false);
                }
            } catch (appCheckError) {
                console.warn("Could not check application status:", appCheckError);
                setIsApplied(false); 
            }
        }

      } catch (err) {
        console.error("Failed to fetch job details:", err);
        setError('Failed to load job details. The job may no longer exist or an error occurred.');
        setJob(null); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobDetails();
  }, [jobId, user]); // Re-fetch if user logs in/out to update "isApplied" status

  const handleApply = async () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (user.role !== 'seeker') {
      setApplicationMessage({ type: 'error', text: 'Only job seekers can apply for jobs.' });
      return;
    }
    if (!job?.is_active) {
        setApplicationMessage({ type: 'warning', text: 'This job is no longer active.' });
        return;
    }

    setIsApplying(true);
    setApplicationMessage({ type: '', text: '' });
    try {
      await apiClient.post(`/jobs/posts/${jobId}/apply/`);
      setApplicationMessage({ type: 'success', text: 'Application submitted successfully!' });
      setIsApplied(true); 
    } catch (err) {
      setApplicationMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to submit application. You may have already applied.' });
      // If error indicates already applied, set isApplied to true
      if (err.response?.data?.detail?.toLowerCase().includes('already applied')) {
        setIsApplied(true);
      }
      console.error("Failed to apply for job:", err);
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)]">
      <LoadingSpinner size={48} text="Loading Job Details..." />
    </div>
  );
  if (error) return (
    <div className="container mx-auto py-10 px-4">
        <AlertMessage type="error" message={error} />
        <Link to="/jobs" className="mt-4 inline-block text-blue-600 hover:underline">&larr; Back to Jobs List</Link>
    </div>
  );
  if (!job) return (
    <div className="container mx-auto py-10 px-4 text-center text-xl">
        <p>Job not found.</p>
        <Link to="/jobs" className="mt-4 inline-block text-blue-600 hover:underline">&larr; Back to Jobs List</Link>
    </div>
  );

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl max-w-4xl mx-auto">
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 mb-3">{job.title}</h1>
          <div className="flex flex-wrap items-center text-gray-600 text-sm gap-x-6 gap-y-2">
            <p className="flex items-center"><Building size={16} className="mr-1.5 text-gray-500" /> {job.employer_detail?.name || 'A Reputable Company'}</p>
            {job.location && <p className="flex items-center"><MapPin size={16} className="mr-1.5 text-gray-500" /> {job.location}</p>}
            <p className="flex items-center"><CalendarDays size={16} className="mr-1.5 text-gray-500" /> Posted: {new Date(job.posted_at).toLocaleDateString()}</p>
            {!job.is_active && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Closed</span>}
          </div>
          {job.gap_friendly && (
            <p className="mt-3 text-md text-green-600 font-semibold flex items-center">
              <CheckCircle size={18} className="mr-1.5" /> This is a Gap-Friendly opportunity!
            </p>
          )}
        </div>

        {applicationMessage.text && (
          <div className="mb-6">
            <AlertMessage type={applicationMessage.type} message={applicationMessage.text} onClose={() => setApplicationMessage({ type: '', text: '' })} />
          </div>
        )}

        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Job Description</h2>
        <div className="prose prose-lg max-w-none text-gray-700 mb-8 leading-relaxed" dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br />') }} />
        
        {job.skill_tags && job.skill_tags.split(',').filter(Boolean).length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center"><Tag size={20} className="mr-2 text-indigo-600" /> Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skill_tags.split(',').map(tag => tag.trim()).filter(Boolean).map((tag, index) => (
                <span key={index} className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.job_type && (
            <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Job Type</h3>
                <p className="text-gray-700">{job.job_type}</p>
            </div>
        )}
        
        <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center"><UserCircle size={24} className="mr-2 text-gray-500"/> About the Employer</h3>
            <p className="text-gray-700 font-medium text-lg">{job.employer_detail?.name || 'Company Name Not Specified'}</p>
            <p className="text-sm text-gray-600 mt-1">Further details about the company would appear here.</p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200">
            {user?.role === 'seeker' && (
            <div className="text-center">
                <button
                onClick={handleApply}
                disabled={isApplying || isApplied || !job.is_active}
                className={`px-8 py-3 text-lg font-semibold rounded-md shadow-md transition-colors
                    ${!job.is_active ? 'bg-gray-400 text-gray-700 cursor-not-allowed' :
                    isApplied ? 'bg-green-600 text-white cursor-not-allowed' :
                    isApplying ? 'bg-gray-400 text-white cursor-wait' :
                    'bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
                >
                {isApplying ? <LoadingSpinner size={20} text="Submitting..." /> : 
                isApplied ? <><CheckCircle size={20} className="inline mr-2"/> Applied</> : 
                !job.is_active ? 'Application Closed' :
                <><Send size={20} className="inline mr-2"/> Apply for this Job</>}
                </button>
            </div>
            )}
            {(!user && job.is_active) && ( 
                <div className="text-center">
                    <button
                    onClick={handleApply} 
                    className="px-8 py-3 text-lg font-semibold rounded-md shadow-md transition-colors bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Send size={20} className="inline mr-2"/> Apply for this Job
                    </button>
                </div>
            )}
            {user?.role === 'employer' && user.id === job.employer && (
    <div className="flex justify-end space-x-3">
        <Link to={`/jobs/edit/${job.id}`} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600 flex items-center">
            <Edit3 size={16} className="mr-1.5"/> Edit Job
        </Link>
        <Link to={`/jobs/${job.id}/applications`} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 flex items-center">
            <Users size={16} className="mr-1.5"/> View Applications
        </Link>
        <button onClick={() => {/* TODO: Delete logic */}} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 flex items-center">
            <Trash2 size={16} className="mr-1.5"/> Delete Job
        </button>
    </div>
)}        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
