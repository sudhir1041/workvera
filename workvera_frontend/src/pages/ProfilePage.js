import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api'; 
import { useAuth } from '../contexts/AuthContext'; 
import LoadingSpinner from '../components/LoadingSpinner'; 
import AlertMessage from '../components/AlertMessage';
import { User, Briefcase, Award, Edit3, FileText, Video, Linkedin, Github, CalendarDays, ExternalLink } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth(); // Get the authenticated user
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || user.role !== 'seeker') {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError('');
      try {
        // Seekers fetch their own profile from '/users/profile/me/'
        const response = await apiClient.get('/users/profile/me/');
        setProfile(response.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError('Failed to load your profile data. Please try again or complete your profile if you haven\'t.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)]">
      <LoadingSpinner size={48} text="Loading Your Profile..." />
    </div>
  );

  if (error) return (
    <div className="container mx-auto py-10 px-4">
      <AlertMessage type="error" message={error} />
      <div className="text-center mt-6">
        <Link 
            to="/profile/edit" 
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Complete/Edit Your Profile
        </Link>
      </div>
    </div>
  );
  
  if (!profile) return (
    <div className="container mx-auto py-10 px-4 text-center">
        <p className="text-xl text-gray-600">Your profile isn't set up yet or couldn't be loaded.</p>
        <Link 
            to="/profile/edit" 
            className="mt-6 inline-block px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-semibold text-lg"
        >
          Create Your Profile
        </Link>
    </div>
  );

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center mb-8 pb-6 border-b border-gray-200">
        {/* Placeholder for profile picture if you add it */}
        <img src={profile.profile_picture_url || `https://avatar.vercel.sh/${user.email}`} alt="Profile" className="w-24 h-24 rounded-full mr-6 mb-4 sm:mb-0 object-cover" /> 
        <User size={80} className="text-blue-600 mb-4 sm:mb-0 sm:mr-6 rounded-full p-3 bg-blue-100 flex-shrink-0" strokeWidth={1.5}/>
        <div className="text-center sm:text-left flex-grow">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{profile.user_name || user?.name}</h1>
          <p className="text-lg text-gray-500">{profile.user_email || user?.email}</p>
          <p className="text-sm text-indigo-600 capitalize mt-1">WorkVera {user?.role} Member</p>
        </div>
        <Link 
            to="/profile/edit" 
            className="ml-0 sm:ml-auto mt-4 sm:mt-0 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 flex items-center self-center sm:self-auto"
        >
          <Edit3 size={16} className="mr-2" /> Edit Profile
        </Link>
      </div>

      {profile.bio && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">About Me</h2>
          <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-1 flex items-center">
            <FileText size={18} className="mr-2 text-blue-500" /> Resume
          </h3>
          {profile.resume ? (
            <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all text-sm flex items-center">
              View/Download Resume <ExternalLink size={14} className="ml-1" />
            </a>
          ) : (
            <p className="text-gray-500 text-sm">Not uploaded yet.</p>
          )}
        </div>
        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-1 flex items-center">
            <Video size={18} className="mr-2 text-red-500" /> Video Pitch
          </h3>
          {profile.video_pitch ? (
            <a href={profile.video_pitch} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all text-sm flex items-center">
              Watch Video Pitch <ExternalLink size={14} className="ml-1" />
            </a>
          ) : (
            <p className="text-gray-500 text-sm">Not uploaded yet.</p>
          )}
        </div>
      
        <div className="md:col-span-2">
          <h3 className="text-md font-semibold text-gray-700 mb-1 flex items-center">
            <Briefcase size={18} className="mr-2 text-green-500" /> Career Gap
          </h3>
          <p className="text-gray-600 text-sm">
            {typeof profile.career_gap_years === 'number' ? 
             (profile.career_gap_years > 0 ? `${profile.career_gap_years} year(s) reported` : "No significant career gap reported") 
             : "Not specified"}
          </p>
        </div>
      </div>
      
      {(profile.linkedin_url || profile.github_url) && (
        <div className="mb-6 pt-4 border-t border-gray-100">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Online Presence</h3>
          <div className="space-y-3">
            {profile.linkedin_url && (
              <div className="flex items-center">
                <Linkedin size={20} className="mr-3 text-blue-700 flex-shrink-0" />
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all text-sm">
                  {profile.linkedin_url}
                </a>
              </div>
            )}
            {profile.github_url && (
              <div className="flex items-center">
                <Github size={20} className="mr-3 text-gray-800 flex-shrink-0" />
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all text-sm">
                  {profile.github_url}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-8 pt-6 border-t border-gray-200">
         <Link to="/my-skill-results" className="text-blue-600 hover:underline flex items-center font-medium">
            <Award size={18} className="mr-2" /> View My Skill Test Results
        </Link>
         <Link to="/my-applications" className="text-blue-600 hover:underline flex items-center font-medium mt-3">
            <CalendarDays size={18} className="mr-2" /> View My Applications
        </Link>
      </div>
    </div>
  );
};

export default ProfilePage;
