from rest_framework import serializers
from .models import Skill, SkillTest, SkillResult
from users.serializers import CustomUserSerializer

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ('id', 'name', 'description')

class SkillTestSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True, allow_null=True)

    class Meta:
        model = SkillTest
        fields = ('id', 'title', 'description', 'skill', 'skill_name', 'created_at', 'updated_at')

class SkillResultSerializer(serializers.ModelSerializer):
    user_detail = CustomUserSerializer(source='user', read_only=True)
    test_title = serializers.CharField(source='test.title', read_only=True)
    skill_tested = serializers.CharField(source='test.skill.name', read_only=True, allow_null=True)

    class Meta:
        model = SkillResult
        fields = (
            'id',
            'user',
            'user_detail',
            'test', 
            'test_title',
            'skill_tested',
            'score',
            'submitted_at',
        )
        read_only_fields = ('submitted_at', 'user_detail', 'test_title', 'skill_tested')

    def validate(self, data):
        """
        Check that the user hasn't already submitted results for this test.
        """
        user = self.context['request'].user if 'request' in self.context else data.get('user')
        test = data.get('test')

        if SkillResult.objects.filter(user=user, test=test).exists():
            if not self.instance: 
                 raise serializers.ValidationError("You have already submitted results for this skill test.")
        return data
