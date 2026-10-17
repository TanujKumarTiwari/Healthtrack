from django.db import models


class SymptomSubmission(models.Model):
    symptoms = models.TextField()
    ai_response = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Submission #{self.pk}"
