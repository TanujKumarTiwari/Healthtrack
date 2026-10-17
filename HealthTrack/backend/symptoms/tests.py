from unittest.mock import patch

from django.test import SimpleTestCase

from .services import analyze_symptoms


class AnalyzeSymptomsTests(SimpleTestCase):
    @patch("symptoms.services.cache.set")
    @patch("symptoms.services.cache.get", return_value=None)
    @patch(
        "symptoms.services.ollama.chat",
        return_value={
            "message": {
                "content": (
                    '{"possible_conditions": [], "recommended_actions": [], '
                    '"warning_signs": [], "urgency": " Emergency ", '
                    '"disclaimer": "General information only."}'
                )
            }
        },
    )
    def test_normalizes_urgency_case_and_whitespace(
        self, _chat, _cache_get, _cache_set
    ):
        result, cache_hit = analyze_symptoms("test symptom")

        self.assertFalse(cache_hit)
        self.assertEqual(result["urgency"], "emergency")
