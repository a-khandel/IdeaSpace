# diagram_agent.py

from openai import OpenAI
import json
from dotenv import load_dotenv
import os

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

# AI-powered suggestions for user actions
SUGGESTIONS_PROMPT = """
You are a helpful assistant for a diagramming tool. Given the current state or context of the user's project, suggest 3-5 useful features, nodes, or improvements they could add. Suggestions should be short, actionable, and relevant to common diagramming use cases. Output as a JSON array of strings. No prose, no explanation.
"""

def get_suggestions(context: str = ""):
    print("get_suggestions called with context:", context)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SUGGESTIONS_PROMPT},
            {"role": "user", "content": context or "Suggest useful additions for my diagram project."}
        ],
        response_format={"type": "json_object"}
    )
    print("OpenAI response:", response)
    content = response.choices[0].message.content
    print("OpenAI content:", content)
    # Always return a list of suggestions
    suggestions = []
    if isinstance(content, str):
        try:
            parsed = json.loads(content)
            if isinstance(parsed, dict) and 'suggestions' in parsed and isinstance(parsed['suggestions'], list):
                suggestions = parsed['suggestions']
            elif isinstance(parsed, list):
                suggestions = parsed
            else:
                print("Parsed string but unexpected format:", parsed)
        except Exception as e:
            print("Error loading suggestions from string:", e)
    elif isinstance(content, dict):
        if 'suggestions' in content and isinstance(content['suggestions'], list):
            suggestions = content['suggestions']
        else:
            print("Dict content but no 'suggestions' key or not a list:", content)
    elif isinstance(content, list):
        suggestions = content
    else:
        print("Unexpected content format:", content)
    if not isinstance(suggestions, list):
        print("Suggestions is not a list:", suggestions)
        suggestions = []
    return suggestions

DIAGRAM_AGENT_PROMPT = """
You are a Diagram Control Agent for an immersive 3D XR whiteboard.

Your job is to interpret user speech and convert it into JSON instructions
for manipulating nodes, edges, labels, and diagrams.

Your output MUST ALWAYS be valid JSON following this schema:

{
  "actions": [
    {
      "type": "create_node" | "delete_node" | "rename_node" |
               "create_edge" | "delete_edge" |
               "add_label" | "suggestion",
      "id": "string",
      "from": "string",
      "to": "string",
      "text": "string"
    }
  ]
}

Rules:
- Output JSON only.
- No prose. No explanation.
- Infer the user's intent even if the speech is messy.
- If referencing a node that doesn't exist, create it automatically.
- If unclear, choose the most likely interpretation.
- For questions, respond with a "suggestion" action.

Each create_node MUST include a "node_type" field describing the type of node.
Valid node types:
- "service"
- "database"
- "gateway"
- "queue"
- "user"
- "generic"

Example:
{ "type": "create_node", "id": "Authentication", "node_type": "service" }
"""

def get_diagram_actions(transcript: str):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": DIAGRAM_AGENT_PROMPT},
            {"role": "user", "content": transcript}
        ],
        response_format={"type": "json_object"}
    )

    content = response.choices[0].message.content

    # CASE 1: content is already a JSON string
    if isinstance(content, str):
        return json.loads(content)

    # CASE 2: content is a list of content parts
    if isinstance(content, list):
        # look for a text field
        for part in content:
            if hasattr(part, "text"):
                return json.loads(part.text)
            if isinstance(part, dict) and "text" in part:
                return json.loads(part["text"])

    # If neither worked
    raise ValueError(f"Unexpected content format: {content}")

