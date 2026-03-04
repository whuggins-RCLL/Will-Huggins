import express from 'express';
import { createServer as createViteServer } from 'vite';
import generateHandler from './api/generate.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // API Routes
  // Mimic Vercel's behavior by mounting the handler
  app.all('/api/generate', (req, res) => {
    generateHandler(req, res);
  });

  // Vite middleware for development
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
