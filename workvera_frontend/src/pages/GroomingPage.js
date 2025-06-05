import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api'; 
import { useAuth } from '../contexts/AuthContext'; 
import LoadingSpinner from '../components/LoadingSpinner'; 
import AlertMessage from '../components/AlertMessage'; 
import { Lightbulb, ExternalLink, Zap, CheckCircle, Info, BookOpen } from 'lucide-react';


const mockSuggestions = [
  {
    id: 1,
    title: "Enhance Your Python Skills",
    description: "Python is in high demand. Consider taking a micro-course on advanced Python topics like asynchronous programming or data structures.",
    category: "Technical Skills",
    actionText: "Find Python Courses",
    actionLink: "https://www.udemy.com/topic/python/", 
    type: "course", // 'course', 'task', 'article'
  },
  {
    id: 2,
    title: "Update Your Resume for ATS",
    description: "Ensure your resume is optimized for Applicant Tracking Systems (ATS) to increase its visibility. Focus on keywords from job descriptions.",
    category: "Job Application",
    actionText: "Learn ATS Optimization",
    actionLink: "https://www.indeed.com/career-advice/resumes-cover-letters/ats-resume", 
    type: "article",
  },
  {
    id: 3,
    title: "Practice STAR Method for Interviews",
    description: "The STAR method (Situation, Task, Action, Result) is crucial for behavioral interview questions. Practice formulating your answers.",
    category: "Interview Skills",
    actionText: "Practice STAR Method",
    actionLink: "https://www.themuse.com/advice/star-interview-method", 
    type: "task",
  },
  {
    id: 4,
    title: "Build a Portfolio Project",
    description: "A strong portfolio project can significantly demonstrate your skills to employers, especially if you have a career gap. Choose a project that aligns with your target roles.",
    category: "Portfolio Building",
    actionText: "Get Project Ideas",
    actionLink: "https://www.freecodecamp.org/news/portfolio-project-ideas/", 
    type: "task",
  }
];

const SuggestionCard = ({ suggestion }) => {
  let IconComponent;
  let iconColor;

  switch (suggestion.type) {
    case 'course':
      IconComponent = Lightbulb;
      iconColor = 'text-yellow-500';
      break;
    case 'task':
      IconComponent = Zap;
      iconColor = 'text-purple-500';
      break;
    case 'article':
      IconComponent = BookOpen; 
      iconColor = 'text-blue-500';
      break;
    default:
      IconComponent = Lightbulb;
      iconColor = 'text-gray-500';
  }
  
  // import { Lightbulb, ExternalLink, Zap, CheckCircle, Info, BookOpen } from 'lucide-react';


  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-200 flex flex-col">
      <div className="flex items-start mb-3">
        <IconComponent size={28} className={`mr-4 flex-shrink-0 mt-1 ${iconColor}`} />
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{suggestion.title}</h3>
          <p className="text-xs text-gray-500 font-medium">{suggestion.category}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-4 leading-relaxed flex-grow">{suggestion.description}</p>
      <a 
        href={suggestion.actionLink} 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
      >
        {suggestion.actionText} <ExternalLink size={16} className="ml-2" />
      </a>
    </div>
  );
};


const GroomingPage = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user) {
        // This page should be protected by PrivateRoute, but as a fallback:
        setError("Please log in to view personalized grooming suggestions.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError('');
      try {
        
        // Example: const response = await apiClient.get('/users/grooming-suggestions/');
        // setSuggestions(response.data);

        // Using mock data for now
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        setSuggestions(mockSuggestions);

      } catch (err) {
        console.error("Failed to fetch grooming suggestions:", err);
        setError('Failed to load grooming suggestions. Please try again later.');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [user]);

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)]">
      <LoadingSpinner size={48} text="Loading Grooming Suggestions..." />
    </div>
  );

  if (error) return (
    <div className="container mx-auto py-10 px-4">
        <AlertMessage type="error" message={error} onClose={() => setError('')} />
        {!user && <Link to="/login" className="mt-4 inline-block text-blue-600 hover:underline">Login to view suggestions</Link>}
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">Career Grooming Hub</h1>
        <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
          Personalized suggestions and resources to help you enhance your skills and career readiness.
        </p>
      </div>

      {suggestions.length === 0 && !isLoading ? (
         <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <Info size={56} className="mx-auto text-gray-300 mb-5" />
            <p className="text-xl text-gray-600 font-semibold">No grooming suggestions available for you at the moment.</p>
            <p className="text-gray-500 mt-2">Ensure your profile is complete for personalized recommendations, or check back later!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
          {suggestions.map(suggestion => (
            <SuggestionCard key={suggestion.id} suggestion={suggestion} />
          ))}
        </div>
        
      )}
    </div>
  );
};

export default GroomingPage;
