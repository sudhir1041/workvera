import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api'; 
import LoadingSpinner from '../components/LoadingSpinner'; 
import AlertMessage from '../components/AlertMessage'; 
import { useAuth } from '../contexts/AuthContext'; 
import { Award, BookOpen, CalendarDays, Percent, Info, ListChecks, ChevronRight } from 'lucide-react';

const ResultCard = ({ result }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start mb-3">
          <Award size={28} className="mr-3 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{result.test_title || 'Test Title Missing'}</h2>
            {result.skill_tested && <p className="text-sm text-gray-500 mt-0.5 flex items-center"><BookOpen size={14} className="mr-1.5"/> Skill: {result.skill_tested}</p>}
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-2 flex items-center">
          <CalendarDays size={14} className="mr-1.5 text-gray-400"/> Submitted: {new Date(result.submitted_at).toLocaleDateString()}
        </p>
        <p className="text-3xl font-bold text-blue-600 flex items-center mb-3">
          <Percent size={28} className="mr-1.5"/> Score: {result.score}%
        </p>
      </div>
      <div className="mt-auto pt-3 border-t border-gray-100">
        <Link to={`/skill-tests/${result.test}`} className="text-sm text-indigo-600 hover:underline font-medium flex items-center">
            View Test Details <ChevronRight size={16} className="ml-1" />
        </Link>
      </div>
    </div>
  );
};

const MySkillResultsPage = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Renamed
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchResults = async () => {
      if (!user || user.role !== 'seeker') {
        setError("You must be logged in as a seeker to view skill results.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError('');
      try {
        // This endpoint should return results for the authenticated user
        const response = await apiClient.get('/skills/results/me/');
        setResults(response.data || []); 
      } catch (err) {
        console.error("Failed to fetch skill results:", err);
        setError('Failed to load your skill test results. Please try again.');
        setResults([]); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [user]);

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)]">
      <LoadingSpinner size={48} text="Loading Your Skill Results..." />
    </div>
  );

  if (error) return (
    <div className="container mx-auto py-10 px-4">
        <AlertMessage type="error" message={error} onClose={() => setError('')} />
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center mb-3 sm:mb-0">
            <ListChecks size={32} className="mr-3 text-yellow-600"/> My Skill Test Results
        </h1>
        <Link to="/skill-tests" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center self-start sm:self-auto">
            <BookOpen size={16} className="mr-2"/> Take More Tests
        </Link>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-md">
          <Info size={56} className="mx-auto text-gray-300 mb-5" />
          <p className="text-xl text-gray-600 font-semibold">You haven't completed any skill tests yet.</p>
          <p className="text-gray-500 mt-2">Take tests to showcase your abilities to potential employers.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
          {results.map(result => (
            <ResultCard key={result.id} result={result} />
          ))}
        </div>
        
      )}
    </div>
  );
};

export default MySkillResultsPage;
