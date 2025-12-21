from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
import os
from pathlib import Path

load_dotenv()

app = FastAPI(title="Neural Consensus Engine API")

# Allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    expert_configs: dict[str, dict] = {}

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

# API routes must come BEFORE static file serving
@app.get("/status")
async def get_status():
    return {"status": "operational", "service": "Neural Consensus Engine"}

@app.post("/generate", response_model=GenerateResponse)
async def generate_consensus(request: GenerateRequest):
    print(f"Received request: {request.query}")
    graph = create_consensus_graph()
    result = await graph.ainvoke({
        "user_query": request.query,
        "context": request.context,
        "output_format": request.output_format,
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

# Serve frontend static files
# Check both container path (/app/frontend/dist) and local dev path
container_path = Path("/app/frontend/dist")
local_path = Path(__file__).parent.parent / "frontend" / "dist"
frontend_dist = container_path if container_path.exists() else local_path
if frontend_dist.exists():
    # Mount assets folder
    if (frontend_dist / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")
    
    # Serve index.html for root
    @app.get("/")
    async def serve_root():
        return FileResponse(str(frontend_dist / "index.html"))
    
    # Serve other static files and SPA routes (but not API routes)
    @app.get("/{path:path}")
    async def serve_static(path: str):
        # Skip API routes
        if path.startswith("generate") or path.startswith("status"):
            return {"detail": "Not Found"}

        # Check if it's a static file
        file_path = frontend_dist / path
        if file_path.is_file():
            return FileResponse(str(file_path))

        # For all other routes, serve index.html (SPA routing)
        return FileResponse(str(frontend_dist / "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
