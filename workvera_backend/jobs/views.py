from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend 
from .models import JobPost, Application
from .serializers import JobPostSerializer, ApplicationSerializer
from .permissions import IsEmployerOrReadOnly, IsSeekerOrReadOnly, IsOwnerOrEmployerOrReadOnly

class JobPostViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Job Posts.
    - List jobs (GET /api/jobs/) - with filters
    - Create job (POST /api/jobs/) - Employer only
    - Retrieve job details (GET /api/jobs/<id>/)
    - Update job (PUT /api/jobs/<id>/) - Employer owner only
    - Partial update job (PATCH /api/jobs/<id>/) - Employer owner only
    - Delete job (DELETE /api/jobs/<id>/) - Employer owner only
    - Apply to job (POST /api/jobs/<id>/apply/) - Seeker only
    """
    queryset = JobPost.objects.filter(is_active=True) 
    serializer_class = JobPostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsEmployerOrReadOnly] 
    filter_backends = [DjangoFilterBackend] 
    filterset_fields = ['gap_friendly', 'location', 'job_type'] 
    # search_fields = ['title', 'description', 'skill_tags'] 
    # ordering_fields = ['posted_at', 'title'] 

    def perform_create(self, serializer):
        if self.request.user.role != 'employer':
            raise permissions.PermissionDenied("Only employers can post jobs.")
        serializer.save(employer=self.request.user, is_active=True) 

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        For 'update', 'partial_update', 'destroy', only the owner employer can modify.
        """
        if self.action in ['update', 'partial_update', 'destroy']:
            self.permission_classes = [permissions.IsAuthenticated, IsOwnerOrEmployerOrReadOnly]
        elif self.action == 'apply_to_job':
            self.permission_classes = [permissions.IsAuthenticated, IsSeekerOrReadOnly]
        else: 
            self.permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsEmployerOrReadOnly]
        return super().get_permissions()


    @action(detail=True, methods=['post'], url_path='apply', permission_classes=[permissions.IsAuthenticated, IsSeekerOrReadOnly])
    def apply_to_job(self, request, pk=None):
        """
        Apply to a specific job. (POST /api/jobs/<id>/apply/)
        """
        job_post = self.get_object()
        user = request.user

        if user.role != 'seeker':
            return Response({'detail': 'Only job seekers can apply.'}, status=status.HTTP_403_FORBIDDEN)

        if Application.objects.filter(user=user, job=job_post).exists():
            return Response({'detail': 'You have already applied for this job.'}, status=status.HTTP_400_BAD_REQUEST)

        application_data = {'user': user.id, 'job': job_post.id}
        
        if 'cover_letter' in request.data:
            application_data['cover_letter'] = request.data['cover_letter']

        serializer = ApplicationSerializer(data=application_data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=user, job=job_post) 
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ApplicationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Applications.
    - List applications (GET /api/jobs/applications/) - Admin/Employer (for their jobs)/Seeker (their own)
    - Retrieve application (GET /api/jobs/applications/<id>/)
    - Update application status (PATCH /api/jobs/applications/<id>/) - Employer of the job
    - Delete application (DELETE /api/jobs/applications/<id>/) - Seeker (withdraw) or Employer
    """
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated] 

    def get_queryset(self):
        user = self.request.user
        if user.is_staff: 
            return Application.objects.all()
        if user.role == 'employer': 
            return Application.objects.filter(job__employer=user)
        if user.role == 'seeker': 
            return Application.objects.filter(user=user)
        return Application.objects.none() 

    def get_permissions(self):
        """
        - Seekers can create (apply), read their own, delete (withdraw) their own.
        - Employers can read applications for their jobs, update status, delete.
        """
        if self.action == 'create': 
            self.permission_classes = [permissions.IsAuthenticated, IsSeekerOrReadOnly]
        elif self.action in ['update', 'partial_update']: 
            self.permission_classes = [permissions.IsAuthenticated, IsOwnerOrEmployerOrReadOnly] 
        elif self.action == 'destroy': 
            self.permission_classes = [permissions.IsAuthenticated, IsOwnerOrEmployerOrReadOnly] 
        else: 
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()

    def perform_create(self, serializer):
        if self.request.user.role != 'seeker':
            raise permissions.PermissionDenied("Only seekers can create applications directly (use apply endpoint).")
        serializer.save(user=self.request.user)

    
    @action(detail=True, methods=['patch'], url_path='update-status', permission_classes=[permissions.IsAuthenticated, IsOwnerOrEmployerOrReadOnly])
    def update_status(self, request, pk=None):
        application = self.get_object()
        if request.user != application.job.employer:
            return Response({'detail': 'You do not have permission to update this application status.'}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        if not new_status:
            return Response({'detail': 'Status field is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if new_status not in [choice[0] for choice in Application.STATUS_CHOICES]:
            return Response({'detail': 'Invalid status value.'}, status=status.HTTP_400_BAD_REQUEST)

        application.status = new_status
        application.save()
        serializer = self.get_serializer(application)
        return Response(serializer.data)
