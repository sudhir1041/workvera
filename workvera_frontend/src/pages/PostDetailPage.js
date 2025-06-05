import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api'; 
import { useAuth } from '../contexts/AuthContext'; 
import LoadingSpinner from '../components/LoadingSpinner'; 
import AlertMessage from '../components/AlertMessage'; 
import { UserCircle, Clock, MessageSquare, Send, ArrowLeft, ThumbsUp, Edit3, Trash2 } from 'lucide-react';

const CommentCard = ({ comment }) => {
  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
      <div className="flex items-center mb-2">
        {comment.author_detail?.profile_image_url ? (
            <img src={comment.author_detail.profile_image_url} alt={comment.author_detail.name} className="w-7 h-7 rounded-full mr-2 object-cover"/>
        ) : (
            <UserCircle size={20} className="mr-2 text-gray-500" />
        )}
        <span className="text-sm font-semibold text-gray-700">{comment.author_detail?.name || "Anonymous"}</span>
      </div>
      <p className="text-sm text-gray-600 mb-1 whitespace-pre-line leading-relaxed">{comment.content}</p>
      <p className="text-xs text-gray-400">Posted: {new Date(comment.created_at).toLocaleString()}</p>
      
    </div>
  );
};

const PostDetailPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchPostAndComments = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Fetch post details:
      const postResponse = await apiClient.get(`/community/posts/${postId}/`);
      setPost(postResponse.data);
      
      // Fetch comments for the post using the custom action:
      const commentsResponse = await apiClient.get(`/community/posts/${postId}/comments/`);
      setComments(commentsResponse.data.results || commentsResponse.data || []); 

    } catch (err) {
      console.error("Failed to fetch post details or comments:", err);
      if (err.response && err.response.status === 404) {
        setError('Post not found.');
      } else {
        setError('Failed to load the post and its comments. Please try again later.');
      }
      setPost(null);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
        fetchPostAndComments();
    }
  }, [postId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      // setError("Comment cannot be empty."); // This error might be too aggressive if displayed globally
      alert("Comment cannot be empty."); 
      return;
    }
    if (!user) {
      // setError("You must be logged in to comment.");
      alert("You must be logged in to comment.");
      navigate('/login', { state: { from: location } });
      return;
    }
    setIsSubmittingComment(true);
    setError(''); 
    try {
      // API endpoint for creating a comment on a post: /api/community/posts/<id>/comment/
      const response = await apiClient.post(`/community/posts/${postId}/comment/`, { content: newComment });
      setComments(prevComments => [response.data, ...prevComments]); 
      setNewComment('');
    } catch (err) {
      console.error("Failed to submit comment:", err);
      //Set error specific to comment submission, could be displayed near the form
      alert(err.response?.data?.content?.[0] || err.response?.data?.detail || 'Failed to post your comment. Please try again.');
      setError(err.response?.data?.content?.[0] || err.response?.data?.detail || 'Failed to post your comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post || !user || user.id !== post.author_detail?.id) { 
        alert("You can only delete your own posts.");
        return;
    }
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
        setIsLoading(true); 
        setError(''); 
        try {
            await apiClient.delete(`/community/posts/${postId}/`);
            
            alert("Post deleted successfully.");
            navigate('/forum'); 
        } catch (err) {
            console.error("Failed to delete post:", err);
            setError("Failed to delete post. Please try again.");
        } finally {
            setIsLoading(false); 
        }
    }
  };


  if (isLoading && !post) return ( 
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)]">
      <LoadingSpinner size={48} text="Loading Post..." />
    </div>
  );

  if (error && !post) return ( 
    <div className="container mx-auto py-10 px-4">
        <AlertMessage type="error" message={error} />
        <Link to="/forum" className="mt-4 inline-block text-teal-600 hover:underline">&larr; Back to Forum</Link>
    </div>
  );
  
  if (!post) return ( 
     <div className="container mx-auto py-10 px-4 text-center">
        <p className="text-xl text-gray-600">Post not found.</p>
        <Link to="/forum" className="mt-4 inline-block text-teal-600 hover:underline">&larr; Back to Forum</Link>
    </div>
  );


  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Link to="/forum" className="inline-flex items-center text-teal-600 hover:text-teal-700 hover:underline mb-6 text-sm font-medium group">
        <ArrowLeft size={18} className="mr-1.5 group-hover:-translate-x-1 transition-transform" /> Back to Forum
      </Link>

      {/* Display global error messages if any, e.g., from failed delete attempts */}
      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} className="mb-4"/>}


      <article className="bg-white p-6 md:p-8 rounded-xl shadow-xl mb-10">
        {post.category && ( 
            <span className="text-xs bg-teal-100 text-teal-700 px-2.5 py-1 rounded-full font-semibold mb-3 inline-block">
                {post.category}
            </span>
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">{post.title}</h1>
        <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 pb-4 border-b border-gray-100 gap-x-4 gap-y-1">
          <div className="flex items-center">
            {post.author_detail?.profile_image_url ? (
                <img src={post.author_detail.profile_image_url} alt={post.author_detail.name} className="w-7 h-7 rounded-full mr-2 object-cover"/>
            ) : (
                <UserCircle size={20} className="mr-2 text-gray-400" />
            )}
            <span>By <span className="font-medium text-gray-700">{post.author_detail?.name || "Anonymous"}</span></span>
          </div>
          <div className="flex items-center">
            <Clock size={16} className="mr-1 text-gray-400" />
            <span>{new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        
        <div className="prose prose-lg prose-teal max-w-none text-gray-700 leading-relaxed whitespace-pre-line mb-6" dangerouslySetInnerHTML={{ __html: post.content ? post.content.replace(/\n/g, '<br />') : "" }} />
        
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <button className="flex items-center text-sm text-red-500 hover:text-red-600 transition-colors group">
                    <ThumbsUp size={18} className="mr-1.5 group-hover:scale-110 transition-transform"/> ({post.likes_count || 0}) Like 
                </button>
                <span className="flex items-center text-sm text-blue-500">
                    <MessageSquare size={18} className="mr-1.5"/> ({comments.length}) Comments
                </span>
            </div>
            {user && post.author_detail && user.id === post.author_detail.id && ( 
                <div className="flex items-center space-x-2">
                    <Link to={`/forum/posts/${post.id}/edit`} className="p-1.5 text-xs text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-md flex items-center" title="Edit Post">
                        <Edit3 size={14}/>
                    </Link>
                    <button onClick={handleDeletePost} disabled={isLoading} className="p-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md flex items-center disabled:opacity-50" title="Delete Post">
                        <Trash2 size={14}/>
                    </button>
                </div>
            )}
        </div>
      </article>

      <section className="bg-white p-6 md:p-8 rounded-xl shadow-xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Comments ({comments.length})</h2>
        
        {user ? (
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm placeholder-gray-400"
              required
            />
            {/* {commentFormError && <AlertMessage type="error" message={commentFormError} onClose={() => setCommentFormError('')} className="mt-2 text-xs"/>}  */}

            <button 
              type="submit" 
              disabled={isSubmittingComment}
              className="mt-3 px-5 py-2.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors text-sm font-medium flex items-center disabled:bg-teal-400 shadow-sm hover:shadow-md"
            >
              {isSubmittingComment ? <LoadingSpinner size={18} text="Posting..." /> : <><Send size={16} className="mr-2"/> Post Comment</>}
            </button>
          </form>
        ) : (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-300 rounded-md text-yellow-800 text-sm">
                <Link to="/login" state={{ from: location.pathname }} className="font-semibold hover:underline">Log in</Link> or <Link to="/signup" state={{ from: location.pathname }} className="font-semibold hover:underline">sign up</Link> to join the discussion.
            </div>
        )}

        {comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map(comment => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No comments yet. Be the first to share your thoughts!</p>
        )}
      </section>
    </div>
  );
};

export default PostDetailPage;
