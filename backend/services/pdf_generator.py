import os
from datetime import datetime
from pylatex import (
    Document,
    Section,
    Subsection,
    Tabular,
    LongTable,
    MultiColumn,
    NoEscape,
    HFill,
    HugeText,
    LargeText,
    MediumText,
    LineBreak,
    NewPage,
    PageStyle,
    Head,
    Foot,
    simple_page_number,
    Command,
    Figure,
    Package,
)

from services.dtype import PatentDocument

REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "reports")


def _ensure_reports_dir():
    os.makedirs(REPORTS_DIR, exist_ok=True)


def _esc(text: str) -> str:
    chars = str(text) if text else ""
    for c in "%#$&{}_~^\\":
        chars = chars.replace(c, f"\\{c}")
    return chars.replace("\n", " \\newline ")


def _build_document(patent: PatentDocument) -> Document:
    geometry_options = {"margin": "2.5cm", "headheight": "2cm", "headsep": "1cm", "footskip": "1cm"}
    doc = Document(documentclass="report", geometry_options=geometry_options)

    doc.packages.append(Package("graphicx"))
    doc.packages.append(Package("xcolor"))
    doc.packages.append(Package("hyperref"))
    doc.packages.append(Package("titlesec"))
    doc.packages.append(Package("fancyhdr"))
    doc.packages.append(Package("setspace"))
    doc.packages.append(Package("booktabs"))

    doc.preamble.append(NoEscape(r"""
\definecolor{primary}{HTML}{1a3c34}
\definecolor{accent}{HTML}{2d6a4f}
\definecolor{lightbg}{HTML}{f0f7f4}
\titleformat{\chapter}[display]
  {\normalfont\bfseries\color{primary}}{}{0pt}{\Huge}
\titlespacing*{\chapter}{0pt}{-20pt}{20pt}
\titleformat{\section}
  {\normalfont\Large\bfseries\color{accent}}{}{0pt}{}
\setstretch{1.15}
\hypersetup{colorlinks=true,urlcolor=accent,linkcolor=primary}
"""))

    header = PageStyle("fancy")
    with header.create(Head("L")) as h:
        h.append(NoEscape(r"\small\textcolor{gray}{Patent Analysis Report}"))
    with header.create(Head("R")) as h:
        h.append(NoEscape(r"\small\textcolor{gray}{\thepage}"))
    with header.create(Foot("C")) as f:
        f.append(NoEscape(r"\small\textcolor{gray}{EcoPatent Analyzer --- " + datetime.now().strftime("%B %Y") + "}"))
    doc.preamble.append(header)
    doc.change_document_style("fancy")

    return doc


def _build_cover(doc: Document, patent: PatentDocument):
    doc.append(NoEscape(r"\thispagestyle{empty}"))
    doc.append(NoEscape(r"\begin{center}"))
    doc.append(NoEscape(r"\vspace*{4cm}"))
    doc.append(HugeText(NoEscape(r"\textcolor{primary}{Patent Analysis Report}")))
    doc.append(LineBreak())
    doc.append(NoEscape(r"\vspace{0.5cm}"))
    doc.append(LargeText(NoEscape(r"\textcolor{gray}{TRIZ Classification \\ AI-Powered Analysis}")))
    doc.append(LineBreak())
    doc.append(NoEscape(r"\vspace{0.3cm}"))
    doc.append(MediumText(NoEscape(
        r"\textcolor{gray}{" + datetime.now().strftime("%B %d, %Y at %H:%M") + r"}"
    )))
    doc.append(NoEscape(r"\vspace{2cm}"))
    doc.append(NoEscape(r"\end{center}"))

    with doc.create(Tabular("|p{4cm}|p{10cm}|")) as table:
        table.add_hline()
        rows = [
            ("Patent Number", patent.patentID),
            ("Title", patent.title),
            ("Inventor(s)", patent.inventor),
            ("Publication Date", patent.publication_date),
        ]
        for label, value in rows:
            table.add_row(
                NoEscape(r"\textbf{\textcolor{white}{" + _esc(label) + r"}}"),
                NoEscape(_esc(value or "—")),
            )
            table.add_hline()
    doc.append(NewPage())


def _add_classification_section(doc: Document, classification: str):
    with doc.create(Section("TRIZ Classification Results", numbering=False)):
        doc.append("The following TRIZ principles were identified for this patent:")
        doc.append(NoEscape(r"\vspace{0.3cm}"))

        lines = [l.strip() for l in classification.split("\n") if l.strip()]
        data_rows = []
        idx = 0
        for line in lines:
            if any(line.lower().startswith(f"{i}.") for i in range(1, 41)):
                idx += 1
                parts = line.split(".", 1)
                label = parts[1].strip() if len(parts) > 1 else line
                data_rows.append([str(idx), _esc(label[:60]), _esc(label[60:120])])

        if data_rows:
            with doc.create(LongTable("|c|p{4cm}|p{8cm}|")) as table:
                table.add_hline()
                table.add_row(
                    NoEscape(r"\textbf{No.}"),
                    NoEscape(r"\textbf{TRIZ Principle}"),
                    NoEscape(r"\textbf{Description}"),
                )
                table.add_hline()
                table.end_table_header()
                table.add_hline()
                table.add_row(
                    NoEscape(r"\textit{Continued}"),
                    NoEscape(r""),
                    NoEscape(r""),
                )
                table.add_hline()
                table.end_table_footer()

                for row in data_rows:
                    table.add_row(NoEscape(row[0]), NoEscape(row[1]), NoEscape(row[2]))
                    table.add_hline()
        else:
            for line in lines:
                doc.append(NoEscape(_esc(line)))
                doc.append(NoEscape(r"\newline "))

    doc.append(NewPage())


def _add_summary_section(doc: Document, summary: str):
    with doc.create(Section("Patent Summary", numbering=False)):
        paragraphs = summary.strip().split("\n\n")
        for para in paragraphs:
            doc.append(NoEscape(_esc(para.strip())))
            doc.append(NoEscape(r"\vspace{0.3cm}"))


def _add_questions_section(doc: Document, questions: str):
    with doc.create(Section("Suggested Questions", numbering=False)):
        doc.append("The following questions can help explore this patent further:")
        doc.append(NoEscape(r"\vspace{0.3cm}"))
        for line in questions.strip().split("\n"):
            line = line.strip()
            if line:
                doc.append(NoEscape(r"\textbf{\textcolor{accent}{" + _esc(line) + r"}}"))
                doc.append(NoEscape(r"\vspace{0.1cm}"))


def generate_report(patent: PatentDocument, classification: str, summary: str, questions: str) -> str:
    _ensure_reports_dir()
    patent_id = patent.patentID or "unknown"
    safe_id = "".join(c for c in patent_id if c.isalnum() or c in "-_")
    filename = f"patent_{safe_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    filepath = os.path.join(REPORTS_DIR, filename)

    doc = _build_document(patent)
    _build_cover(doc, patent)

    with doc.create(Section("Analysis Pipeline", numbering=False)):
        doc.append("This report was generated by the EcoPatent Analyzer AI agent. "
                   "The analysis pipeline included the following steps:")
        doc.append(NoEscape(r"\begin{enumerate}"))
        doc.append(NoEscape(r"\item \textbf{Classification} --- TRIZ principles identified from patent claims"))
        doc.append(NoEscape(r"\item \textbf{Summary} --- AI-generated concise patent summary"))
        doc.append(NoEscape(r"\item \textbf{Questions} --- Suggested research questions"))
        doc.append(NoEscape(r"\item \textbf{Report} --- LaTeX-compiled PDF document"))
        doc.append(NoEscape(r"\end{enumerate}"))

    _add_classification_section(doc, classification)
    _add_summary_section(doc, summary)
    _add_questions_section(doc, questions)

    doc.generate_pdf(filepath.replace(".pdf", ""), clean_tex=False)
    return filepath
