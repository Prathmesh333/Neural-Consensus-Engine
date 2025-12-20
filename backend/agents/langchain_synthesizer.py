from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
import os
from typing import Dict

# Define the structured output schema
class SynthesisOutput(BaseModel):
    reasoning: str = Field(description="Chain of Thought: Explain your thought process. Identify agreements and meaningful divergences. Side with evidence.")
    consensus: str = Field(description="The final synthesized answer in the requested format.")
    agreements: list[str] = Field(description="List of points where all or most experts agreed.")
    disagreements: list[str] = Field(description="List of points where experts had conflicting views.")
    controversy_score: float = Field(description="Score from 0 (Perfect Agreement) to 10 (Total War). Based on the magnitude of conflict.")
    confidence_score: float = Field(description="Score from 0 to 100. How confident are you in the synthesized answer?")
    hallucination_risk: str = Field(description="Risk level: 'Low', 'Medium', or 'High'. Based on claim verification across agents.")
    verified_facts: list[str] = Field(description="Specific factual claims that appeared in 2+ agent responses (dates, numbers, names).")
    unverified_claims: list[str] = Field(description="Claims made by only 1 agent that could not be corroborated.")

class LangChainSynthesizer:
    def __init__(self):
        self.model = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.4,
            google_api_key=os.environ.get("GOOGLE_API_KEY")
        )
        self.parser = JsonOutputParser(pydantic_object=SynthesisOutput)

        self.prompt = PromptTemplate(
            template="""
            You are the "Synthesizer", a meta-cognitive adjudicator in the Neural Consensus Engine.
            Your role is NOT to summarize, but to VERIFY TRUTH through adversarial cross-examination.

            Original User Query: {query}
            User Specified Output Format: {output_format}
            Judgement Criteria: {criteria}
            Desired Tone: {tone}
            Desired Length: {length}
            Target Audience: {target_audience}
            Expert Weights: {expert_weights}

            You have received the following expert opinions:
            {expert_responses}

            EPISTEMIC INTEGRITY PROTOCOL (5-Step Verification):
            
            Step 1 - Divergence Analysis:
            Identify all factual claims (dates, numbers, names, events). Note which agents made each claim.
            
            Step 2 - Hallucination Check:
            For each specific claim, check: Did 2+ agents independently mention this?
            - If YES → Add to "Verified Facts"
            - If NO (only 1 agent) → Add to "Unverified Claims" and FLAG as potentially hallucinated
            
            Step 3 - Consensus Grading:
            Calculate semantic overlap:
            - High overlap (80%+) → Low hallucination risk
            - Medium overlap (50-80%) → Medium risk
            - Low overlap (<50%) → High risk
            
            Step 4 - Adjudication Rules:
            - If "The Skeptic" provides evidence and "The Creative" speculates, side with Skeptic
            - If "The Creative" finds a novel connection missed by all, acknowledge as "Theory (unverified)"
            - If all 3 agents agree, mark as "Strong Consensus"
            
            Step 5 - Output with Transparency:
            Write the final consensus BUT explicitly call out unverified claims:
            "While the consensus is X, ⚠️ The Creative claimed Y (unverified by other agents)."

            Calculate controversy_score (0-10) based on disagreement magnitude.
            Calculate confidence_score (0-100) based on verification rate.

            OUTPUT FORMAT (Strict JSON):
            {format_instructions}
            """,
            input_variables=["query", "output_format", "criteria", "expert_responses", "tone", "length", "target_audience", "expert_weights"],
            partial_variables={"format_instructions": self.parser.get_format_instructions()}
        )

    async def synthesize(self, query: str, expert_responses: Dict[str, str], output_format: str = "Standard", criteria: str = "Relevance", tone: str = "Neutral", length: str = "Standard", target_audience: str = "General", expert_weights: Dict[str, float] = {}) -> Dict[str, str]:
        
        compiled_responses = "\n\n".join([f"--- {name} ---\n{response}" for name, response in expert_responses.items()])
        
        chain = self.prompt | self.model | self.parser
        
        try:
            return await chain.ainvoke({
                "query": query,
                "output_format": output_format,
                "criteria": criteria,
                "expert_responses": compiled_responses,
                "tone": tone,
                "length": length,
                "target_audience": target_audience,
                "expert_weights": expert_weights
            })
        except Exception as e:
            return {
                "consensus": f"Error synthesizing: {str(e)}", 
                "reasoning": "Failed to generate.",
                "agreements": [],
                "disagreements": [],
                "controversy_score": 0.0,
                "confidence_score": 0.0,
                "hallucination_risk": "High",
                "verified_facts": [],
                "unverified_claims": []
            }
