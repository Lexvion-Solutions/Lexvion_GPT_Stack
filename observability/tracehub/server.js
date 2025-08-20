const express = require('express');
const app = express();
app.use(express.json());

// In‑memory store for traces; in production use a database
const traces = [];

// Log a trace from a GPT agent
app.post('/traces', (req, res) => {
  const { project_id, step_id, model, tokens_in, tokens_out, latency_ms } = req.body;
  traces.push({ project_id, step_id, model, tokens_in, tokens_out, latency_ms, ts: Date.now() });
  res.status(202).json({ status: 'accepted' });
});

// Return aggregated metrics
app.get('/metrics', (req, res) => {
  const total_traces = traces.length;
  const model_breakdown = traces.reduce((acc, t) => {
    acc[t.model] = (acc[t.model] || 0) + 1;
    return acc;
  }, {});
  res.json({ total_traces, model_breakdown });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`TraceHub listening on ${port}`);
});
