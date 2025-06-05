import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api'; 
import { useAuth } from '../contexts/AuthContext'; 
import LoadingSpinner from '../components/LoadingSpinner'; 
import AlertMessage from '../components/AlertMessage'; 
import { Save, UploadCloud, X, UserCircle, Briefcase, Linkedin, Github, FileText, Video, Edit3 } from 'lucide-react';

const EditProfilePage = () => {
  const { user, setUser: setAuthUser } = useAuth(); 
  const [profileData, setProfileData] = useState({
    name: user?.name || '', 
    bio: '',
    career_gap_years: 0,
    linkedin_url: '',
    github_url: '',
    existingResumeUrl: '',
    existingVideoUrl: '',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [isSaving, setIsSaving] = useState(false); 
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const resumeInputRef = useRef(null);
  const videoInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || user.role !== 'seeker') {
        setIsLoading(false);
        setError("Access denied. You must be logged in as a seeker to edit a profile.");
        return;
      }
      setIsLoading(true);
      setError('');
      try {
        const response = await apiClient.get('/users/profile/me/');
        setProfileData({
          name: user.name || '', 
          bio: response.data.bio || '',
          career_gap_years: response.data.career_gap_years === null ? '' : response.data.career_gap_years, // Handle null for number input
          linkedin_url: response.data.linkedin_url || '',
          github_url: response.data.github_url || '',
          existingResumeUrl: response.data.resume || '',
          existingVideoUrl: response.data.video_pitch || '',
        });
      } catch (err) {
        setError('Failed to load profile data. You might need to create it first.');
        // Initialize with defaults if profile doesn't exist or fails to load
        setProfileData(prev => ({ ...prev, name: user.name || '' }));
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setProfileData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value 
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (name === 'resume') setResumeFile(files[0]);
      if (name === 'video_pitch') setVideoFile(files[0]);
    }
  };

  const handleRemoveFile = (fileType) => {
    if (fileType === 'resume') {
      setResumeFile(null);
      setProfileData(prev => ({ ...prev, existingResumeUrl: '' })); 
      if (resumeInputRef.current) resumeInputRef.current.value = "";
       // To actually delete on backend, send 'resume': null or specific flag
    } else if (fileType === 'video_pitch') {
      setVideoFile(null);
      setProfileData(prev => ({ ...prev, existingVideoUrl: '' }));
      if (videoInputRef.current) videoInputRef.current.value = "";
      // To actually delete on backend, send 'video_pitch': null
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    const profilePayload = new FormData();
    profilePayload.append('bio', profileData.bio);
    // Ensure career_gap_years is a number or null if empty
    profilePayload.append('career_gap_years', profileData.career_gap_years === '' ? null : profileData.career_gap_years);
    profilePayload.append('linkedin_url', profileData.linkedin_url);
    profilePayload.append('github_url', profileData.github_url);

    if (resumeFile) {
      profilePayload.append('resume', resumeFile);
    } else if (!profileData.existingResumeUrl && resumeFile !== undefined) { 
      profilePayload.append('resume', ''); 
    }


    if (videoFile) {
      profilePayload.append('video_pitch', videoFile);
    } else if (!profileData.existingVideoUrl && videoFile !== undefined) {
      profilePayload.append('video_pitch', '');
    }


    try {
      // 1. Update CustomUser fields (like name) first
      if (user.name !== profileData.name) {
        const userUpdateResponse = await apiClient.patch('/auth/users/me/', { name: profileData.name });
        setAuthUser(userUpdateResponse.data); 
      }

      // 2. Update Profile fields
      const profileUpdateResponse = await apiClient.put('/users/profile/me/', profilePayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setSuccess('Profile updated successfully!');
      // Update local state for file URLs if new files were uploaded or changed
      setProfileData(prev => ({
        ...prev,
        existingResumeUrl: profileUpdateResponse.data.resume || '',
        existingVideoUrl: profileUpdateResponse.data.video_pitch || '',
      }));
      setResumeFile(null); 
      setVideoFile(null);
      if(resumeInputRef.current) resumeInputRef.current.value = "";
      if(videoInputRef.current) videoInputRef.current.value = "";

      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
        let errorMessages = [];
        if (err.response?.data) {
            const data = err.response.data;
            for (const key in data) {
                errorMessages.push(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${Array.isArray(data[key]) ? data[key].join(', ') : data[key]}`);
            }
        }
        setError(errorMessages.join('; ') || 'Failed to update profile. Please check your input.');
        console.error("Profile update error:", err.response?.data || err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)]">
      <LoadingSpinner size={48} text="Loading Profile Editor..." />
    </div>
  );
  
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-2xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center flex items-center justify-center">
        <Edit3 size={30} className="mr-3 text-blue-600" /> Edit Your Profile
      </h1>
      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} className="mb-6" />}
      {success && <AlertMessage type="success" message={success} className="mb-6" />}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <UserCircle size={18} className="mr-2 text-gray-500" /> Full Name
          </label>
          <input type="text" id="name" name="name" required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={profileData.name} onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <FileText size={18} className="mr-2 text-gray-500" /> About Me / Bio
          </label>
          <textarea id="bio" name="bio" rows="5"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Share your story, skills, and career aspirations..."
            value={profileData.bio} onChange={handleChange}
          ></textarea>
        </div>

        <div>
          <label htmlFor="career_gap_years" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Briefcase size={18} className="mr-2 text-gray-500" /> Career Gap (Years)
          </label>
          <input type="number" id="career_gap_years" name="career_gap_years" min="0" step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., 2 or 0.5 for 6 months"
            value={profileData.career_gap_years} onChange={handleChange}
          />
           <p className="text-xs text-gray-500 mt-1">Enter 0 if no significant gap. You can use decimals (e.g., 1.5 for 1 year and 6 months).</p>
        </div>

        <div>
          <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Linkedin size={18} className="mr-2 text-gray-500" /> LinkedIn Profile URL
          </label>
          <input type="url" id="linkedin_url" name="linkedin_url"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="https://linkedin.com/in/yourprofile"
            value={profileData.linkedin_url} onChange={handleChange}
          />
        </div>
        
        <div>
          <label htmlFor="github_url" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Github size={18} className="mr-2 text-gray-500" /> GitHub Profile URL (Optional)
          </label>
          <input type="url" id="github_url" name="github_url"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="https://github.com/yourusername"
            value={profileData.github_url} onChange={handleChange}
          />
        </div>

        {/* Resume Upload */}
        <div className="space-y-1 p-4 border border-gray-200 rounded-md bg-gray-50">
            <label htmlFor="resume" className="block text-sm font-medium text-gray-700 flex items-center">
              <UploadCloud size={18} className="mr-2 text-blue-600" /> Upload Resume (PDF, DOC, DOCX)
            </label>
            {profileData.existingResumeUrl && !resumeFile && (
                <div className="text-xs text-gray-600 my-1 p-2 border border-dashed border-gray-300 rounded-md bg-white flex justify-between items-center">
                  <span>Current: <a href={profileData.existingResumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{profileData.existingResumeUrl.split('/').pop()}</a></span>
                  <button type="button" onClick={() => handleRemoveFile('resume')} className="text-red-500 hover:text-red-700 p-1" title="Remove current resume"> <X size={14}/> </button>
                </div>
            )}
            <input id="resume" name="resume" type="file" ref={resumeInputRef}
                accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer" />
            {resumeFile && <p className="text-xs text-green-600 mt-1">New file selected: {resumeFile.name}</p>}
        </div>

        {/* Video Pitch Upload */}
        <div className="space-y-1 p-4 border border-gray-200 rounded-md bg-gray-50">
            <label htmlFor="video_pitch" className="block text-sm font-medium text-gray-700 flex items-center">
              <UploadCloud size={18} className="mr-2 text-indigo-600" /> Upload Video Pitch (MP4, MOV, max 50MB)
            </label>
            {profileData.existingVideoUrl && !videoFile && (
                 <div className="text-xs text-gray-600 my-1 p-2 border border-dashed border-gray-300 rounded-md bg-white flex justify-between items-center">
                    <span>Current: <a href={profileData.existingVideoUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">{profileData.existingVideoUrl.split('/').pop()}</a></span>
                    <button type="button" onClick={() => handleRemoveFile('video_pitch')} className="text-red-500 hover:text-red-700 p-1" title="Remove current video pitch"> <X size={14}/> </button>
                 </div>
            )}
            <input id="video_pitch" name="video_pitch" type="file" ref={videoInputRef}
                accept="video/mp4,video/quicktime,video/x-msvideo,video/webm" onChange={handleFileChange}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer" />
            {videoFile && <p className="text-xs text-green-600 mt-1">New file selected: {videoFile.name}</p>}
        </div>

        <div className="pt-5">
          <button type="submit" disabled={isSaving}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 transition-colors"
          >
            <Save size={20} className="mr-2" /> {isSaving ? 'Saving Profile...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>

  );
};

export default EditProfilePage;
