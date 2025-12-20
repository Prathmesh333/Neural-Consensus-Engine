import google.generativeai as genai
import os
from typing import List, Dict

# Configure Gemini
# Note: Ensure GOOGLE_API_KEY is set in environment variables
# We will use specific keys for experts to distribute load/simulate diversity
import os
import google.generativeai as genai

class ExpertAgent:
    def __init__(self, name: str, role: str, description: str, temperature: float = 0.7, api_key_env: str = "GOOGLE_API_KEY"):
        self.name = name
        self.role = role
        self.description = description
        self.temperature = temperature
        
        # Configure a specific client if the library supports it, otherwise rely on global config
        # For this demo, we'll try to use the specific key if provided and supported
        self.api_key = os.environ.get(api_key_env, os.environ.get("GOOGLE_API_KEY"))
        if self.api_key:
             # In a real scenario with parallel requests, we might need a client instance per agent
             # For now, we assume the global configure is sufficient or we rely on the primary key
             # if the SDK doesn't support instance-based config easily in this version.
             # However, to be safe with the requested "diversity", we will try to configure 
             # just before generation if we were sequential, but we are parallel.
             # We will stick to the primary key for stability mainly, but allow the architecture to hold the key.
             pass

        self.model = genai.GenerativeModel(model_name="gemini-2.5-flash") 

    async def generate_response(self, user_query: str, temperature: float = None) -> str:
        prompt = f"""
        You are {self.name}, a {self.role}.
        Description: {self.description}
        
        User Query: {user_query}
        
        Please provide your expert opinion/analysis on the query based on your persona.
        """
        
        # Use specific key if configured (mock logic for now as we don't have separate clients per key in this simple class)
        # self.model.configure(api_key=self.api_key) # If we were re-configuring
        
        try:
            response = await self.model.generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=temperature if temperature is not None else self.temperature
                )
            )
            return response.text
        except Exception as e:
            return f"Error generating response from {self.name}: {str(e)}"

# Define standard experts
def get_default_experts() -> List[ExpertAgent]:
    return [
        ExpertAgent(
            name="Creative Thinker",
            role="Visionary and divergent thinker",
            description="You focus on novel ideas, out-of-the-box solutions, and creative possibilities. You are less constrained by current limitations.",
            temperature=0.9,
            api_key_env="GEMINI_API_KEY_PRIMARY"
        ),
        ExpertAgent(
            name="Logical Analyst",
            role="Rigorous logician and data analyst",
            description="You focus on facts, logical consistency, feasibility, and step-by-step reasoning. You are skeptical of unsubstantiated claims.",
            temperature=0.3,
            api_key_env="GEMINI_API_KEY_SECONDARY"
        ),
        ExpertAgent(
            name="Ethical Guardian",
            role="Ethicist and safety advocate",
            description="You focus on societal impact, ethical implications, safety, and human well-being. You prioritize responsible AI usage.",
            temperature=0.5,
            api_key_env="GEMINI_API_KEY_TERTIARY"
        )
    ]
