# jobs/views.py
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend 
from rest_framework.exceptions import PermissionDenied # Make sure this is imported

from .models import JobPost, Application
from .serializers import JobPostSerializer, ApplicationSerializer
from .permissions import IsEmployerOrReadOnly, IsSeekerOrReadOnly, IsOwnerOrEmployerOrReadOnly

class JobPostViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Job Posts.
    - List jobs (GET /api/jobs/posts/) - General public list of active jobs.
    - My Posts (GET /api/jobs/posts/my-posts/) - Employer's own posts (active or inactive).
    - Create job (POST /api/jobs/posts/) - Employer only.
    - Retrieve job details (GET /api/jobs/posts/<id>/).
    - Update job (PUT /api/jobs/posts/<id>/) - Employer owner only.
    - Partial update job (PATCH /api/jobs/posts/<id>/) - Employer owner only.
    - Delete job (DELETE /api/jobs/posts/<id>/) - Employer owner only.
    - Apply to job (POST /api/jobs/posts/<id>/apply/) - Seeker only.
    """
    serializer_class = JobPostSerializer
    # Default permission_classes, will be overridden by get_permissions for specific actions
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsEmployerOrReadOnly] 
    filter_backends = [DjangoFilterBackend] 
    # Ensure your JobPost model has these fields for filtering
    filterset_fields = { 
        'title': ['icontains'],
        'description': ['icontains'],
        'skill_tags': ['icontains'],
        'location': ['icontains'],
        'job_type': ['exact', 'icontains'],
        'gap_friendly': ['exact'],
        'employer__name': ['icontains'], # Allows filtering by employer's name
    }
    search_fields = ['title', 'description', 'skill_tags', 'employer__name', 'location'] # For DRF's SearchFilter if you choose to add it

    def get_queryset(self):
        """
        Dynamically filters the queryset based on the user and action.
        """
        user = self.request.user
        
        if self.action == 'list':
            # For the general public job listing (GET /api/jobs/posts/), always show active jobs.
            # This is called by JobsListPage.js in React.
            return JobPost.objects.filter(is_active=True).order_by('-posted_at')
        
        # For 'my_posts' action, filtering is done within the action itself.
        # For 'retrieve', 'update', 'partial_update', 'destroy' actions,
        # object-level permissions (IsOwnerOrEmployerOrReadOnly) will handle access.
        # This allows an employer to retrieve/edit their own posts, even if inactive.
        # A seeker or guest retrieving a specific post should only see it if active.
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            if user.is_authenticated and hasattr(user, 'role') and user.role == 'employer':
                # An employer can see any of their own posts for detail/edit/delete
                return JobPost.objects.filter(employer=user).order_by('-posted_at') 
            else:
                # Others can only retrieve active posts
                return JobPost.objects.filter(is_active=True).order_by('-posted_at')

        # Default queryset for other unhandled actions, or as a base for `get_object`.
        return JobPost.objects.all().order_by('-posted_at')

    @action(detail=False, methods=['get'], url_path='my-posts', permission_classes=[permissions.IsAuthenticated, IsEmployerOrReadOnly])
    def my_posts(self, request):
        """
        Custom action for an employer to retrieve only their own job posts (active or inactive).
        Accessed via GET /api/jobs/posts/my-posts/
        """
        user = request.user
        # Permission IsEmployerOrReadOnly already ensures only authenticated employers can access.
        
        queryset = JobPost.objects.filter(employer=user).order_by('-posted_at')
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        # Permission IsEmployerOrReadOnly should handle if the user is an employer.
        # The frontend sends 'employer: user.id'.
        # If your JobPostSerializer has 'employer' as a read_only_field for create, 
        # you'd set it here: serializer.save(employer=self.request.user, is_active=True)
        # If 'employer' is writable in the serializer, it will be in serializer.validated_data.
        # You might want to add a check:
        # if serializer.validated_data.get('employer') != self.request.user:
        #     raise PermissionDenied("You can only create jobs for yourself.")
        # For now, assuming frontend sends correct employer ID and serializer validates it if needed, or it's set automatically.
        if not (self.request.user.is_authenticated and hasattr(self.request.user, 'role') and self.request.user.role == 'employer'):
             raise PermissionDenied("Only authenticated employers can post jobs.")
        serializer.save(is_active=True) # New jobs are active by default

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['update', 'partial_update', 'destroy']:
            self.permission_classes = [permissions.IsAuthenticated, IsOwnerOrEmployerOrReadOnly]
        elif self.action == 'apply_to_job':
            self.permission_classes = [permissions.IsAuthenticated, IsSeekerOrReadOnly]
        elif self.action == 'my_posts': 
             self.permission_classes = [permissions.IsAuthenticated, IsEmployerOrReadOnly]
        # For 'create' and 'list', the class-level permissions apply:
        # [permissions.IsAuthenticatedOrReadOnly, IsEmployerOrReadOnly]
        # 'IsAuthenticatedOrReadOnly' allows GET for list,
        # 'IsEmployerOrReadOnly' allows POST for create if user is an employer.
        return super().get_permissions()

    @action(detail=True, methods=['post'], url_path='apply', permission_classes=[permissions.IsAuthenticated, IsSeekerOrReadOnly])
    def apply_to_job(self, request, pk=None):
        job_post = self.get_object() # Will use get_queryset, so job must be active unless current user is owner
        user = request.user

        if not hasattr(user, 'role') or user.role != 'seeker': # Ensure user has role attribute
            return Response({'detail': 'Only job seekers can apply.'}, status=status.HTTP_403_FORBIDDEN)

        if Application.objects.filter(user=user, job=job_post).exists():
            return Response({'detail': 'You have already applied for this job.'}, status=status.HTTP_400_BAD_REQUEST)

        application_data = {'user': user.id, 'job': job_post.id}
        if 'cover_letter' in request.data:
            application_data['cover_letter'] = request.data['cover_letter']

        # Pass context to serializer if it needs request
        serializer = ApplicationSerializer(data=application_data, context={'request': request})
        if serializer.is_valid():
            # If 'user' and 'job' are part of serializer fields and writable, they are in validated_data
            # Otherwise, if they are read-only in serializer, pass them in save()
            # Assuming they are part of the serializer fields or set correctly.
            serializer.save() 
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ApplicationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Applications.
    - List applications (GET /api/jobs/applications/) - Admin/Employer (for their jobs)/Seeker (their own)
    - Retrieve application (GET /api/jobs/applications/<id>/)
    - Update application status (PATCH /api/jobs/applications/<id>/update-status/) - Employer of the job
    - Delete application (DELETE /api/jobs/applications/<id>/) - Seeker (withdraw) or Employer
    """
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated] 

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated: # Should be caught by permission_classes, but good practice
            return Application.objects.none()
            
        if hasattr(user, 'is_staff') and user.is_staff: 
            return Application.objects.all().order_by('-applied_at')
        if hasattr(user, 'role') and user.role == 'employer': 
            return Application.objects.filter(job__employer=user).order_by('-applied_at')
        if hasattr(user, 'role') and user.role == 'seeker': 
            return Application.objects.filter(user=user).order_by('-applied_at')
        return Application.objects.none() 

    def get_permissions(self):
        if self.action == 'create': 
            # Applying for a job is handled by JobPostViewSet's 'apply_to_job' action.
            # Direct creation here might be restricted or have different logic.
            self.permission_classes = [permissions.IsAuthenticated, IsSeekerOrReadOnly]
        elif self.action in ['update', 'partial_update', 'update_status']: # Include custom action
            self.permission_classes = [permissions.IsAuthenticated, IsOwnerOrEmployerOrReadOnly] 
        elif self.action == 'destroy': 
            self.permission_classes = [permissions.IsAuthenticated, IsOwnerOrEmployerOrReadOnly] 
        else: # list, retrieve
            self.permission_classes = [permissions.IsAuthenticated] # get_queryset handles filtering
        return super().get_permissions()

    def perform_create(self, serializer):
        # This is typically for seekers applying via the apply_to_job action.
        # If direct creation via this ViewSet is allowed, ensure user is a seeker.
        if not (hasattr(self.request.user, 'role') and self.request.user.role == 'seeker'):
            raise PermissionDenied("Only seekers can create applications directly (use apply endpoint on JobPost).")
        # If 'user' is a read_only field in serializer, pass it here.
        # Otherwise, it should be in serializer.validated_data if sent from frontend.
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['patch'], url_path='update-status', permission_classes=[permissions.IsAuthenticated, IsOwnerOrEmployerOrReadOnly])
    def update_status(self, request, pk=None):
        application = self.get_object() # Ensures owner/employer can access
        
        # Redundant check if IsOwnerOrEmployerOrReadOnly correctly verifies job employer
        # if request.user != application.job.employer:
        #     return Response({'detail': 'You do not have permission to update this application status.'}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        if not new_status:
            return Response({'detail': 'Status field is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        valid_statuses = [choice[0] for choice in Application.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({'detail': f'Invalid status value. Must be one of: {", ".join(valid_statuses)}'}, status=status.HTTP_400_BAD_REQUEST)

        application.status = new_status
        application.save()
        serializer = self.get_serializer(application)
        return Response(serializer.data)

