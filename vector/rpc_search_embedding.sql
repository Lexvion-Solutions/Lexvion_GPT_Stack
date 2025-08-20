-- RPC to search nearest embeddings
CREATE OR REPLACE FUNCTION search_embedding(_embedding VECTOR, _limit INTEGER DEFAULT 5)
RETURNS TABLE(entity_id INTEGER, distance FLOAT) AS $$
  SELECT entity_id, embedding <-> _embedding AS distance
  FROM embeddings
  ORDER BY embedding <-> _embedding ASC
  LIMIT _limit;
$$ LANGUAGE SQL STABLE;
