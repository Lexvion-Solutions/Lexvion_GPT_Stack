# Step 5 – Vector search pack

This step adds semantic search capabilities using the pgvector extension on Supabase.  It defines a table for storing embeddings, SQL functions to upsert and search vectors, and an OpenAPI spec to expose these functions as actions.

### Files

- `vector.sql` – creates the `vector` extension, an `vector_embeddings` table, an ivfflat index and two functions: `upsert_embedding` and `search_embedding`.
- `openapi.lexvion-vector.json` – OpenAPI 3.0 definition for `/rpc/upsert_embedding` and `/rpc/search_embedding`.  The endpoints use the Supabase service role key via the `apikey` header.

### Action to add

```json
{
  "name": "lexvion-vector",
  "spec_path": "openapi.lexvion-vector.json",
  "headers": {
    "apikey": "${SUPABASE_SERVICE_ROLE}"
  }
}
```

### Useful cURL commands

Insert or update an embedding:

```sh
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/upsert_embedding" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE}" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "<uuid>",
    "ns": "test",
    "id": "sample",
    "content": "Test content for vector",
    "embedding": [0.01, 0.01, 0.01],
    "meta": {"purpose": "smoke_test"}
  }'
```

Search for similar embeddings:

```sh
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/search_embedding" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE}" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "<uuid>",
    "ns": "test",
    "query_embedding": [0.01, 0.01, 0.01],
    "top_k": 1
  }'
```

### Gaps

- The pgvector extension must be enabled in your Supabase project.  On first deployment, ensure the `vector` extension is installed.
- Embeddings must match the expected dimension (1536) in production; small embeddings used here are for smoke testing only.
