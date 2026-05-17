import json
import os
from typing import Any

from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI

from services.dtype import PatentDocument
from services.pdf_generator import generate_report
from services.textClassification import PatentClassifier

load_dotenv()


class PatentAnalysisAgent:
    def __init__(self, classifier: PatentClassifier):
        self.classifier = classifier
        api_key = os.getenv("OPENAI_KEY")
        self.llm = ChatOpenAI(model="gpt-4o", api_key=api_key, temperature=0.1)
        self._pipeline = {}
        self.agent = self._build_agent()

    def _build_agent(self):

        @tool
        def classify_patent(abstract: str, claims: str) -> str:
            """Run the full TRIZ classification pipeline. Accepts abstract text and claims text. Returns the classification output with all extracted principles and analysis."""
            result = self.classifier.classify_patent(abstract, claims)
            self._pipeline["classification"] = result.final_classification
            self._pipeline["classification_raw"] = json.dumps({
                "extracted_problems": result.extracted_problems,
                "topics": result.topics,
                "analysis": result.analysis,
                "dynamic_rule": result.dynamic_rule,
            }, indent=2)
            return result.final_classification

        @tool
        def summarize_patent(patent_json: str) -> str:
            """Generate a structured summary of a patent document. Input is a JSON string of patent data."""
            try:
                data = json.loads(patent_json)
                doc = PatentDocument(**data)
            except Exception:
                doc = PatentDocument()
            result = self.classifier.summarization(doc)
            self._pipeline["summary"] = result
            return result

        @tool
        def generate_questions(summary_and_classification: str) -> str:
            """Generate follow-up questions from the combined summary and classification text."""
            result = self.classifier.generate_suggested_questions(summary_and_classification)
            self._pipeline["questions"] = result
            return result

        @tool
        def compile_latex_report(
            patent_id: str,
            patent_title: str,
            inventor: str,
            publication_date: str,
        ) -> str:
            """Compile all collected pipeline results into a LaTeX PDF report. Call this LAST after classification, summary, and questions are done. Returns the path to the generated PDF."""
            doc = PatentDocument(
                patentID=patent_id,
                title=patent_title,
                inventor=inventor,
                publication_date=publication_date,
            )

            classification = self._pipeline.get("classification", "No classification data.")
            summary = self._pipeline.get("summary", "No summary available.")
            questions = self._pipeline.get("questions", "No questions generated.")

            filepath = generate_report(doc, classification, summary, questions)
            filename = os.path.basename(filepath)

            self._pipeline["pdf"] = filename
            return f"PDF report generated: **{filename}** --- download from `/upload/reports/{filename}`"

        tools = [
            classify_patent,
            summarize_patent,
            generate_questions,
            compile_latex_report,
        ]

        system_prompt = (
            "You are a patent analysis pipeline orchestrator. Your job is to analyze patents "
            "using TRIZ principles and produce a professional LaTeX PDF report.\n\n"

            "When a user submits a patent for analysis, follow this exact pipeline:\n\n"

            "1. **classify_patent** — run the TRIZ classification on the patent abstract and claims.\n"
            "2. **summarize_patent** — generate a structured summary from the patent document JSON.\n"
            "3. **generate_questions** — create follow-up questions from the summary and classification.\n"
            "4. **compile_latex_report** — produce the final LaTeX PDF with all accumulated results.\n\n"

            "After each step, briefly tell the user what was found. "
            "When the PDF is ready, tell them the filename and download URL.\n\n"

            "IMPORTANT: Always call ALL four tools in sequence. Do not skip any step. "
            "The final output is a LaTeX PDF that contains the full analysis."
        )

        return create_agent(
            model=self.llm,
            tools=tools,
            system_prompt=system_prompt,
        )

    def run(self, patent_doc: PatentDocument, abstract: str, claims: str) -> dict[str, Any]:
        self._pipeline = {}

        patent_json = json.dumps({
            "title": patent_doc.title,
            "patentID": patent_doc.patentID,
            "inventor": patent_doc.inventor,
            "publication_date": patent_doc.publication_date,
            "abstract": patent_doc.abstract,
            "background_summary": patent_doc.background_summary,
            "description": patent_doc.description,
            "claims": patent_doc.claims,
        }, indent=2)

        user_message = (
            f"Analyze this patent completely:\n\n"
            f"**Abstract:**\n{abstract}\n\n"
            f"**Claims:**\n{claims}\n\n"
            f"**Full patent document (for summary):**\n{patent_json}\n\n"
            f"Run the full pipeline: classify, summarize, generate questions, then compile the LaTeX PDF report."
        )

        result = self.agent.invoke({"messages": [{"role": "user", "content": user_message}]})
        return {
            "messages": [m.content for m in result["messages"]],
            "pipeline": self._pipeline,
        }
