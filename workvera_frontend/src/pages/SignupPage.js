import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 
import AlertMessage from '../components/AlertMessage'; 
import { UserPlus, Mail, Lock, User as UserIcon, Briefcase } from 'lucide-react'; 
import LoadingSpinner from '../components/LoadingSpinner'; 

const SignupPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '', 
    password: '',
    re_password: '',
    role: 'seeker', 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (formData.password !== formData.re_password) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }


    const { re_password, ...signupData } = formData; 

    try {
      await signup(signupData); 
      setSuccess('Signup successful! Please log in to continue.');
      // Clear form or redirect
      setFormData({ email: '', name: '', password: '', re_password: '', role: 'seeker' });
      setTimeout(() => navigate('/login'), 2500); 
    } catch (err) {
      let errorMessages = [];
      if (err.response?.data) {
        const data = err.response.data;
        // Djoser typically returns errors as an object where keys are field names
        for (const key in data) {
          if (Array.isArray(data[key])) {
            errorMessages.push(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${data[key].join(', ')}`);
          } else {
            errorMessages.push(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${data[key]}`);
          }
        }
      }
      setError(errorMessages.length > 0 ? errorMessages.join(' ') : 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-xl shadow-2xl">
        <div className="text-center">
          <UserPlus className="mx-auto h-12 w-auto text-blue-600" strokeWidth={1.5}/>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Your WorkVera Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}
          {success && <AlertMessage type="success" message={success} />}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input id="name" name="name" type="text" required 
                       className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                       placeholder="Full Name" value={formData.name} onChange={handleChange} />
              </div>
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input id="email-address" name="email" type="email" autoComplete="email" required 
                       className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                       placeholder="Email address" value={formData.email} onChange={handleChange} />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input id="password" name="password" type="password" autoComplete="new-password" required 
                       className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                       placeholder="Password (min. 8 characters)" value={formData.password} onChange={handleChange} />
              </div>
            </div>
             <div>
              <label htmlFor="re_password" className="sr-only">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input id="re_password" name="re_password" type="password" autoComplete="new-password" required 
                       className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                       placeholder="Confirm Password" value={formData.re_password} onChange={handleChange} />
              </div>
            </div>
            <div>
              <label htmlFor="role" className="sr-only">I am a...</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <select id="role" name="role" required 
                        className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white" 
                        value={formData.role} onChange={handleChange}>
                  <option value="seeker">Job Seeker</option>
                  <option value="employer">Employer</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <button type="submit" disabled={isLoading} 
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors">
              {isLoading ? (
                <LoadingSpinner size={20} text="Creating account..." className="text-white"/>
              ) : (
                'Sign up'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
