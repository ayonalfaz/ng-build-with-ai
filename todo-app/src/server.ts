import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server';
import { suggestSubtasksFlow, prioritiseTodosFlow } from './ai.flows';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

const app = express();
const commonEngine = new CommonEngine();

// Parse JSON request bodies for the AI API routes
app.use(express.json());

// ---------------------------------------------------------------------------
// AI API routes (powered by Genkit + Gemini)
// Require GEMINI_API_KEY environment variable to be set.
// ---------------------------------------------------------------------------

/**
 * POST /api/ai/suggest
 * Body: { title: string }
 * Returns: { subtasks: string[] }
 *
 * Given a todo title, returns 3–5 actionable subtasks.
 */
app.post('/api/ai/suggest', async (req, res) => {
  if (!process.env['GEMINI_API_KEY']) {
    res.status(503).json({ error: 'GEMINI_API_KEY environment variable is not set.' });
    return;
  }
  try {
    const { title } = req.body as { title: string };
    if (!title?.trim()) {
      res.status(400).json({ error: 'title is required' });
      return;
    }
    const result = await suggestSubtasksFlow({ title });
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI request failed';
    res.status(500).json({ error: message });
  }
});

/**
 * POST /api/ai/prioritise
 * Body: { todos: string[] }
 * Returns: { prioritised: { title: string, priority: 'high'|'medium'|'low', reason: string }[] }
 *
 * Given a list of todo titles, returns them sorted and annotated with priority.
 */
app.post('/api/ai/prioritise', async (req, res) => {
  if (!process.env['GEMINI_API_KEY']) {
    res.status(503).json({ error: 'GEMINI_API_KEY environment variable is not set.' });
    return;
  }
  try {
    const { todos } = req.body as { todos: string[] };
    if (!Array.isArray(todos) || todos.length === 0) {
      res.status(400).json({ error: 'todos array is required and must not be empty' });
      return;
    }
    const result = await prioritiseTodosFlow({ todos });
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI request failed';
    res.status(500).json({ error: message });
  }
});

// ---------------------------------------------------------------------------
// Serve static files from /browser
// ---------------------------------------------------------------------------
app.get(
  '**',
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html'
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.get('**', (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;

  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
      providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
    })
    .then((html) => res.send(html))
    .catch((err) => next(err));
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export default app;
