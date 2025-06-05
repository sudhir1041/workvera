import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api'; 
import { useAuth } from '../contexts/AuthContext'; 
import LoadingSpinner from '../components/LoadingSpinner'; 
import AlertMessage from '../components/AlertMessage'; 
import { MessageSquare, PlusCircle, UserCircle, Clock, ThumbsUp, MessageCircle as MessageIcon, ChevronRight, Search as SearchIcon, ListFilter, Info } from 'lucide-react';

const ForumPostCard = ({ post }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 h-full flex flex-col group">
        <div className="flex-grow">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs bg-teal-100 text-teal-700 px-2.5 py-1 rounded-full font-semibold">
                    {post.category || "General"}
                </span>
                {/* Placeholder for bookmark or other actions */}
            </div>
            <Link to={`/forum/posts/${post.id}`} className="block hover:no-underline">
                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-teal-600 transition-colors mb-2 line-clamp-2">{post.title}</h3>
            </Link>
            <p className="text-sm text-gray-600 mb-3 line-clamp-3 leading-relaxed">
                {post.content_snippet || (post.content ? post.content.substring(0, 150) + (post.content.length > 150 ? '...' : '') : 'No content preview available.')}
            </p>
            {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.tags.slice(0,3).map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">#{tag}</span>
                    ))}
                </div>
            )}
        </div>
        <div className="mt-auto pt-4 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                {post.author_detail?.profile_image_url ? ( 
                    <img src={post.author_detail.profile_image_url} alt={post.author_detail.name} className="w-6 h-6 rounded-full mr-2 object-cover"/>
                ) : (
                    <UserCircle size={18} className="mr-1.5 text-gray-400" />
                )}
                <span className="font-medium text-gray-700">{post.author_detail?.name || "Anonymous"}</span>
                </div>
                <div className="flex items-center">
                <Clock size={14} className="mr-1 text-gray-400" />
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
            </div>
            <div className="flex items-center justify-start space-x-4 mt-2">
                <span className="flex items-center hover:text-red-600 cursor-pointer transition-colors" title="Likes">
                <ThumbsUp size={14} className="mr-1 text-gray-400 group-hover:text-red-500 transition-colors" /> {post.likes_count || 0}
                </span>
                <span className="flex items-center hover:text-blue-600 cursor-pointer transition-colors" title="Comments">
                <MessageIcon size={14} className="mr-1 text-gray-400 group-hover:text-blue-500 transition-colors" /> {post.comments_count || 0}
                </span>
            </div>
        </div>
        <Link to={`/forum/posts/${post.id}`} className="mt-4 inline-flex items-center justify-center w-full px-4 py-2 border border-teal-600 text-sm font-medium rounded-md text-teal-600 hover:bg-teal-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors">
            Read More <ChevronRight size={16} className="ml-1"/>
        </Link>
    </div>
  );
};

const ForumPage = () => {
  const [allPosts, setAllPosts] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth(); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState(''); 

  const categories = ["All", "Interview Tips", "Career Advice", "Learning Resources", "Company Insights", "Skill Development", "General Discussion"];


  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError('');
      try {
        const params = {};
        // if (searchTerm) params.search = searchTerm; 
        // if (filterCategory && filterCategory !== "All") params.category = filterCategory; 

        const response = await apiClient.get('/community/posts/', { params });
        setAllPosts(response.data.results || response.data || []); 
      } catch (err) {
        console.error("Failed to fetch forum posts:", err);
        setError('Failed to load forum posts. Please try again later.');
        setAllPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []); 

  const filteredPosts = useMemo(() => {
    let postsToShow = allPosts;
    if (searchTerm) {
        postsToShow = postsToShow.filter(post => 
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (post.author_detail?.name && post.author_detail.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }
    if (filterCategory && filterCategory !== "All") {
        postsToShow = postsToShow.filter(post => post.category === filterCategory);
    }
    return postsToShow;
  }, [allPosts, searchTerm, filterCategory]);


  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center mb-4 md:mb-0">
            <MessageSquare size={36} className="mr-4 text-teal-600"/> Community Forum
        </h1>
        {user && ( 
            <Link 
                to="/forum/create-post" 
                className="px-5 py-2.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors text-sm font-medium flex items-center self-start md:self-auto shadow-sm hover:shadow-md"
            >
                <PlusCircle size={18} className="mr-2"/> Create New Post
            </Link>
        )}
      </div>
      
      <div className="mb-8 p-4 bg-white rounded-lg shadow-md sticky top-20 z-10"> 
        <div className="grid sm:grid-cols-2 gap-4 items-end">
            <div>
                <label htmlFor="search-forum" className="block text-sm font-medium text-gray-700 mb-1">Search Posts</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                        type="text" 
                        id="search-forum"
                        placeholder="Search by title, content, or author..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
                <select 
                    id="category-filter"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
            <LoadingSpinner size={48} text="Loading Forum Posts..." />
        </div>
      )}
      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} className="my-6"/>}
      
      {!isLoading && filteredPosts.length === 0 ? (
         <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <Info size={56} className="mx-auto text-gray-300 mb-5" />
            <p className="text-xl text-gray-600 font-semibold">
                {searchTerm || (filterCategory && filterCategory !== "All") ? "No posts match your criteria." : "No forum posts available yet."}
            </p>
            <p className="text-gray-500 mt-2">
                {searchTerm || (filterCategory && filterCategory !== "All") ? "Try adjusting your search or filters, or " : ""}
                {user ? 
                    <Link to="/forum/create-post" className="text-teal-600 hover:underline font-medium">be the first to start a discussion!</Link> 
                    : "Check back later for new discussions."}
            </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
          {filteredPosts.map(post => (
            <ForumPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
      
    </div>
  );
};

export default ForumPage;
