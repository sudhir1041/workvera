from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Skill, SkillTest, SkillResult
from .serializers import SkillSerializer, SkillTestSerializer, SkillResultSerializer
from users.models import CustomUser 

class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAdminUser] 


class SkillTestViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SkillTest.objects.all()
    serializer_class = SkillTestSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action == 'submit_result':
            self.permission_classes = [permissions.IsAuthenticated]
        else:
            self.permission_classes = [permissions.IsAuthenticatedOrReadOnly]
        return super().get_permissions()

    @action(detail=True, methods=['post'], url_path='submit', permission_classes=[permissions.IsAuthenticated])
    def submit_result(self, request, pk=None):
        skill_test = self.get_object()
        user = request.user

        if SkillResult.objects.filter(user=user, test=skill_test).exists():
            return Response({'detail': 'You have already submitted results for this test.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = SkillResultSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            if 'score' not in request.data:
                 return Response({'detail': 'Score is required.'}, status=status.HTTP_400_BAD_REQUEST)

            serializer.save(user=user, test=skill_test)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SkillResultViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SkillResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return SkillResult.objects.all()
        return SkillResult.objects.filter(user=user)

    @action(detail=False, methods=['get'], url_path='me', permission_classes=[permissions.IsAuthenticated])
    def my_results(self, request):
        user = request.user
        results = SkillResult.objects.filter(user=user).order_by('-submitted_at')
        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)

    def get_permissions(self):
        if self.action == 'retrieve':
            self.permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdminForSkillResult]
        elif self.action == 'my_results':
            self.permission_classes = [permissions.IsAuthenticated]
        elif self.request.user and self.request.user.is_staff:
             self.permission_classes = [permissions.IsAdminUser]
        else:
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()


class IsOwnerOrAdminForSkillResult(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_staff:
            return True
        return obj.user == request.user
