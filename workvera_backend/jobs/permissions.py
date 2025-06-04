from rest_framework import permissions

class IsEmployerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow employers to create/edit objects.
    Read-only for others.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.role == 'employer'

class IsSeekerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow seekers to perform certain actions.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.role == 'seeker'


class IsOwnerOrEmployerOrReadOnly(permissions.BasePermission):
    """
    Custom permission for object-level access.
    - Allows seekers to manage their own applications.
    - Allows employers to manage applications for their jobs or their own job posts.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        if isinstance(obj, JobPost):
            return obj.employer == request.user and request.user.role == 'employer'

        if isinstance(obj, Application):
            if obj.user == request.user and request.user.role == 'seeker':
                return True
            if obj.job.employer == request.user and request.user.role == 'employer':
                return True
        return False
