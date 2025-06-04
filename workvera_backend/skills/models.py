from django.db import models
from django.conf import settings 

# A simple Skill model that can be referenced by SkillTest and potentially by User Profile or JobPost
class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class SkillTest(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    skill = models.ForeignKey(Skill, on_delete=models.SET_NULL, null=True, blank=True, related_name='tests')
    # 'duration_minutes' 
    # 'pass_criteria' 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} (Skill: {self.skill.name if self.skill else 'General'})"

class SkillResult(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='skill_results')
    test = models.ForeignKey(SkillTest, on_delete=models.CASCADE, related_name='results')
    score = models.FloatField(help_text="Score achieved by the user, e.g., percentage 0-100 or points.")
    details = models.JSONField(blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    # 'is_passed' 

    class Meta:
        unique_together = ('user', 'test') 
        ordering = ['-submitted_at']

    def __str__(self):
        return f"Result for {self.user.email} on {self.test.title} - Score: {self.score}"
