
from pydantic import BaseModel, Field
from typing import List,Dict, Optional

class PatentDocument(BaseModel):
    """Pydantic model for patent document structure with proper field definitions"""
    title: Optional[str] = Field(
        default=None,
        description="Title of the patent",
        example="System and method for automated patent analysis"
    )
    inventor: Optional[str] = Field(
        default=None,
        description="Name(s) of the inventor(s)",
        example="Smith, John; Doe, Jane"
    )
    publication_date: Optional[str] = Field(
        default=None,
        description="Publication date in YYYY-MM-DD format",
        example="2023-05-15"
    )
    abstract: Optional[str] = Field(
        default=None,
        description="Patent abstract text",
        example="A system for analyzing patent documents..."
    )
    background_summary: Optional[str] = Field(
        default=None,
        description="Combined background and summary section",
        example="The field of invention relates to..."
    )
    description: Optional[str] = Field(
        default=None,
        description="Detailed description of the invention",
        example="Referring to FIG. 1, the system comprises..."
    )
    claims: Optional[str] = Field(
        default=None,
        description="Patent claims text",
        example="1. A system comprising: a processor configured to..."
    )
    
    def to_string(self) -> str:
        """Concatenate all fields into a single formatted string."""
        parts = [
            f"Title: {self.title}" if self.title else "",
            f"Inventor(s): {self.inventor}" if self.inventor else "",
            f"Publication Date: {self.publication_date}" if self.publication_date else "",
            f"Abstract:\n{self.abstract}" if self.abstract else "",
            f"Background & Summary:\n{self.background_summary}" if self.background_summary else "",
            f"Description:\n{self.description}" if self.description else "",
            f"Claims:\n{self.claims}" if self.claims else "",
        ]
        return "\n\n".join([part for part in parts if part.strip()])

    def __str__(self):
        return self.to_string()

    
# 📦 Models
class SearchResult(BaseModel):
    """
    Pydantic model for the base model from the RAG knowledgebase
    """
    text: str
    score: float
    topic: str

class TRIZPrinciple(BaseModel):
    principles: Dict[int, str] = Field(...)

class ClassificationPipelineOutput(BaseModel):
    extracted_problems: Dict[str, List[str]]
    topics: List[str]
    context: str
    analysis: str
    dynamic_rule: str
    final_classification: str

    def __str__(self):
        parts = [
            f"Extracted Problems:\n{self.extracted_problems}" if self.extracted_problems else "",
            f"Topics:\n{', '.join(self.topics)}" if self.topics else "",
            f"Context:\n{self.context}" if self.context else "",
            f"Analysis:\n{self.analysis}" if self.analysis else "",
            f"Dynamic Rule:\n{self.dynamic_rule}" if self.dynamic_rule else "",
            f"Final Classification:\n{self.final_classification}" if self.final_classification else "",
        ]
        return "\n\n".join(part for part in parts if part.strip())
        
    
