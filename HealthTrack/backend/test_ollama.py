import django
import os

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "healthtrack.settings",
)
django.setup()

from symptoms.services import analyze_symptoms

result, cached = analyze_symptoms(
    "I have a mild headache and feel tired."
)

print("AI response:")
print(result)
print("Used cache:", cached)