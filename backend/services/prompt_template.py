from enum import Enum


class Prompt(Enum):
    TOPIC_PROMPT = """\
Through this abstract, extract the main scientific topics it discusses.

Available topics:
- Medicinal Chemistry
- Nanotechnology
- Electrochemistry
- Chemical Engineering
- Biochemistry
- Physical Chemistry
- Analytical Chemistry
- Thermodynamics
- Inorganic Chemistry
- Organic Chemistry
- Astrochemistry
- Quantum Chemistry
- Materials Science
- Polymer Chemistry
- Industrial Chemistry
- Green Chemistry
- Surface Chemistry
- Solid State Chemistry
- Supramolecular Chemistry
- Photochemistry
- Computational Chemistry
- Environmental Chemistry
- Theoretical Chemistry
- Radiochemistry
- Electrical Engineering

Return the answer as a Python list of strings. Maximum 4 topics.

Abstract:
{abstract}
"""
    RULE_CREATION = """\
You are an expert in patent classification and TRIZ principles.

Your task:
1. Reason step-by-step which TRIZ principles best match the following analysis dimensions.
2. Select the most appropriate TRIZ principle(s) without merging or combining them.
3. Write your reasoning and selected principle(s) in clear bullet points.

Instructions:
- Limit your full response to around 200 words.
- For each selected TRIZ principle, include:
  - A dynamic definition based on the analysis.
  - A dynamic short example relevant to the context.
- Only output TRIZ principles directly correlated to the provided description.
- Do not invent new principles or combine multiple TRIZ rules into one.
- Output in markdown format.

Relevant TRIZ background knowledge from previous analysis:
{analysis}
"""
    PROBLEM_EXTRACTION = """\
You are a TRIZ expert specializing in eco-solutions.

Your task:
1. Extract the **primary problem** that the patent claims are trying to solve.
2. Extract **secondary problems** if mentioned.
3. Identify any **combinations** of primary problems.

Output format: a Python dictionary with keys "primary", "secondary", "combination", each containing a list of strings.

Example:
{{
  "primary": ["problem 1"],
  "secondary": ["problem 2"],
  "combination": ["problem 3"]
}}

Patent Claims:
{claims}
"""
    PROBLEM_ANALYSIS = """\
You are a TRIZ expert. Based on the instruction below, do the following:

Break the problem statement down into specific sustainability aspects.
Focus on different dimensions such as:
- Type of resources involved (object being manipulated)
- How it is manipulated (e.g. reduction, optimization, shape changes, material changes)

Problem points:
{problems}

Reasoning in certain subjects:
{reasoning_trace}

Output bullet points of the different dimensions being used.
"""
    FINAL_CLASSIFICATION = """\
You are a TRIZ expert. Based on the abstract and claims below, classify the invention using the TRIZ 40 principles.
Do not replicate the same principles. Keep the explanations as detailed as possible.

Dynamic Rule:
{dynamic_rule}

Patent Claims:
{claims}

Output in bullet points with a concise explanation in markdown format.
"""
    SUMMARIZATION = """\
You are a TRIZ expert professional. Based on the sections provided, give a concise summary of the patent (max 600 words).

Include the following sections:
1. **Problem statement** — highlight what problem the patent tries to solve.
2. **Methodology** — how the patent tries to solve it.
3. **Technical specification** — formula, workflow, or mechanism being implemented.
4. **Limitations** — what limitations the patent has.

Present in a structured, section-divided format.

---
{text}
"""
    INPUT_GUARDRAIL = """\
You are a specialized classifier for a patent analysis assistant.

Classify the query as `True` if it relates to:
1. Summary and overview requests (e.g. "what is this patent about?", "summarize this patent", "explain this patent")
2. Technical aspects of the invention
3. Patent specifications and claims
4. Prior art and technical background
5. Implementation details and methodology
6. Technical advantages and improvements
7. Scientific principles and mechanisms
8. Technical comparisons with existing solutions
9. Patent scope and limitations
10. Technical terminology clarification
11. Innovation and novelty aspects
12. General understanding questions (e.g. "how does it work?", "what problem does it solve?")

Classify as `False` if the query is about:
1. Legal advice or patent filing procedures
2. Business or investment matters
3. Personal or non-technical topics
4. General conversation or unrelated subjects
5. Requests for opinions on patentability
6. Market analysis or commercialization
7. Specific legal interpretations
8. Non-technical comparisons
9. Requests for modifications to the patent
10. Questions about patent enforcement
11. Questions about patent validity or infringement
12. Questions about licensing or commercialization

Important notes:
- Always approve summary and general understanding questions.
- Focus on the technical and informational aspects of the patent.
- Allow questions that help users understand the patent's purpose and functionality.
- Be lenient with questions that seek to understand the patent's core concepts.

Only respond with `True` or `False`.

Query: "{query}"
"""
    OUTPUT_GUARDRAIL = """\
You are a patent response validator. Review and refine the following response to ensure:
1. It stays strictly within the technical scope of the patent.
2. It uses precise technical language.
3. It maintains objectivity and factual accuracy.
4. It cites specific parts of the patent when relevant.
5. It avoids speculation or personal opinions.
6. It follows a clear, structured format.
7. It uses appropriate technical terminology.
8. It maintains a professional tone.
9. It focuses on technical aspects only.
10. It avoids legal interpretations.

If the response needs modification, provide the corrected version.
If the response is appropriate, return it as is.

Response to validate:
{response}
"""
    ECO_GUARDRAIL = """\
You are an expert in ecological and green technology patent analysis.

Task: Evaluate if the following input is either:
1. A summary request (e.g. "what is this patent about?")
2. A problem statement relevant to ecological or green technology

For summary requests:
- Automatically approve if the query asks about patent content, meaning, or purpose.
- Examples: "what's this about?", "summarize this", "explain this patent"

For problem statements, approve if they relate to:
1. **Environmental Impact** — problems related to reducing environmental harm.
2. **Resource Efficiency** — issues about optimizing resource usage.
3. **Sustainability** — challenges in maintaining ecological balance.
4. **Green Innovation** — problems solvable through eco-friendly solutions.
5. **Climate Action** — issues related to climate change mitigation.

Examples of relevant problems:
- "Reducing carbon emissions in manufacturing"
- "Improving water purification efficiency"
- "Minimizing waste in production processes"
- "Developing renewable energy solutions"
- "Creating biodegradable materials"

Examples of irrelevant problems:
- "Increasing production speed"
- "Reducing manufacturing costs"
- "Improving product aesthetics"
- "Enhancing user interface"
- "Optimizing marketing strategies"

Input to evaluate: "{problem}"

Respond with:
- "Yes" if it is a summary request or a relevant ecological/green technology problem.
- "No" if it is an irrelevant problem statement.
"""
