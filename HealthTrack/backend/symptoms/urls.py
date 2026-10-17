from django.urls import path
from .views import submit_symptoms, ProviderSubmissionListView

urlpatterns = [
    path("symptoms/", submit_symptoms, name="submit-symptoms"),
    path(
        "provider/submissions/",
        ProviderSubmissionListView.as_view(),
        name="provider-submissions",
    ),
]