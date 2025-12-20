
import google.generativeai as genai
import os
from typing import List, Dict

class SynthesizerAgent:
    def __init__(self):
        self.model = genai.GenerativeModel(model_name="gemini-2.5-flash")

    async def synthesize(self, user_query: str, expert_responses: Dict[str, str], output_format: str = "Standard", criteria: str = "Relevance") -> Dict[str, str]:
        
        compiled_responses = "\n\n".join([f"--- {name} ---\n{response}" for name, response in expert_responses.items()])
        
        prompt = f"""
        You are the Synthesizer Agent, a meta-cognitive adjudicator.
        
        Original User Query: {user_query}
        User Specified Output Format: {output_format}
        Judgement Criteria: {criteria}
        
        You have received the following expert opinions:
        {compiled_responses}
        
        Your task:
        1. Analyze the different perspectives.
        2. Identify common grounds and conflicts.
        3. Resolve contradictions using logical reasoning.
        4. Synthesize a final consensus answer.
        5. Evaluate your synthesis based on the criteria.
        
        OUTPUT FORMAT (Strict JSON):
        {{
            "reasoning": "Explain your thought process, how you resolved conflicts, and why you chose this path.",
            "consensus": "The final synthesized answer in the requested format ({output_format})."
        }}
        """
        
        try:
            response = await self.model.generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.4,
                    response_mime_type="application/json"
                )
            )
            import json
            return json.loads(response.text)
        except Exception as e:
            return {"consensus": f"Error synthesizing: {str(e)}", "reasoning": "Failed to generate."}
