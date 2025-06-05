import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import apiClient from '../api'; 
import { useAuth } from '../contexts/AuthContext'; 
import AlertMessage from '../components/AlertMessage'; 
import LoadingSpinner from '../components/LoadingSpinner'; 
import { Briefcase, FileText, CheckSquare, Tag, MapPin, DollarSign, Save, Info } from 'lucide-react';

const CreateJobPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    skill_tags: '', 
    location: '',
    job_type: '', 
    gap_friendly: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setJobData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'employer') {
      setError("You must be logged in as an employer to post a job.");
      return;
    }
    if (!jobData.title.trim() || !jobData.description.trim()) {
        setError("Job title and description are required.");
        return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Prepare the payload, including the employer ID
      const payload = {
        ...jobData,
        employer: user.id, 
      };

      const response = await apiClient.post('/jobs/posts/', payload); 
      setSuccess(`Job "${response.data.title}" posted successfully! Redirecting...`);
      setJobData({ title: '', description: '', skill_tags: '', location: '', job_type: '', gap_friendly: false }); 
      setTimeout(() => navigate(`/jobs/${response.data.id}`), 2000); 
    } catch (err) {
      let errorMessages = [];
      if (err.response?.data) {
          const data = err.response.data;
          if (data.detail) {
              errorMessages.push(data.detail);
          } else {
              for (const key in data) {
                  const fieldErrors = Array.isArray(data[key]) ? data[key].join(', ') : data[key];
                  errorMessages.push(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${fieldErrors}`);
              }
          }
      }
      setError(errorMessages.length > 0 ? errorMessages.join('; ') : 'Failed to post job. Please check your input and try again.');
      console.error("Job post error:", err.response?.data || err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== 'employer') {
    return (
        <div className="container mx-auto py-10 px-4 text-center">
            <AlertMessage type="error" message="Access Denied: You must be logged in as an employer to post a job." />
            <Link to="/login" state={{ from: location }} className="mt-4 inline-block text-teal-600 hover:underline">Login as Employer</Link>
        </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-2xl my-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center flex items-center justify-center">
        <Briefcase size={30} className="mr-3 text-teal-600" /> Post a New Job
      </h1>
      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} className="mb-6" />}
      {success && <AlertMessage type="success" message={success} className="mb-6" />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Job Title <span className="text-red-500">*</span></label>
          <input type="text" name="title" id="title" required value={jobData.title} onChange={handleChange}
                 className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm" 
                 placeholder="e.g., Senior Software Engineer"/>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <FileText size={16} className="mr-1.5 text-gray-500" /> Description <span className="text-red-500">*</span>
          </label>
          <textarea name="description" id="description" rows="8" required value={jobData.description} onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    placeholder="Provide a detailed job description, responsibilities, qualifications, and company information..."></textarea>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="skill_tags" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Tag size={16} className="mr-1.5 text-gray-500" /> Skill Tags (comma-separated)
                </label>
                <input type="text" name="skill_tags" id="skill_tags" value={jobData.skill_tags} onChange={handleChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                        placeholder="e.g., JavaScript, React, Node.js" />
            </div>
            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <MapPin size={16} className="mr-1.5 text-gray-500" /> Location
                </label>
                <input type="text" name="location" id="location" value={jobData.location} onChange={handleChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                        placeholder="e.g., San Francisco, CA or Remote" />
            </div>
        </div>
        
        <div>
            <label htmlFor="job_type" className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
            <select name="job_type" id="job_type" value={jobData.job_type} onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm bg-white">
                <option value="">Select Job Type (Optional)</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Temporary">Temporary</option>
            </select>
        </div>

        <div className="flex items-center pt-2">
          <input type="checkbox" name="gap_friendly" id="gap_friendly" checked={jobData.gap_friendly} onChange={handleChange}
                 className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mr-2 cursor-pointer" />
          <label htmlFor="gap_friendly" className="text-sm font-medium text-gray-700 flex items-center cursor-pointer">
            <CheckSquare size={18} className="mr-1.5 text-green-500" /> This job is Gap-Friendly
          </label>
        </div>
        <p className="text-xs text-gray-500 flex items-start">
            <Info size={14} className="mr-1.5 mt-0.5 flex-shrink-0" />
            Marking this job as "Gap-Friendly" indicates that you welcome applications from candidates who may have breaks in their employment history.
        </p>

        <div className="pt-5">
          <button type="submit" disabled={isSubmitting}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 transition-colors"
          >
            <Save size={20} className="mr-2" /> {isSubmitting ? <LoadingSpinner size={20} text="Posting Job..." /> : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJobPage;
