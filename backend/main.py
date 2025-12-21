from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Neural Consensus Engine API")

# Configure allowed origins based on environment
allowed_origins = [
    "http://localhost:5173",  # Vite default port for local development
]

# Add production domain if specified
production_url = os.getenv("PRODUCTION_FRONTEND_URL")
if production_url:
    allowed_origins.append(production_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/status")
async def get_status():
    return {"status": "operational", "service": "Neural Consensus Engine"}

from pydantic import BaseModel
from backend.core.orchestrator import create_consensus_graph

class GenerateRequest(BaseModel):
    query: str
    context: str = ""
    output_format: str = "Standard"
    criteria: str = "Relevance, Accuracy, Clarity"
    temperature: float = 0.7
    tone: str = "Neutral"
    length: str = "Standard"
    target_audience: str = "General"
    expert_weights: dict[str, float] = {"Creative Expert": 1.0, "Logical Expert": 1.0, "Ethical Expert": 1.0}
    expert_configs: dict[str, dict] = {} # e.g. {"Creative Expert": {"temperature": 0.9, "instructions": "..."}}

class GenerateResponse(BaseModel):
    consensus: str
    expert_responses: dict
    reasoning: str
    agreements: list[str] = []
    disagreements: list[str] = []
    controversy_score: float = 0.0
    confidence_score: float = 0.0
    hallucination_risk: str = "Low"
    verified_facts: list[str] = []
    unverified_claims: list[str] = []

@app.post("/generate", response_model=GenerateResponse)
async def generate_consensus(request: GenerateRequest):
    print(f"Received request: {request.query} (Tone: {request.tone}, Length: {request.length})")
    graph = create_consensus_graph()
    result = await graph.ainvoke({
        "user_query": request.query,
        "context": request.context,
        "output_format": request.output_format,
        "criteria": request.criteria,
        "criteria": request.criteria,
        "temperature": request.temperature,
        "tone": request.tone,
        "length": request.length,
        "target_audience": request.target_audience,
        "expert_weights": request.expert_weights,
        "expert_configs": request.expert_configs
    })
    
    return GenerateResponse(
        consensus=result["final_consensus"],
        expert_responses=result["expert_responses"],
        reasoning=result.get("reasoning", "No specific reasoning provided."),
        agreements=result.get("agreements", []),
        disagreements=result.get("disagreements", []),
        controversy_score=result.get("controversy_score", 0.0),
        confidence_score=result.get("confidence_score", 0.0),
        hallucination_risk=result.get("hallucination_risk", "Low"),
        verified_facts=result.get("verified_facts", []),
        unverified_claims=result.get("unverified_claims", [])
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
