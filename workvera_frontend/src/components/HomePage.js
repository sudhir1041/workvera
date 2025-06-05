import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 
import LoadingSpinner from '../components/LoadingSpinner'; 
import { Briefcase, UserPlus, LogIn, Search, ArrowRight, Target, Edit2, FileSearch, Users2, PlusCircle, ListChecks, LayoutDashboard, Award } from 'lucide-react'; 

const HomePage = () => {
  const { user, loading: authLoading } = useAuth(); 

  if (authLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-16rem)]"> 
        <LoadingSpinner size={48} text="Loading WorkVera..." />
      </div>
    );
  }

  // Guest View (No user logged in)
  if (!user) {
    return (
      <div className="text-center py-10 md:py-16">
        <header className="mb-12 md:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-700 mb-4 animate-fade-in-down">
            Welcome to WorkVera
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up delay-200">
            Bridging career gaps and connecting talented individuals with inclusive employers. Find your next opportunity or the perfect candidate with us.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12 md:mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-left delay-400">
            <Briefcase className="w-16 h-16 text-teal-600 mx-auto mb-6" strokeWidth={1.5} />
            <h2 className="text-3xl font-semibold mb-4 text-gray-800">Job Seekers</h2>
            <p className="text-gray-600 mb-8">
              Explore roles from companies that value diverse experiences and support career re-entry. Showcase your skills and find a job that respects your journey.
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition-colors transform hover:scale-105"
            >
              <Search size={20} className="mr-2" /> Find Jobs <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-right delay-600">
            <Users2 className="w-16 h-16 text-sky-600 mx-auto mb-6" strokeWidth={1.5} />
            <h2 className="text-3xl font-semibold mb-4 text-gray-800">Employers</h2>
            <p className="text-gray-600 mb-8">
              Access a pool of skilled and motivated candidates. Post your gap-friendly jobs and discover talent ready to make an impact.
            </p>
            <Link
              to="/signup" 
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 transition-colors transform hover:scale-105"
            >
              Post a Job <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>

        <div className="mt-10 animate-fade-in-up delay-800">
          <p className="text-lg text-gray-700 mb-6">Ready to take the next step?</p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-block px-10 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-green-500 hover:bg-green-600 transition-colors transform hover:scale-105"
            >
              Sign Up Now
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 border border-gray-300 text-lg font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 transition-colors transform hover:scale-105"
            >
              <LogIn size={22} className="inline mr-2" /> Login
            </Link>
          </div>
        </div>
        
        <style jsx global>{`
          .animate-fade-in-down { animation: fadeInDown 0.5s ease-out forwards; }
          .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
          .animate-fade-in-left { animation: fadeInLeft 0.5s ease-out forwards; }
          .animate-fade-in-right { animation: fadeInRight 0.5s ease-out forwards; }
          .delay-200 { animation-delay: 0.2s; } .delay-400 { animation-delay: 0.4s; }
          .delay-600 { animation-delay: 0.6s; } .delay-800 { animation-delay: 0.8s; }
          @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes fadeInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
          .animate-fade-in-down, .animate-fade-in-up, .animate-fade-in-left, .animate-fade-in-right { opacity: 0; }
        `}</style>
      </div>
    );
  }

  // Logged-in User View
  return (
    <div className="py-10 md:py-16 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-700 mb-3">
          Welcome back, {user.name || user.email}!
        </h1>
        <p className="text-lg text-gray-600">
          {user.role === 'seeker' ? "Ready to find your next career move?" : "Let's manage your hiring process."}
        </p>
      </header>

      {user.role === 'seeker' && (
        <div className="max-w-xl mx-auto space-y-8 text-center">
            <div className="bg-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
                <Search size={48} className="text-teal-600 mx-auto mb-4 group-hover:scale-110 transition-transform" strokeWidth={1.5}/>
                <h2 className="text-3xl font-semibold text-gray-800 mb-3 group-hover:text-teal-700">Find Your Dream Job</h2>
                <p className="text-gray-600 mb-6">
                    Browse thousands of openings from inclusive employers who value your unique experience.
                </p>
                <Link 
                    to="/jobs" 
                    className="inline-flex items-center justify-center px-10 py-3.5 border border-transparent text-lg font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition-colors transform hover:scale-105"
                >
                    Explore Jobs <ArrowRight size={22} className="ml-2.5" />
                </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
                 <Link to="/my-applications" className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
                    <FileSearch size={32} className="text-sky-600 mb-3 group-hover:scale-110 transition-transform mx-auto sm:mx-0" />
                    <h3 className="text-xl font-semibold text-gray-800 group-hover:text-sky-700">Track Applications</h3>
                    <p className="text-gray-600 text-sm mt-1">View the status of your submitted applications.</p>
                </Link>
                <Link to="/profile/edit" className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
                    <Edit2 size={32} className="text-amber-600 mb-3 group-hover:scale-110 transition-transform mx-auto sm:mx-0" />
                    <h3 className="text-xl font-semibold text-gray-800 group-hover:text-amber-700">Update Profile</h3>
                    <p className="text-gray-600 text-sm mt-1">Keep your information current for better matches.</p>
                </Link>
            </div>
           <Link to="/skill-tests" className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="flex items-center">
              <Award size={32} className="text-purple-600 mr-4 group-hover:scale-110 transition-transform" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 group-hover:text-purple-700">Take a Skill Test</h2>
                <p className="text-gray-600 text-sm">Showcase your abilities to potential employers.</p>
              </div>
            </div>
          </Link>
        </div>
      )}

      {user.role === 'employer' && (
        <div className="max-w-xl mx-auto space-y-8 text-center">
            <div className="bg-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
                <PlusCircle size={48} className="text-teal-600 mx-auto mb-4 group-hover:scale-110 transition-transform" strokeWidth={1.5}/>
                <h2 className="text-3xl font-semibold text-gray-800 mb-3 group-hover:text-teal-700">Post a New Job</h2>
                <p className="text-gray-600 mb-6">
                    Reach thousands of talented and motivated candidates ready to make an impact.
                </p>
                <Link 
                    to="/jobs/create" 
                    className="inline-flex items-center justify-center px-10 py-3.5 border border-transparent text-lg font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition-colors transform hover:scale-105"
                >
                    Create Job Posting <ArrowRight size={22} className="ml-2.5" />
                </Link>
            </div>
             <div className="grid sm:grid-cols-2 gap-6">
                <Link to="/jobs/my-posts" className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
                    <ListChecks size={32} className="text-sky-600 mb-3 group-hover:scale-110 transition-transform mx-auto sm:mx-0" />
                    <h3 className="text-xl font-semibold text-gray-800 group-hover:text-sky-700">Manage Job Posts</h3>
                    <p className="text-gray-600 text-sm mt-1">View and update your active job listings.</p>
                </Link>
                <Link to="/dashboard/employer" className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
                    <Users2 size={32} className="text-amber-600 mb-3 group-hover:scale-110 transition-transform mx-auto sm:mx-0" />
                    <h3 className="text-xl font-semibold text-gray-800 group-hover:text-amber-700">Review Candidates</h3>
                    <p className="text-gray-600 text-sm mt-1">See who has applied to your job postings.</p>
                </Link>
            </div>
        </div>
      )}
       <div className="mt-12 text-center">
          <Link to="/dashboard" className="text-teal-600 hover:text-teal-700 font-medium inline-flex items-center group text-lg">
            Go to My Dashboard <ArrowRight size={22} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
    </div>
  );
};

export default HomePage;
