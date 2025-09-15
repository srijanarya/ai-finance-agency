// AI Finance Agency Background Worker
const express = require('express');
const app = express();
const port = process.env.PORT || 3010;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'worker',
    timestamp: new Date().toISOString() 
  });
});

// Start worker
app.listen(port, () => {
  console.log(`Worker service running on port ${port}`);
  console.log('Background tasks ready...');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Worker shutting down gracefully...');
  process.exit(0);
});