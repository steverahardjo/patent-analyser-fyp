import json
import os

import dspy
from dotenv import load_dotenv

from services.dtype import ClassificationPipelineOutput

load_dotenv()

OPENAI_KEY = os.getenv("OPENAI_KEY")

_main_lm = dspy.LM("openai/gpt-4o", api_key=OPENAI_KEY, temperature=0.3)
_cheap_lm = dspy.LM("openai/gpt-4o-mini", api_key=OPENAI_KEY, temperature=0.3)
dspy.configure(lm=_main_lm)


class ProblemExtractor:
    def __init__(self):
        self.rlm = dspy.RLM(
            "claims -> output",
            max_iterations=6,
            sub_lm=_cheap_lm,
        )

    def extract(self, claims: str) -> str:
        result = self.rlm(claims=claims)
        return result.output


class RLMFullClassifier:
    def __init__(self, language_model=None):
        self.rlm = dspy.RLM(
            "context, abstract, claims -> classification",
            max_iterations=15,
            sub_lm=_cheap_lm,
        )

    def classify(self, abstract: str, claims: str) -> str:
        combined_context = f"ABSTRACT:\n{abstract}\n\nCLAIMS:\n{claims}"
        result = self.rlm(
            context=combined_context,
            abstract=abstract,
            claims=claims,
        )
        return result.classification

    def classify_structured(self, abstract: str, claims: str) -> ClassificationPipelineOutput:
        raw = self.classify(abstract, claims)
        try:
            parsed = json.loads(raw) if isinstance(raw, str) else raw
            if isinstance(parsed, dict):
                return ClassificationPipelineOutput(
                    extracted_problems=parsed.get("extracted_problems", {}),
                    topics=parsed.get("topics", []),
                    context=parsed.get("context", ""),
                    analysis=parsed.get("analysis", ""),
                    dynamic_rule=parsed.get("dynamic_rule", ""),
                    final_classification=parsed.get("final_classification", raw),
                )
        except (json.JSONDecodeError, TypeError):
            pass
        return ClassificationPipelineOutput(
            extracted_problems={}, topics=[], context="",
            analysis="", dynamic_rule="",
            final_classification=str(raw),
        )
