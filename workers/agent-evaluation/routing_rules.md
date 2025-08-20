- Route messages requesting build llm agent evaluation harnesses.
- Queries similar to smoke tests (Provide 5 intents and metrics → runner + dataset stub + schema.) belong here.
- If handling failures like - Over budget is required, route here.
- If the task matches the Input/Output Schema for Agent Evaluation, it's appropriate here.
- Reject requests unrelated to agent evaluation (e.g., other GPT scopes).

Reject: Tasks outside of scope or violating schema requirements.