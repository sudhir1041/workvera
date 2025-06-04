from rest_framework import serializers
from .models import Post, Comment
from users.serializers import CustomUserSerializer 

class CommentSerializer(serializers.ModelSerializer):
    author_detail = CustomUserSerializer(source='author', read_only=True)
    replies = serializers.SerializerMethodField() 

    class Meta:
        model = Comment
        fields = (
            'id',
            'post', 
            'author', 
            'author_detail',
            'content',
            'created_at',
            'updated_at',
            'parent_comment', 
            'replies',
        )
        read_only_fields = ('created_at', 'updated_at', 'author_detail', 'replies')

    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True, context=self.context).data
        return []

class PostSerializer(serializers.ModelSerializer):
    author_detail = CustomUserSerializer(source='author', read_only=True)
    # comments = CommentSerializer(many=True, read_only=True) 
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            'id',
            'title',
            'content',
            'author', 
            'author_detail',
            'created_at',
            'updated_at',
            # 'comments',
            'comments_count',
        )
        read_only_fields = ('created_at', 'updated_at', 'author_detail', 'comments_count')

    def get_comments_count(self, obj):
        return obj.comments.count()