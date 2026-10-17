
from rest_framework import serializers
from .models import SymptomSubmission


class SymptomSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SymptomSubmission
        fields = ["id", "symptoms", "ai_response", "created_at"]
        read_only_fields = ["id", "ai_response", "created_at"]

    def validate_symptoms(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Please enter your symptoms."
            )

        if len(value) > 5000:
            raise serializers.ValidationError(
                "Symptoms must be 5000 characters or fewer."
            )

        return value
