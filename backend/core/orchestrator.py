from langgraph.graph import StateGraph, END
from typing import TypedDict, List, Dict, Any
from backend.agents.langchain_experts import get_langchain_experts
from backend.agents.langchain_synthesizer import LangChainSynthesizer
from backend.core.orchestrator_helper import expert_generation_wrapper
import asyncio

class GraphState(TypedDict):
    user_query: str
    context: str
    output_format: str
    criteria: str
    temperature: float
    tone: str
    length: str
    target_audience: str
    expert_weights: Dict[str, float]
    expert_configs: Dict[str, Dict]
    expert_responses: Dict[str, str]
    final_consensus: str
    reasoning: str
    agreements: List[str]
    disagreements: List[str]

async def dispatch_experts(state: GraphState):
    query = state["user_query"]
    temperature = state.get("temperature", 0.7)
    expert_configs = state.get("expert_configs", {})
    experts = get_langchain_experts()
    
    print(f"--- Dispatching to {len(experts)} Experts ---")
    
    print(f"--- Dispatching to {len(experts)} Experts (Parallel) ---")
    
    context = state.get("context", "")
    
    # Create tasks for parallel execution
    tasks = []
    for expert in experts:
        config = expert_configs.get(expert.name, {})
        effective_temp = config.get("temperature", temperature)
        effective_top_k = config.get("top_k", expert.default_top_k)  # Use expert's default if not specified
        override_instructions = config.get("instructions", None)
        
        # Create a coroutine for each expert
        tasks.append(expert_generation_wrapper(expert, query, effective_temp, effective_top_k, override_instructions, context))
    
    # Run all expert calls concurrently
    results = await asyncio.gather(*tasks)
    
    responses = list(results)
    print(f"--- All {len(experts)} Experts Responded ---")
    
    expert_map = {expert.name: response for expert, response in zip(experts, responses)}
    
    return {"expert_responses": expert_map}

async def synthesize_responses(state: GraphState):
    print("--- Synthesizing Responses ---")
    synthesizer = LangChainSynthesizer()
    result = await synthesizer.synthesize(
        state["user_query"], 
        state["expert_responses"],
        output_format=state.get("output_format", "Standard"),
        criteria=state.get("criteria", "Relevance, Accuracy, Clarity"),
        tone=state.get("tone", "Neutral"),
        length=state.get("length", "Standard"),
        target_audience=state.get("target_audience", "General"),
        expert_weights=state.get("expert_weights", {})
    )
    return {
        "final_consensus": result["consensus"],
        "reasoning": result["reasoning"],
        "agreements": result.get("agreements", []),
        "disagreements": result.get("disagreements", []),
        "controversy_score": result.get("controversy_score", 0.0),
        "confidence_score": result.get("confidence_score", 0.0),
        "hallucination_risk": result.get("hallucination_risk", "Low"),
        "verified_facts": result.get("verified_facts", []),
        "unverified_claims": result.get("unverified_claims", [])
    }

def create_consensus_graph():
    workflow = StateGraph(GraphState)
    
    workflow.add_node("dispatch_experts", dispatch_experts)
    workflow.add_node("synthesize", synthesize_responses)
    
    workflow.set_entry_point("dispatch_experts")
    workflow.add_edge("dispatch_experts", "synthesize")
    workflow.add_edge("synthesize", END)
    
    return workflow.compile()
