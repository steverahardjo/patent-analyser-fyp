from enum import Enum

class Prompt(Enum):
    TOPIC_PROMPT="""
    Through this abstract:
    - extract main scientific topic this talked about
    choices to select:
    ['Medicinal Chemistry', 'Nanotechnology', 'Electrochemistry', 'Chemical Engineering', 'Biochemistry', 'Physical Chemistry', 'Analytical Chemistry', 'Thermodynamics', 'Inorganic Chemistry', 'Organic Chemistry', 'Astrochemistry', 'Quantum Chemistry', 'Materials Science', 'Polymer Chemistry', 'Industrial Chemistry', 'Green Chemistry', 'Surface Chemistry', 'Solid State Chemistry', 'Supramolecular Chemistry', 'Photochemistry', 'Computational Chemistry', 'Environmental Chemistry', 'Theoretical Chemistry', 'Radiochemistry', 'electrical engineering]
    RETURN IN A LIST OF STRING FORMAT(Python)
    ANSWER CAN BE MAX 4 TOPICS
    {abstract}
    """
    RULE_CREATION = """
    You are an expert in patent classification and TRIZ principles.

    Your task:

    1. Step-by-step, reason which TRIZ principles best match the following analysis dimensions.
    2. Select the most appropriate TRIZ principle(s) without merging or combining different principles.
    3. Write your reasoning and selected principle(s) in clear points.

    Instructions:
    - Limit your full response to around 200 words.
    - For each selected TRIZ principle, include:
    - A dynamic definition based on the analysis.
    - A dynamic short example relevant to the context.
    - Only output TRIZ principles you find directly correlated to the provided description.
    - Do NOT invent new principles or combine multiple TRIZ rules into one.
    - output in example output
    
    Relevant TRIZ background knowledge from previous analysis:
    {analysis}
    """
    PROBLEM_EXTRACTION = """
    You are a TRIZ expert specializing in eco-solutions. Your task is:

    1. Extract the **primary problem** that the patent claims are trying to solve.
    2. Extract **secondary problems** if mentioned.
    3. Identify any **combinations** of primary problems.

    📝 Expected Output:
    - Format: A Python dictionary with keys: "primary", "secondary", "combination", each containing a list of strings.
    - Example:

    Input Patent Claims:
    {claims}
    
    Output format in Python dtype:
    Dict[List[str]]
        """
    
    PROBLEM_ANALYSIS = """
    You are a TRIZ expert, based on the instruction I give you, do this:
    Break the problem statement down into specific sustainability aspect
    Focus on different dimension such as:
    Type of resources involved (object being manipulated)
    How it's manipulated (e.g reduction, optimization, shape changes, material changes)
    Problem points:
    {problems}
    
    reasoning in certain subjects: 
    {reasoning_trace}
    
    Output: points of different dimensions being used
    """
    FINAL_CLASSIFICATION = """
    You are a TRIZ expert. Based on the abstract and claims below, classify the invention using TRIZ 40 principles.
    Don't replicate the same principles, keep the explanations as detailed as possible.
    
    Dynamic Rule:
    {dynamic_rule}

    Patent Claims:
    {claims}
    
    Output in points and give concise explanation in markdown format
    
    """
    
    SUMMARIZATION="""
    You are a TRIZ expert. Based on these sections I gave you, give me a concise summary of the patent, be concise in 600 words.
    Here is your guide:
    1. Highlight what problem it try to solve 
    2. How it trying to solve this problem
    3. Whats the technical specification (formula, workflow, mechanism) being implemented.
    4. Is there any limitation
    
    {text}
    
    """
    INPUT_GUARDRAIL = """
    You are a specialized classifier for a patent analysis assistant.

    Your task is to evaluate whether a query is appropriate for patent analysis and understanding.

    Classify the query as `True` if it relates to:
    1. Summary and overview requests (e.g., "what's this patent about?", "summarize this patent", "explain this patent", "what does this patent do?")
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
    12. General understanding questions (e.g., "how does it work?", "what's the main idea?", "what problem does it solve?")

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

    Important Notes:
    - Always approve summary and general understanding questions
    - Focus on the technical and informational aspects of the patent
    - Allow questions that help users understand the patent's purpose and functionality
    - Be lenient with questions that seek to understand the patent's core concepts

    Only respond with `True` or `False`.

    Query: "{query}"
    """
    OUTPUT_GUARDRAIL = """
    You are a patent response validator. Review and refine the following response to ensure it:
    1. Stays strictly within the technical scope of the patent
    2. Uses precise technical language
    3. Maintains objectivity and factual accuracy
    4. Cites specific parts of the patent when relevant
    5. Avoids speculation or personal opinions
    6. Follows a clear, structured format
    7. Uses appropriate technical terminology
    8. Maintains professional tone
    9. Focuses on technical aspects only
    10. Avoids legal interpretations

    If the response needs modification, provide the corrected version.
    If the response is appropriate, return it as is.

    Response to validate:
    {response}
    """
    ECO_GUARDRAIL = """
    You are an expert in ecological and green technology patent analysis.

    Task: Evaluate if the following input is either:
    1. A summary request (e.g., "what's this patent about?")
    2. A problem statement relevant to ecological or green technology

    Classification Criteria:
    For Summary Requests:
    - Automatically approve if the query asks about patent content, meaning, or purpose
    - Examples: "what's this about?", "summarize this", "explain this patent"

    For Problem Statements:
    1. Environmental Impact: Problems related to reducing environmental harm
    2. Resource Efficiency: Issues about optimizing resource usage
    3. Sustainability: Challenges in maintaining ecological balance
    4. Green Innovation: Problems solvable through eco-friendly solutions
    5. Climate Action: Issues related to climate change mitigation

    Examples of Relevant Problems:
    - "Reducing carbon emissions in manufacturing"
    - "Improving water purification efficiency"
    - "Minimizing waste in production processes"
    - "Developing renewable energy solutions"
    - "Creating biodegradable materials"

    Examples of Irrelevant Problems:
    - "Increasing production speed"
    - "Reducing manufacturing costs"
    - "Improving product aesthetics"
    - "Enhancing user interface"
    - "Optimizing marketing strategies"

    Input to Evaluate: "{problem}"

    Respond with:
    - "Yes" if it's a summary request OR a relevant ecological/green technology problem
    - "No" if it's an irrelevant problem statement
    """