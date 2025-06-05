import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api'; 
import LoadingSpinner from '../components/LoadingSpinner'; 
import AlertMessage from '../components/AlertMessage'; 
import { useAuth } from '../contexts/AuthContext'; 
import { BookOpen,  CheckCircle, Award, ChevronRight, ListFilter } from 'lucide-react';

const SkillTestCard = ({ test }) => {
  return (
    <Link to={`/skill-tests/${test.id}`} className="block hover:no-underline group">
      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 h-full flex flex-col">
        <div className="flex items-start mb-3">
          <BookOpen size={28} className="mr-4 text-indigo-600 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">{test.title}</h2>
            {test.skill_name && <p className="text-sm text-gray-500 mt-0.5">Skill: {test.skill_name}</p>}
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed flex-grow" title={test.description}>{test.description}</p>
        <div className="mt-auto pt-3 border-t border-gray-100">
            <div className="inline-flex items-center justify-center w-full px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 group-hover:bg-indigo-700 transition-colors">
                View & Start Test <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform"/>
            </div>
        </div>
      </div>
    </Link>
  );
};

const SkillTestsListPage = () => {
  const [tests, setTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState('');
  const { user } = useAuth(); 

  // Placeholder for filter state if you add filtering
  const [filters, setFilters] = useState({ skill: '' });

  useEffect(() => {
    const fetchSkillTests = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Add filter params if implemented: { params: filters }
        const response = await apiClient.get('/skills/tests/');
        setTests(response.data.results || response.data || []); 
      } catch (err) {
        console.error("Failed to fetch skill tests:", err);
        setError('Failed to load skill tests. Please try again later.');
        setTests([]); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchSkillTests();
  }, [/* filters */]); 

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)]">
      <LoadingSpinner size={48} text="Loading Skill Tests..." />
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
            <CheckCircle size={32} className="mr-3 text-green-600"/> Available Skill Tests
        </h1>
        {user && user.role === 'seeker' && (
            <Link to="/my-skill-results" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium flex items-center self-start sm:self-auto">
                <Award size={16} className="mr-2"/> My Test Results
            </Link>
        )}
      </div>
    
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center"><ListFilter size={20} className="mr-2"/> Filters</h3>
        <div>
          <label htmlFor="skill-filter" className="sr-only">Filter by skill</label>
          <input 
            id="skill-filter" 
            type="text" 
            placeholder="Enter skill to filter..." 
            value={filters.skill} 
            onChange={(e) => setFilters(prev => ({...prev, skill: e.target.value}))}
            className="w-full sm:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>
      </div>
      
      
      {tests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <BookOpen size={56} className="mx-auto text-gray-300 mb-5" />
            <p className="text-xl text-gray-600 font-semibold">No skill tests available at the moment.</p>
            <p className="text-gray-500 mt-2">Please check back later for new tests.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
          {tests.map(test => (
            <SkillTestCard key={test.id} test={test} />
          ))}
        </div>
      )}
      {/* TODO: Add pagination if API supports it and many tests are available */}
    </div>
  );
};

export default SkillTestsListPage;
