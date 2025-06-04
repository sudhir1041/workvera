from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Post, Comment
from .serializers import PostSerializer, CommentSerializer
from .permissions import IsOwnerOrReadOnlyCommunity

class PostViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Community Posts.
    - List posts (GET /api/community/posts/)
    - Create post (POST /api/community/posts/) - Authenticated users
    - Retrieve post (GET /api/community/posts/<id>/)
    - Update post (PUT /api/community/posts/<id>/) - Owner only
    - Delete post (DELETE /api/community/posts/<id>/) - Owner only
    - List comments for a post (GET /api/community/posts/<id>/comments/)
    - Create comment on a post (POST /api/community/posts/<id>/comments/)
    """
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnlyCommunity]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['get'], url_path='comments', permission_classes=[permissions.IsAuthenticatedOrReadOnly])
    def list_comments(self, request, pk=None):
        """
        List all top-level comments for a specific post.
        GET /api/community/posts/<id>/comments/
        """
        post = self.get_object()
        comments = Comment.objects.filter(post=post, parent_comment__isnull=True).order_by('created_at')
        page = self.paginate_queryset(comments) 
        if page is not None:
            serializer = CommentSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = CommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='comment', permission_classes=[permissions.IsAuthenticated])
    def create_comment_on_post(self, request, pk=None):
        """
        Create a new comment (or reply) on a specific post.
        POST /api/community/posts/<id>/comment/
        Body: { "content": "My comment", "parent_comment": null_or_id_of_parent }
        """
        post = self.get_object()
        data = request.data.copy()
        data['post'] = post.id 
        serializer = CommentSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save(author=request.user, post=post) 
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Comments.
    - List comments (GET /api/community/comments/) - Generally not primary way to access, use post's comments.
    - Create comment (POST /api/community/comments/) - Authenticated users (better via post endpoint)
    - Retrieve comment (GET /api/community/comments/<id>/)
    - Update comment (PUT /api/community/comments/<id>/) - Owner only
    - Delete comment (DELETE /api/community/comments/<id>/) - Owner only
    """
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnlyCommunity]

    def perform_create(self, serializer):
        if 'post' not in serializer.validated_data:
             raise serializers.ValidationError({"post": "Post ID is required to create a comment."})
        serializer.save(author=self.request.user)

    