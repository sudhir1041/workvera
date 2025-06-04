from django.db import models
from django.conf import settings 

class JobPost(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    employer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='job_posts',
        limit_choices_to={'role': 'employer'} 
    )
    # skill_tags = models.ManyToManyField(Skill, blank=True) 
    skill_tags = models.CharField(max_length=500, blank=True, help_text="Comma-separated list of skills (e.g., Python,Django,React)")
    gap_friendly = models.BooleanField(default=False, help_text="Is this job welcoming to candidates with career gaps?")
    location = models.CharField(max_length=150, blank=True, null=True)
    job_type = models.CharField(max_length=50, blank=True, null=True, help_text="e.g., Full-time, Part-time, Contract")
    posted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True) 

    def __str__(self):
        return f"{self.title} by {self.employer.name or self.employer.email}"

    class Meta:
        ordering = ['-posted_at']


class Application(models.Model):
    STATUS_CHOICES = (
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
        ('shortlisted', 'Shortlisted'),
        ('interviewing', 'Interviewing'),
        ('offered', 'Offered'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'), 
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='applications',
        limit_choices_to={'role': 'seeker'} 
    )
    job = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    applied_at = models.DateTimeField(auto_now_add=True)
    cover_letter = models.TextField(blank=True, null=True)
    # resume_snapshot_url = models.URLField(blank=True, null=True) 

    class Meta:
        unique_together = ('user', 'job') 
        ordering = ['-applied_at']

    def __str__(self):
        return f"Application by {self.user.email} for {self.job.title}"
