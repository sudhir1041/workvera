import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api'; 
import { useAuth } from '../contexts/AuthContext'; 
import LoadingSpinner from '../components/LoadingSpinner'; 
import AlertMessage from '../components/AlertMessage'; 
import PrivateRoute from '../components/PrivateRoute'; 
import { Users, Filter, Search, UserCheck, Briefcase, ShieldCheck, ShieldOff, ChevronDown, ChevronUp, Edit, CheckCircle as CheckCircleLucide, XCircle } from 'lucide-react';

const UserRow = ({ user }) => {
  return (
    
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{user.id}</td>
      <td className="px-4 py-3 text-sm font-medium text-slate-800 whitespace-nowrap">{user.name || 'N/A'}</td>
      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{user.email}</td>
      <td className="px-4 py-3 text-sm whitespace-nowrap">
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          user.role === 'seeker' ? 'bg-sky-100 text-sky-700' :
          user.role === 'employer' ? 'bg-purple-100 text-purple-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'Unknown'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-center whitespace-nowrap">
        {user.is_active ? 
          <CheckCircleLucide className="w-5 h-5 text-green-500 mx-auto" title="Active"/> : 
          <XCircle className="w-5 h-5 text-red-500 mx-auto" title="Inactive"/>
        }
      </td>
      <td className="px-4 py-3 text-sm text-center whitespace-nowrap">
        {user.is_staff ? 
          <ShieldCheck className="w-5 h-5 text-teal-600 mx-auto" title="Admin/Staff"/> : 
          <ShieldOff className="w-5 h-5 text-slate-400 mx-auto" title="Regular User"/>
        }
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{new Date(user.date_joined || Date.now()).toLocaleDateString()}</td>
      <td className="px-4 py-3 text-sm text-center whitespace-nowrap">
        <button className="text-blue-600 hover:text-blue-800" title="Edit User (Placeholder)">
          <Edit size={16} />
        </button>
      </td>
    </tr>
  );
};


const AdminUserManagementPage = () => {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    role: '', // 'seeker', 'employer', or '' for all
    is_active: '', // 'true', 'false', or '' for all
    search: '',
  });

  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.role) params.role = filters.role;
      if (filters.is_active !== '') params.is_active = filters.is_active; 
      if (filters.search) params.search = filters.search; 

      // The backend API /api/core/admin/users/ should handle authorization (admin only)
      const response = await apiClient.get('/admin_analytics/admin/users/', { params });
      setUsers(response.data.results || response.data || []); 
    } catch (err) {
      console.error("Failed to fetch users:", err);
      if (err.response && err.response.status === 403) {
        setError('Access Denied: You do not have permission to view this page.');
      } else {
        setError('Failed to load users. Please try again.');
      }
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (!authLoading && currentUser && currentUser.is_staff) {
      fetchUsers();
    } else if (!authLoading && (!currentUser || !currentUser.is_staff)) {
        setError('Access Denied: This page is for administrators only.');
        setIsLoading(false);
    }
  }, [filters, currentUser, authLoading]); 

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const sortedUsers = useMemo(() => {
    let sortableUsers = [...users];
    if (sortConfig.key !== null) {
      sortableUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ChevronDown size={14} className="opacity-30"/>; 
    }
    return sortConfig.direction === 'ascending' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };


  if (authLoading || isLoading) return (
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)]">
      <LoadingSpinner size={48} text="Loading User Data..." />
    </div>
  );

  
  if (!currentUser || !currentUser.is_staff) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <AlertMessage type="error" message={error || 'Access Denied: This page is for administrators only.'} />
        <Link to="/dashboard" className="mt-4 inline-block text-teal-600 hover:underline">Go to Dashboard</Link>
      </div>
    );
  }
  
  if (error && users.length === 0) return ( 
    <div className="container mx-auto py-10 px-4">
        <AlertMessage type="error" message={error} onClose={() => setError('')} />
    </div>
  );


  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center mb-4 md:mb-0">
            <Users size={36} className="mr-4 text-teal-600"/> User Management
        </h1>
        
      </div>

      {/* Filters Section */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Users</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                    type="text" name="search" id="search" 
                    value={filters.search} onChange={handleFilterChange}
                    placeholder="Name, email..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
            </div>
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Filter by Role</label>
            <select name="role" id="role" value={filters.role} onChange={handleFilterChange}
                    className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm">
              <option value="">All Roles</option>
              <option value="seeker">Job Seeker</option>
              <option value="employer">Employer</option>
            </select>
          </div>
          <div>
            <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select name="is_active" id="is_active" value={filters.is_active} onChange={handleFilterChange}
                    className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm">
              <option value="">Any Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>
      
      
      {error && users.length > 0 && <AlertMessage type="error" message={error} onClose={() => setError('')} className="my-6"/>}


      {/* Users Table */}
      <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {['id', 'name', 'email', 'role', 'is_active', 'is_staff', 'date_joined'].map((key) => (
                <th key={key} scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                    onClick={() => requestSort(key)}>
                  <div className="flex items-center justify-between">
                    {key.replace('_', ' ')}
                    {getSortIcon(key)}
                  </div>
                </th>
              ))}
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {sortedUsers.length > 0 ? sortedUsers.map(userItem => (
              <UserRow key={userItem.id} user={userItem} />
            )) : (
              <tr>
                <td colSpan="8" className="px-6 py-10 text-center text-sm text-slate-500">
                  No users found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


// The component itself further checks for admin role (is_staff).
const SecuredAdminUserManagementPage = () => (
    <PrivateRoute> 
        <AdminUserManagementPage />
    </PrivateRoute>
    
);

export default SecuredAdminUserManagementPage;
