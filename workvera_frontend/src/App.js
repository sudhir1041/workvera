import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import SeekerDashboardPage from './pages/SeekerDashboardPage';
import EmployerDashboardPage from './pages/EmployerDashboardPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import JobsListPage from './pages/JobsListPage';
import JobDetailPage from './pages/JobDetailPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import JobApplicationsPage from './pages/JobApplicationsPage';
import SkillTestsListPage from './pages/SkillTestsListPage';
import SkillTestPage from './pages/SkillTestPage';
import MySkillResultsPage from './pages/MySkillResultsPage';
import GroomingPage from './pages/GroomingPage'; 
import ForumPage from './pages/ForumPage'; 
import PostDetailPage from './pages/PostDetailPage'; 
import CreatePostPage from './pages/CreatePostPage';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './contexts/AuthContext';
import CreateJobPage from './pages/CreateJobPage';
import EmployerJobPostsPage from './pages/EmployerJobPostsPage';
import SecuredAdminUserManagementPage from './pages/AdminUserManagementPage';

function App() {
  const { user } = useAuth();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Common Dashboard - redirects based on role */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            {user?.role === 'seeker' ? <Navigate to="/dashboard/seeker" /> : 
             user?.role === 'employer' ? <Navigate to="/dashboard/employer" /> : 
             <DashboardPage /> }
          </PrivateRoute>
        } />

        {/* Seeker Routes */}
        <Route path="/dashboard/seeker" element={<PrivateRoute requiredRole="seeker"><SeekerDashboardPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute requiredRole="seeker"><ProfilePage /></PrivateRoute>} />
        <Route path="/profile/edit" element={<PrivateRoute requiredRole="seeker"><EditProfilePage /></PrivateRoute>} />
        <Route path="/my-applications" element={<PrivateRoute requiredRole="seeker"><MyApplicationsPage /></PrivateRoute>} />
        <Route path="/my-skill-results" element={<PrivateRoute requiredRole="seeker"><MySkillResultsPage /></PrivateRoute>} />

        {/* Employer Routes */}
        <Route path="/dashboard/employer" element={<PrivateRoute requiredRole="employer"><EmployerDashboardPage /></PrivateRoute>} />
        <Route path="/jobs/create" element={<PrivateRoute requiredRole="employer"><CreateJobPage /></PrivateRoute>} />
        <Route path="/jobs/my-posts" element={<PrivateRoute requiredRole="employer"><EmployerJobPostsPage /></PrivateRoute>} />
        <Route path="/jobs/:jobId/applications" element={<PrivateRoute requiredRole="employer"><JobApplicationsPage /></PrivateRoute>} />
        
        {/* Shared Routes */}
        <Route path="/jobs" element={<JobsListPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailPage />} />
        <Route path="/skill-tests" element={<SkillTestsListPage />} />
        <Route path="/skill-tests/:testId" element={<PrivateRoute><SkillTestPage /></PrivateRoute>} />
        
        {/* Admin Route */}
        <Route 
          path="/admin/users" 
          element={<SecuredAdminUserManagementPage />} 
        />
        
        {/* Optional Routes */}
        <Route path="/grooming" element={<PrivateRoute><GroomingPage /></PrivateRoute>} />
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/forum/posts/:postId" element={<PostDetailPage />} />
        <Route 
          path="/forum/create-post" 
          element={
            <PrivateRoute> 
              <CreatePostPage />
            </PrivateRoute>
          } 
        />


        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default App;
