import React, { useState, useEffect } from 'react';
import { useParams,  Link } from 'react-router-dom';
import apiClient from '../api'; 
import LoadingSpinner from '../components/LoadingSpinner'; 
import AlertMessage from '../components/AlertMessage'; 
import { useAuth } from '../contexts/AuthContext'; 
import { BookOpenText, Send, Check, X } from 'lucide-react';

const SkillTestPage = () => {
  const { testId } = useParams();
//   const navigate = useNavigate();
  const { user } = useAuth(); 

  const [testDetails, setTestDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [submissionResult, setSubmissionResult] = useState(null); 
  const [isAttempted, setIsAttempted] = useState(false);

  // This structure needs to be defined by your backend API for real tests.
  const mockQuestions = [
    { id: 1, text: "What is the primary purpose of React Router in a React application?", 
      options: ["State management", "Handling HTTP requests", "Client-side navigation", "Styling components"], 
      correctAnswer: "Client-side navigation" 
    },
    { id: 2, text: "Which hook is used to manage local component state in a functional React component?", 
      options: ["useEffect", "useContext", "useState", "useReducer"], 
      correctAnswer: "useState" 
    },
    { id: 3, text: "In CSS Flexbox, what property is used to align items along the main axis?",
      options: ["align-items", "justify-content", "flex-direction", "flex-wrap"],
      correctAnswer: "justify-content"
    }
  ];
  const [answers, setAnswers] = useState({}); // { questionId: answer }

  useEffect(() => {
    const fetchTestDetailsAndAttemptStatus = async () => {
      if (!user) { 
        setError("You must be logged in to take a skill test.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError('');
      setSubmissionResult(null); 
      try {
        const testDetailsResponse = await apiClient.get(`/skills/tests/${testId}/`);
        setTestDetails(testDetailsResponse.data);
        
        // Check if user already submitted for this test
        const resultsResponse = await apiClient.get('/skills/results/me/'); 
        const previousAttempt = resultsResponse.data.find(result => result.test === parseInt(testId));
        if (previousAttempt) {
            setIsAttempted(true);
            setSubmissionResult({ 
                score: previousAttempt.score, 
                message: `You have already completed this test on ${new Date(previousAttempt.submitted_at).toLocaleDateString()}. Your score was ${previousAttempt.score}%.` 
            });
        } else {
            setIsAttempted(false);
            setAnswers({}); 
        }

      } catch (err) {
        console.error("Failed to fetch test details or attempt status:", err);
        setError('Failed to load test details. The test may not exist or an error occurred.');
        setTestDetails(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestDetailsAndAttemptStatus();
  }, [testId, user]); 

  const handleAnswerChange = (questionId, answer) => {
    if (isAttempted) return; 
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitTest = async () => {
    if (isAttempted) return; 
    
    // Basic validation: ensure all mock questions are answered
    if (Object.keys(answers).length !== mockQuestions.length) {
        setError("Please answer all questions before submitting.");
        return;
    }
    setError(""); 

    setIsSubmitting(true);
    setSubmissionResult(null);

    // Mock scoring logic based on answers to mockQuestions
    let correctAnswersCount = 0;
    mockQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correctAnswersCount++;
      }
    });
    const calculatedScore = Math.round((correctAnswersCount / mockQuestions.length) * 100);

    try {
      // The backend should ideally calculate the score based on submitted answers,
      // not trust a score sent from the client for real tests.
      // For this mock, we send the client-calculated score.
      const response = await apiClient.post(`/skills/tests/${testId}/submit/`, { score: calculatedScore });
      setSubmissionResult({ score: response.data.score, message: "Test submitted successfully!" });
      setIsAttempted(true); // Mark as attempted after successful submission
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.score?.[0] || 'Failed to submit test results. You may have already attempted this test.';
      setSubmissionResult({ error: errorMessage });
      // If error indicates already attempted, ensure UI reflects this
      if (errorMessage.toLowerCase().includes('already submitted') || errorMessage.toLowerCase().includes('already attempted')) {
        setIsAttempted(true);
      }
      console.error("Failed to submit test:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)]">
      <LoadingSpinner size={48} text="Loading Test..." />
    </div>
  );
  
  if (error && !testDetails) return ( 
    <div className="container mx-auto py-10 px-4">
        <AlertMessage type="error" message={error} />
        <Link to="/skill-tests" className="mt-4 inline-block text-blue-600 hover:underline">&larr; Back to Skill Tests</Link>
    </div>
  );

  if (!testDetails) return ( 
    <div className="container mx-auto py-10 px-4 text-center">
        <p className="text-xl text-gray-600">Test not found or could not be loaded.</p>
        <Link to="/skill-tests" className="mt-4 inline-block text-blue-600 hover:underline">&larr; Back to Skill Tests</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-2xl my-8">
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center">
          <BookOpenText size={36} className="mr-3 text-indigo-600" /> {testDetails.title}
        </h1>
        {testDetails.skill_name && <p className="text-sm text-gray-500 mt-1">Skill Focus: <span className="font-medium">{testDetails.skill_name}</span></p>}
      </div>
      
      <div className="prose prose-indigo max-w-none text-gray-700 mb-8 leading-relaxed" dangerouslySetInnerHTML={{__html: testDetails.description.replace(/\n/g, '<br/>')}}/>

      {/* Display general error messages related to page load or pre-submission issues */}
      {error && !submissionResult && <AlertMessage type="error" message={error} onClose={() => setError('')} className="mb-6"/>}

      {isAttempted && submissionResult ? (
        // Display results or already attempted message
        <div className={`p-6 rounded-lg ${submissionResult.error ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'} border text-center`}>
          <div className="flex justify-center mb-3">
            {submissionResult.error ? 
                <X size={40} className="text-red-600"/> : 
                <Check size={40} className="text-green-600"/>
            }
          </div>
          <h2 className={`text-2xl font-semibold mb-3 ${submissionResult.error ? 'text-red-700' : 'text-green-700'}`}>
            {submissionResult.error ? 'Submission Problem' : 'Test Attempt Recorded'}
          </h2>
          {submissionResult.message && <p className="mb-2 text-gray-700">{submissionResult.message}</p>}
          {!submissionResult.error && typeof submissionResult.score !== 'undefined' && (
            <p className="text-3xl font-bold text-gray-800">Your Score: <span className="text-indigo-600">{submissionResult.score}%</span></p>
          )}
          <div className="mt-6 space-x-3">
            <Link to="/my-skill-results" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium">
                View My Results
            </Link>
            <Link to="/skill-tests" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium">
                Back to All Tests
            </Link>
          </div>
        </div>
      ) : (
        // Test Interface (Mocked)
        <>
          <div className="space-y-8 mb-8">
            <h3 className="text-2xl font-semibold text-gray-700 border-b pb-2">Test Questions <span className="text-sm font-normal text-gray-500">(Mock Interface)</span></h3>
            {mockQuestions.map((q, index) => (
              <div key={q.id} className="p-4 border rounded-lg bg-gray-50 shadow-sm">
                <p className="font-medium text-gray-800 mb-3">{index + 1}. {q.text}</p>
                <div className="space-y-2">
                  {q.options.map(opt => (
                    <label key={opt} className="flex items-center space-x-3 p-2.5 hover:bg-gray-100 rounded-md cursor-pointer transition-colors border border-gray-200 has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-300">
                      <input type="radio" name={`question-${q.id}`} value={opt}
                             checked={answers[q.id] === opt}
                             onChange={() => handleAnswerChange(q.id, opt)}
                             className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                      <span className="text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submission Result (for errors during submission if not already attempted) */}
          {submissionResult?.error && <AlertMessage type="error" message={submissionResult.error} onClose={() => setSubmissionResult(null)} className="mb-6"/>}

          <button 
            onClick={handleSubmitTest} 
            disabled={isSubmitting || Object.keys(answers).length !== mockQuestions.length}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? <LoadingSpinner size={20} text="Submitting..." /> : <><Send size={18} className="mr-2"/> Submit Test Answers</>}
          </button>
          {Object.keys(answers).length !== mockQuestions.length && <p className="text-xs text-red-500 text-center mt-2">Please answer all questions to enable submission.</p>}
        </>
      )}
    </div>
  );
};

export default SkillTestPage;
