from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import CustomUser, Profile

class CustomUserAdmin(BaseUserAdmin):
    model = CustomUser
    # Use email as the main identifier in admin
    list_display = ('email', 'name', 'role', 'is_staff', 'is_active',)
    list_filter = ('role', 'is_staff', 'is_active',)
    search_fields = ('email', 'name',)
    ordering = ('email',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('name', 'first_name', 'last_name', 'role')}), # Add 'role' here
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'role', 'password', 'password2'), # For user creation form
        }),
    )


class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'career_gap_years', 'resume_exists', 'video_pitch_exists')
    search_fields = ('user__email', 'user__name')
    list_filter = ('career_gap_years',)

    def resume_exists(self, obj):
        return bool(obj.resume)
    resume_exists.boolean = True

    def video_pitch_exists(self, obj):
        return bool(obj.video_pitch)
    video_pitch_exists.boolean = True

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Profile, ProfileAdmin)
