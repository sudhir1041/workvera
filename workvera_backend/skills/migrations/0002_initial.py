# Generated by Django 5.2.1 on 2025-06-03 12:34

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('skills', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='skillresult',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='skill_results', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='skilltest',
            name='skill',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tests', to='skills.skill'),
        ),
        migrations.AddField(
            model_name='skillresult',
            name='test',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='results', to='skills.skilltest'),
        ),
        migrations.AlterUniqueTogether(
            name='skillresult',
            unique_together={('user', 'test')},
        ),
    ]
