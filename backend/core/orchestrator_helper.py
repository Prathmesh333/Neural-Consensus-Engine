async def expert_generation_wrapper(expert, query, temperature, top_k, instructions, context=""):
    try:
        # Log parameters for verification
        print(f"🔧 Calling {expert.name}: Temp={temperature}, TopK={top_k}")
        return await expert.generate_response(query, temperature=temperature, top_k=top_k, override_instructions=instructions, context=context)
    except Exception as e:
        print(f"Error calling {expert.name}: {e}")
        return f"Error: {str(e)}"
