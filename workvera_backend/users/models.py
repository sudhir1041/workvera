from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):

    def _create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self._create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('employer', 'Employer'),
        ('seeker', 'Seeker'),
    )
    username = None
    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='seeker')
    name = models.CharField(max_length=255, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name'] 

    objects = CustomUserManager()

    def __str__(self):
        return self.email

def user_resume_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/resumes/<filename>
    return f'user_{instance.user.id}/resumes/{filename}'

def user_video_pitch_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/video_pitches/<filename>
    return f'user_{instance.user.id}/video_pitches/{filename}'

class Profile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    resume = models.FileField(upload_to=user_resume_path, blank=True, null=True)
    video_pitch = models.FileField(upload_to=user_video_pitch_path, blank=True, null=True)
    career_gap_years = models.PositiveIntegerField(default=0, help_text="Number of years of career gap, if any.")
    bio = models.TextField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    

    def __str__(self):
        return f"{self.user.email}'s Profile"

# Signal to create/update Profile when CustomUser is created/updated
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=CustomUser)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    # For now, we just create on user creation.
    # instance.profile.save() 
    # This might be needed if you have logic to update profile on user save
