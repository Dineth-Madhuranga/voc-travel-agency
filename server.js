import express from 'express';
import loginHandler from './api/login.js';
import inquiriesHandler from './api/inquiries.js';

const app = express();
app.use(express.json());

// Mock Vercel serverless environment
app.all('/api/login', async (req, res) => {
  try {
    await loginHandler(req, res);
  } catch (error) {
    console.error('Error in /api/login:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.all('/api/inquiries', async (req, res) => {
  try {
    await inquiriesHandler(req, res);
  } catch (error) {
    console.error('Error in /api/inquiries:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Local API server running on http://localhost:${PORT}`);
});
