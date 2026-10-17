from django.shortcuts import render

import logging

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from .models import SymptomSubmission
from .serializers import SymptomSubmissionSerializer
from .services import analyze_symptoms

logger = logging.getLogger(__name__)


@api_view(["POST"])
@permission_classes([AllowAny])
def submit_symptoms(request):
    serializer = SymptomSubmissionSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        analysis, cache_hit = analyze_symptoms(
            serializer.validated_data["symptoms"]
        )

        submission = serializer.save(ai_response=analysis)

        return Response(
            {
                "id": submission.id,
                "symptoms": submission.symptoms,
                "ai_response": analysis,
                "cached": cache_hit,
            },
            status=status.HTTP_201_CREATED,
        )

    except Exception:
        logger.exception("Symptom analysis failed")
        return Response(
            {
                "error": (
                    "Analysis is temporarily unavailable. "
                    "Please try again later."
                )
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


class ProviderSubmissionListView(generics.ListAPIView):
    serializer_class = SymptomSubmissionSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return SymptomSubmission.objects.order_by("-created_at")
