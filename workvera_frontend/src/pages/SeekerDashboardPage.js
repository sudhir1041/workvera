import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api'; 
import { useAuth } from '../contexts/AuthContext'; 
import LoadingSpinner from '../components/LoadingSpinner'; 
import AlertMessage from '../components/AlertMessage'; 
import { UserCircle,  CheckSquare, Briefcase, Award, MessageSquare, Edit3, Search } from 'lucide-react';

const SeekerDashboardPage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [skillResults, setSkillResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError('');
      try {
        // Using Promise.allSettled to ensure all requests complete even if some fail
        const results = await Promise.allSettled([
          apiClient.get('/users/profile/me/'),
          // For applications, backend should filter by the authenticated user (seeker)
          apiClient.get('/jobs/applications/'), 
          apiClient.get('/skills/results/me/')
        ]);

        if (results[0].status === 'fulfilled') {
          setProfileData(results[0].value.data);
        } else {
          console.error("Failed to fetch profile:", results[0].reason);
          // Optionally set a specific error for profile loading
        }

        if (results[1].status === 'fulfilled') {
          setApplications(results[1].value.data.results || results[1].value.data); 
        } else {
          console.error("Failed to fetch applications:", results[1].reason);
        }

        if (results[2].status === 'fulfilled') {
          setSkillResults(results[2].value.data);
        } else {
          console.error("Failed to fetch skill results:", results[2].reason);
        }

      } catch (err) { 
        console.error("General error fetching seeker dashboard data:", err);
        setError('Failed to load some dashboard data. Please try refreshing.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const calculateProfileCompleteness = () => {
    if (!profileData) return 0;
    let score = 0;
    const totalFields = 5; // Example: bio, resume, video_pitch, linkedin_url, career_gap_years
    if (profileData.bio && profileData.bio.trim() !== '') score++;
    if (profileData.resume) score++;
    if (profileData.video_pitch) score++;
    if (profileData.linkedin_url && profileData.linkedin_url.trim() !== '') score++;
    // Consider career_gap_years as complete if it's present (0 is a valid, complete entry)
    if (typeof profileData.career_gap_years === 'number') score++; 
    
    return Math.round((score / totalFields) * 100);
  };

  const profileCompleteness = calculateProfileCompleteness();

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)]">
      <LoadingSpinner size={48} text="Loading Your Dashboard..." />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-0">Seeker Dashboard</h1>
        <Link to="/jobs" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center self-start sm:self-center">
            <Search size={16} className="mr-2"/> Find Jobs
        </Link>
      </div>
      
      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} className="mb-6" />}

      {/* Profile Summary & Completeness */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
          <UserCircle size={48} className="text-blue-600 mr-4 mb-3 sm:mb-0 flex-shrink-0" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-700">Welcome back, {user?.name || user?.email}!</h2>
            <p className="text-gray-500">This is your personal space to manage your job search.</p>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-lg font-medium text-gray-700">Profile Completeness</h3>
            <span className="text-lg font-semibold text-blue-600">{profileCompleteness}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${profileCompleteness}%` }}
            ></div>
          </div>
          {profileCompleteness < 100 && <p className="text-xs text-gray-500 mt-1">Complete your profile to improve your chances!</p>}
        </div>
        <Link to="/profile/edit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <Edit3 size={16} className="mr-2" /> Update Profile
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
          <Briefcase size={36} className="text-green-500 mx-auto mb-3" />
          <p className="text-4xl font-bold text-gray-700">{applications.length}</p>
          <p className="text-gray-500 mt-1">Applications Sent</p>
          <Link to="/my-applications" className="text-sm text-blue-600 hover:underline mt-3 block font-medium">View All</Link>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
          <Award size={36} className="text-yellow-500 mx-auto mb-3" />
          <p className="text-4xl font-bold text-gray-700">{skillResults.length}</p>
          <p className="text-gray-500 mt-1">Skill Tests Taken</p>
          <Link to="/my-skill-results" className="text-sm text-blue-600 hover:underline mt-3 block font-medium">View Results</Link>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
          <MessageSquare size={36} className="text-purple-500 mx-auto mb-3" />
          <p className="text-4xl font-bold text-gray-700">0</p> {/* Placeholder for messages */}
          <p className="text-gray-500 mt-1">New Messages</p>
          <Link to="#" className="text-sm text-gray-400 mt-3 block cursor-not-allowed">View Messages (Soon)</Link>
        </div>
      </div>
      
      {/* Skill Test Reminders / Suggested Tests */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
          <CheckSquare size={24} className="text-indigo-600 mr-2" /> Recommended Skill Tests
        </h2>
        <p className="text-gray-600 mb-4">Boost your profile by taking these tests (examples):</p>
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li>Python Fundamentals Assessment</li>
          <li>Advanced JavaScript & DOM Manipulation</li>
          <li>Data Analysis with Pandas</li>
        </ul>
        <Link to="/skill-tests" className="mt-4 inline-block px-6 py-2 border border-indigo-600 text-sm font-medium rounded-md text-indigo-600 hover:bg-indigo-50 transition-colors">
          Browse All Skill Tests
        </Link>
      </div>

      {/* Job Match Summary (Placeholder) */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Your Job Matches</h2>
        <p className="text-gray-600">Based on your profile and skills, here are some jobs you might be interested in (Feature coming soon).</p>
        {/* Placeholder for job matches list */}
        <div className="mt-4 text-center text-gray-500 italic">
            No specific matches available yet. Keep your profile updated!
        </div>
        <Link to="/jobs" className="mt-4 inline-block px-6 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 hover:bg-blue-50 transition-colors">
          Explore All Jobs
        </Link>
      </div>
    </div>
  );
};

export default SeekerDashboardPage;
