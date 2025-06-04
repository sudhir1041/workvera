from rest_framework import permissions

class IsOwnerOrReadOnlyCommunity(permissions.BasePermission):
    """
    Custom permission to only allow owners of a post or comment to edit it.
    Read-only for others.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the author of the post/comment.
        return obj.author == request.user