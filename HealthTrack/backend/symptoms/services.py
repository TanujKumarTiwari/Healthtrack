
import hashlib
import json
import os

import ollama
from django.core.cache import cache
from dotenv import load_dotenv

load_dotenv()

MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

SYSTEM_PROMPT = """
You provide general health information, not a medical diagnosis.

Return a valid JSON object with these fields:
- possible_conditions: list of objects containing name and explanation
- recommended_actions: list of strings
- warning_signs: list of strings
- urgency: exactly one of "routine", "prompt", "urgent", or "emergency"
- disclaimer: string

Do not claim certainty, invent probabilities, or prescribe medication.
If symptoms may indicate an emergency, prioritize immediate medical
attention and local emergency services.
State when there is insufficient information.

This output is not a substitute for a clinician's assessment.
"""


def analyze_symptoms(symptoms):
    normalized = " ".join(symptoms.casefold().split())

    digest = hashlib.sha256(normalized.encode()).hexdigest()
    cache_key = f"healthtrack:v1:{digest}"

    cached = cache.get(cache_key)
    if cached is not None:
        return cached, True

    response = ollama.chat(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": normalized},
        ],
        format="json",
        options={"temperature": 0.2},
    )

    content = response["message"]["content"]
    result = json.loads(content)

    required = {
        "possible_conditions",
        "recommended_actions",
        "warning_signs",
        "urgency",
        "disclaimer",
    }

    if not required.issubset(result):
        raise ValueError("AI response is missing required fields")

    urgency = result["urgency"]
    if not isinstance(urgency, str):
        raise ValueError("Invalid urgency value")

    urgency = urgency.strip().casefold()
    if urgency not in {
        "routine", "prompt", "urgent", "emergency"
    }:
        raise ValueError("Invalid urgency value")
    result["urgency"] = urgency

    if not isinstance(result["possible_conditions"], list):
        raise ValueError("Invalid possible_conditions")

    if not isinstance(result["recommended_actions"], list):
        raise ValueError("Invalid recommended_actions")

    if not isinstance(result["warning_signs"], list):
        raise ValueError("Invalid warning_signs")

    if not isinstance(result["disclaimer"], str):
        raise ValueError("Invalid disclaimer")

    cache.set(cache_key, result, timeout=3600)

    return result, False
