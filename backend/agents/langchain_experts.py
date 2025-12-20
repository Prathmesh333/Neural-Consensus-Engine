from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
import os
from dotenv import load_dotenv

load_dotenv()

class LangChainExpert:
    def __init__(self, name: str, role: str, description: str, temperature: float = 0.7, top_k: int = 40, api_key_env: str = "GOOGLE_API_KEY"):
        self.name = name
        self.role = role
        self.description = description
        self.default_temperature = temperature
        self.default_top_k = top_k
        
        # Determine API key
        self.api_key = os.environ.get(api_key_env, os.environ.get("GOOGLE_API_KEY"))
        
        # Define the prompt template
        self.prompt = PromptTemplate.from_template(
            """
            You are {name}, a {role}.
            Description: {description}
            
            User Query: {query}
            Context: {context}

            Please provide your expert opinion/analysis on the query based on your persona.
            """
        )
        # Default instructions for the expert
        self.instructions = ""

    async def generate_response(self, query: str, temperature: float = None, top_k: int = None, override_instructions: str = None, context: str = "") -> str:
        # Create a transient model instance
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=temperature if temperature is not None else self.default_temperature,
            top_k=top_k if top_k is not None else self.default_top_k,
            google_api_key=self.api_key
        )
        
        # Use override instructions if provided, otherwise default
        instructions_to_use = override_instructions if override_instructions is not None else self.instructions

        # Create chain
        chain = self.prompt | llm | StrOutputParser()
        
        try:
            return await chain.ainvoke({
                "name": self.name,
                "role": self.role,
                "description": self.description,
                "query": query,
                "context": context
            })
        except Exception as e:
            return f"Error generating response from {self.name}: {str(e)}"

def get_langchain_experts():
    return [
        LangChainExpert(
            name="The Skeptic",
            role="Critic and Reviewer 2",
            description="You are a dry, factual critic. You reject speculation and look for flaws, contradictions, and methodological errors. You are 'Reviewer 2'.",
            temperature=0.1,
            top_k=1,
            api_key_env="GEMINI_API_KEY_PRIMARY"
        ),
        LangChainExpert(
            name="The Creative",
            role="Visionary and Theorist",
            description="You are a warm, boundless thinker. You find novel connections, propose bold theories, and embrace uncertainty. You believe in 'what if'.",
            temperature=0.9,
            top_k=40,
            api_key_env="GEMINI_API_KEY_SECONDARY"
        ),
        LangChainExpert(
            name="The Mediator",
            role="User Advocate",
            description="You focus on user accessibility, clarity, and safety. You bridge the gap between abstract theory and practical understanding.",
            temperature=0.5,
            top_k=40,
            api_key_env="GEMINI_API_KEY_TERTIARY"
        )
    ]
