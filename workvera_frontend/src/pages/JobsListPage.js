import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api'; 
import LoadingSpinner from '../components/LoadingSpinner'; 
import AlertMessage from '../components/AlertMessage'; 
import { useAuth } from '../contexts/AuthContext'; 
import { Briefcase, MapPin, Filter, Search, Tag, CheckCircle, XCircle, Send, ExternalLink, Building, ChevronRight, Info } from 'lucide-react';

const JobCard = ({ job, onApply, applyingJobId, applicationStatus }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hooks must be called at the top level, before any early returns.
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    // This effect will run when applicationStatus prop changes or when the job for this card changes
    if (job && typeof job.id !== 'undefined') {
        const currentStatus = applicationStatus && applicationStatus[job.id];
        console.log(`JobCard ID: ${job.id} ('${job.title?.substring(0,15)}...') - Received status: ${currentStatus}, Full applicationStatus prop:`, applicationStatus);
        setIsApplied(currentStatus === 'applied');
    } else {
        // Handle the case where job or job.id might be initially undefined or invalid, if necessary
        setIsApplied(false); 
    }
  }, [applicationStatus, job]); 

  // Early return for invalid job data must come AFTER hook calls.
  if (!job || typeof job !== 'object' || typeof job.id === 'undefined') {
    console.error("JobCard received invalid job data or missing job.id:", job);
    return <div className="bg-red-100 p-4 rounded-md text-red-700">Error: Invalid job data provided to card.</div>;
  }

  const handleApplyClick = (e) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (!user) {
      navigate('/login', { state: { from: `/jobs/${job.id}` } }); 
      return;
    }
    if (user.role !== 'seeker') {
      alert("Only job seekers can apply for jobs."); 
      return;
    }
    onApply(job.id);
  };

  const isApplying = applyingJobId === job.id;
  const applyError = applicationStatus && applicationStatus[job.id] === 'error' && applicationStatus[`${job.id}_message`];

  const employerName = job.employer_detail?.name || 'A Reputable Company';
  const jobSkills = job.skill_tags ? job.skill_tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-200 flex flex-col justify-between h-full group">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-semibold text-teal-700 group-hover:text-teal-800 transition-colors">
            <Link to={`/jobs/${job.id}`}>{job.title || "Untitled Job"}</Link>
          </h2>
          {job.gap_friendly && (
            <span title="Gap Friendly" className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center flex-shrink-0">
              <CheckCircle size={14} className="mr-1" /> Gap Friendly
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-1 flex items-center">
          <Building size={14} className="mr-1.5 text-gray-400" /> {employerName}
        </p>
        {job.location && (
          <p className="text-sm text-gray-600 mb-2 flex items-center">
            <MapPin size={14} className="mr-1.5 text-gray-400" /> {job.location}
          </p>
        )}
        <p className="text-gray-700 text-sm mb-3 line-clamp-3 leading-relaxed" title={job.description}>
          {job.description || "No description available."}
        </p>
        {jobSkills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-1">Key Skills:</p>
            <div className="flex flex-wrap gap-1.5">
              {jobSkills.slice(0, 4).map((tag, index) => (
                <span key={index} className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-medium">
                  {tag}
                </span>
              ))}
              {jobSkills.length > 4 && (
                 <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium">
                    + {jobSkills.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="mt-auto pt-4 border-t border-gray-100">
        {user?.role === 'seeker' ? (
          <button
            onClick={handleApplyClick}
            disabled={isApplying || isApplied || !job.is_active} 
            className={`w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors
              ${!job.is_active ? 'bg-gray-400 cursor-not-allowed' :
               isApplied ? 'bg-green-500 cursor-not-allowed' : 
              isApplying ? 'bg-gray-400 cursor-wait' : 
              'bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500'}`}
          >
            {isApplying ? <LoadingSpinner size={18} text="Applying..." /> : 
             isApplied ? <><CheckCircle size={18} className="mr-2"/> Applied</> : 
             !job.is_active ? 'Closed' :
             <><Send size={18} className="mr-2"/> Apply Now</>}
          </button>
        ) : !user ? ( 
            <button
              onClick={handleApplyClick} 
              className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
               <Send size={18} className="mr-2"/> Apply Now
            </button>
        ) : null }
        {applyError && <p className="text-xs text-red-500 mt-1 text-center">{applyError}</p>}
      </div>
    </div>
  );
};

const JobsListPage = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ skill_tags: '', gap_friendly: '', search: '' }); 
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState({}); 
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchJobs = async (page = 1) => {
    setIsLoading(true);
    setError('');
    // console.log(`[FETCH_JOBS] Page: ${page}, Filters:`, filters); 
    try {
      const params = { page }; 
      if (filters.search) params.search = filters.search;
      if (filters.skill_tags) params.skill_tags__icontains = filters.skill_tags; 
      if (filters.gap_friendly === 'true') params.gap_friendly = true;
      if (filters.gap_friendly === 'false') params.gap_friendly = false;

      const response = await apiClient.get('/jobs/posts/', { params });
      // console.log("[API_RESPONSE] Full response object:", response); 

      let results = [];
      let count = 0;

      if (response.data && Array.isArray(response.data.results) && typeof response.data.count === 'number') {
        results = response.data.results;
        count = response.data.count;
      } else if (Array.isArray(response.data)) {
        results = response.data;
        count = response.data.length; 
      } else {
        // console.warn("[WARNING] Unexpected API response structure:", response.data);
      }
      
      // console.log("[FETCHED_JOBS_DATA] Processed results:", results); 
      // console.log("[TOTAL_COUNT_API] Count derived:", count); 
      
      setJobs(results); 
      setTotalJobs(count);
      
      const pageSize = results.length > 0 && page === 1 ? results.length : itemsPerPage;
      if (results.length > 0 && page === 1 && itemsPerPage !== results.length && Array.isArray(response.data.results)) {
        // console.log(`[PAGE_SIZE_UPDATE] Updating itemsPerPage from ${itemsPerPage} to ${results.length}`);
        setItemsPerPage(results.length || 10); 
      }
      
      const calculatedTotalPages = count ? Math.ceil(count / (pageSize || 10)) : 1; 
      setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
      setCurrentPage(page);

    } catch (err) {
      console.error("[FETCH_JOBS_ERROR] API error:", err.response || err.message || err); 
      setError('Failed to load jobs. Please ensure the backend is running and the API endpoint is correct. Check console for details.');
      setJobs([]); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1); 
  }, [filters]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      fetchJobs(newPage);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); 
  };
  
  const handleApply = async (jobId) => {
    if (!user) {
        navigate('/login', { state: { from: location.pathname } });
        return;
    }
    if (user.role !== 'seeker') {
        setApplicationStatus(prev => ({ ...prev, [jobId]: 'error', [`${jobId}_message`]: "Only job seekers can apply." }));
        return;
    }
    setApplyingJobId(jobId);
    setApplicationStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[jobId]; 
        delete newStatus[`${jobId}_message`]; 
        return newStatus;
    });

    try {
        await apiClient.post(`/jobs/posts/${jobId}/apply/`);
        console.log(`[APPLY_SUCCESS] For Job ID: ${jobId}. Setting status to 'applied'.`);
        setApplicationStatus(prev => ({ ...prev, [jobId]: 'applied' }));
    } catch (err) {
        const errorMessage = err.response?.data?.detail || 'Application failed.';
        console.error(`[APPLY_ERROR] For Job ID: ${jobId}. Error:`, errorMessage, "Full error object:", err.response || err);
        setApplicationStatus(prev => ({ ...prev, [jobId]: 'error', [`${jobId}_message`]: errorMessage }));
        if (err.response?.data?.detail?.toLowerCase().includes('already applied')) {
             console.log(`[APPLY_INFO] Job ID: ${jobId} was already applied. Setting status to 'applied'.`);
             setApplicationStatus(prev => ({ ...prev, [jobId]: 'applied' })); 
        }
    } finally {
        setApplyingJobId(null);
    }
  };

  useEffect(() => {
    console.log("[APPLICATION_STATUS_UPDATE] Current applicationStatus object:", applicationStatus);
  }, [applicationStatus]);


  return (
    <div className="container mx-auto py-8 px-4">
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">Find Your Next Opportunity</h1>
        <p className="text-lg text-gray-600 mt-2">Browse through various job openings tailored for you.</p>
      </header>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-8 sticky top-16 z-10">
        <div className="grid md:grid-cols-3 gap-x-6 gap-y-4 items-end">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              <Search size={16} className="inline mr-1.5 text-gray-500" /> Search Keywords
            </label>
            <input
              type="text"
              name="search"
              id="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Job title, company, skill..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
            />
          </div>
          <div>
            <label htmlFor="skill_tags" className="block text-sm font-medium text-gray-700 mb-1">
              <Tag size={16} className="inline mr-1.5 text-gray-500" /> Skill Tags (comma-separated)
            </label>
            <input
              type="text"
              name="skill_tags"
              id="skill_tags"
              value={filters.skill_tags}
              onChange={handleFilterChange}
              placeholder="e.g., React, Python"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
            />
          </div>
          <div>
            <label htmlFor="gap_friendly" className="block text-sm font-medium text-gray-700 mb-1">
              <Filter size={16} className="inline mr-1.5 text-gray-500" /> Gap Friendly
            </label>
            <select
              name="gap_friendly"
              id="gap_friendly"
              value={filters.gap_friendly}
              onChange={handleFilterChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm bg-white"
            >
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <LoadingSpinner size={48} text="Fetching Jobs..." />
        </div>
      )}
      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} className="my-6"/>}
      
      {!isLoading && !error && jobs.length === 0 && (
        <div className="text-center py-20 bg-white rounded-lg shadow-md">
            <Info size={60} className="mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-600 font-semibold">No jobs found matching your criteria.</p>
            <p className="text-gray-500 mt-2">Try adjusting your filters or check back later!</p>
        </div>
      )}

      {!isLoading && !error && jobs.length > 0 && (
        <>
          <p className="text-sm text-gray-600 mb-6 text-center md:text-left">
            Showing {Math.min(((currentPage - 1) * itemsPerPage) + 1, totalJobs)} - {Math.min(currentPage * itemsPerPage, totalJobs)} of {totalJobs} jobs.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            {jobs.map((job, index) => {
              if (!job || typeof job.id === 'undefined') {
                console.error(`[INVALID_JOB_DATA_AT_INDEX_${index}]`, job);
                return (
                  <div key={`error-${index}`} className="bg-red-50 p-4 rounded-md text-red-700 border border-red-200">
                    Error: Job data at index {index} is invalid and cannot be displayed.
                  </div>
                );
              }
              return (
                <JobCard 
                    key={job.id} 
                    job={job} 
                    onApply={handleApply} 
                    applyingJobId={applyingJobId}
                    applicationStatus={applicationStatus}
                />
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs sm:text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JobsListPage;
