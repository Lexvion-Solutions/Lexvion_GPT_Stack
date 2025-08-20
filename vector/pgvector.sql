-- Enable pgvector extension and create embeddings table
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS embeddings (
  id SERIAL PRIMARY KEY,
  entity_id INTEGER NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB
);

-- Index for similarity search
CREATE INDEX IF NOT EXISTS embeddings_vector_idx ON embeddings USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);
