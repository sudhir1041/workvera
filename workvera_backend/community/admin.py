from django.contrib import admin
from .models import Post, Comment

class CommentInline(admin.TabularInline): 
    model = Comment
    extra = 1 
    fields = ('author', 'content', 'parent_comment', 'created_at')
    readonly_fields = ('created_at',)
    raw_id_fields = ('author', 'parent_comment')


class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'created_at', 'comments_count_admin')
    list_filter = ('created_at', 'author')
    search_fields = ('title', 'content', 'author__email')
    raw_id_fields = ('author',)
    inlines = [CommentInline]

    def comments_count_admin(self, obj):
        return obj.comments.count()
    comments_count_admin.short_description = 'Comments Count'


class CommentAdmin(admin.ModelAdmin):
    list_display = ('content_snippet', 'author', 'post', 'parent_comment', 'created_at')
    list_filter = ('created_at', 'author', 'post__title')
    search_fields = ('content', 'author__email', 'post__title')
    raw_id_fields = ('author', 'post', 'parent_comment')

    def content_snippet(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_snippet.short_description = 'Content'


admin.site.register(Post, PostAdmin)
admin.site.register(Comment, CommentAdmin)
