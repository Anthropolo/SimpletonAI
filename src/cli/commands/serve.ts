import { createServer } from 'http';
import next from 'next';
import { parse } from 'url';

interface ServeOptions {
  port?: number;
}

export async function startServer(options: ServeOptions = {}) {
  try {
    const port = options.port || 3000;
    const dev = process.env.NODE_ENV !== 'production';
    const app = next({ dev });
    const handle = app.getRequestHandler();

    await app.prepare();

    const server = createServer((req, res) => {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    });

    server.listen(port, () => {
      console.log(`✨ Server running on http://localhost:${port}`);
    });

    return server;
  } catch (error) {
    console.error('Error starting server:', error);
    throw error;
  }
}
