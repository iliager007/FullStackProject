from django.db import models

from django.contrib.auth.models import User
class GameResult(models.Model):
   user = models.ForeignKey(User, on_delete=models.CASCADE)
   difficulty = models.CharField(max_length=20)
   time_taken = models.IntegerField()  # Time in seconds
   won = models.BooleanField()
   created_at = models.DateTimeField(auto_now_add=True)
   class Meta:
       ordering = ['-created_at']