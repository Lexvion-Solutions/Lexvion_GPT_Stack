-- RPC to upsert an embedding
CREATE OR REPLACE FUNCTION upsert_embedding(_entity_id INTEGER, _embedding VECTOR, _metadata JSONB)
RETURNS VOID AS $$
BEGIN
  INSERT INTO embeddings(entity_id, embedding, metadata) VALUES (_entity_id, _embedding, _metadata)
  ON CONFLICT (entity_id) DO UPDATE SET embedding = EXCLUDED.embedding, metadata = EXCLUDED.metadata;
END;
$$ LANGUAGE plpgsql;
