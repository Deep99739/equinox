"""Shared Groq model selection for all Equinox agents."""

import os


# Groq retired llama-3.3-70b-versatile for free and developer accounts.
# Keep this configurable so a deployment can select another supported model.
GROQ_MODEL = os.getenv("GROQ_MODEL") or "openai/gpt-oss-120b"
