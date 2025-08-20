# Vector Examples

## Upsert Embedding
```bash
curl -X POST ${SUPABASE_URL}/rest/v1/rpc/upsert_embedding   -H 'Authorization: Bearer ${SUPABASE_SERVICE_ROLE}'   -H 'Content-Type: application/json'   -d '{"entity_id":123,"embedding":[0.1,0.2,...],"metadata":{"source":"test"}}'
```

## Search Embedding
```bash
curl -X POST ${SUPABASE_URL}/rest/v1/rpc/search_embedding   -H 'Authorization: Bearer ${SUPABASE_SERVICE_ROLE}'   -H 'Content-Type: application/json'   -d '{"embedding":[0.1,0.2,...],"limit":5}'
```

