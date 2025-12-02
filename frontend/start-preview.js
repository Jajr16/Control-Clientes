import { preview } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function start() {
  const server = await preview({
    root: __dirname,
    preview: {
      host: true,
      port: 5173
    }
  });

  console.log('Frontend corriendo en:', server.resolvedUrls);
}

start();
