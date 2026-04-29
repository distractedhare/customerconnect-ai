import express from 'express';
import { randomUUID } from 'crypto';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import cookieSession from 'cookie-session';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const isProduction = process.env.NODE_ENV === 'production';
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const appOrigin = new URL(appUrl).origin;
  const sessionSecret = process.env.SESSION_SECRET;

  app.use(express.json());

  if (isProduction && !sessionSecret) {
    throw new Error('SESSION_SECRET is required in production.');
  }

  app.use(cookieSession({
    name: 'session',
    keys: [sessionSecret || 'dev-github-oauth-secret'],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    httpOnly: true,
  }));

  // GitHub OAuth Routes
  app.get('/api/auth/github/url', (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ error: 'GITHUB_CLIENT_ID is not configured' });
    }

    const oauthState = randomUUID();
    req.session = req.session ?? {};
    req.session.github_oauth_state = oauthState;

    const redirectUri = new URL('/auth/github/callback', appUrl).toString();
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'read:user repo',
      state: oauthState,
    });

    res.json({ url: `https://github.com/login/oauth/authorize?${params.toString()}` });
  });

  app.get(['/auth/github/callback', '/auth/github/callback/'], async (req, res) => {
    const { code, state } = req.query;

    if (typeof code !== 'string' || code.length === 0) {
      return res.status(400).send('No code provided');
    }

    const sessionState = req.session?.github_oauth_state;
    if (typeof state !== 'string' || typeof sessionState !== 'string' || state !== sessionState) {
      if (req.session) {
        delete req.session.github_oauth_state;
      }
      return res.status(400).send('Invalid or expired OAuth state');
    }

    delete req.session!.github_oauth_state;

    try {
      const response = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }, {
        headers: {
          Accept: 'application/json',
        },
      });

      const { access_token } = response.data;
      if (access_token) {
        req.session!.github_token = access_token;
        
        res.send(`
          <html>
            <body>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, ${JSON.stringify(appOrigin)});
                  window.close();
                } else {
                  window.location.href = '/';
                }
              </script>
              <p>Authentication successful. This window should close automatically.</p>
            </body>
          </html>
        `);
      } else {
        res.status(400).send('Failed to exchange code for token');
      }
    } catch (error) {
      console.error('GitHub OAuth Error:', error);
      res.status(500).send('Internal Server Error during OAuth');
    }
  });

  app.get('/api/user', async (req, res) => {
    const token = req.session?.github_token;
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const userResponse = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `token ${token}` },
      });
      res.json(userResponse.data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user data' });
    }
  });

  app.get('/api/repos', async (req, res) => {
    const token = req.session?.github_token;
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const reposResponse = await axios.get('https://api.github.com/user/repos?sort=updated', {
        headers: { Authorization: `token ${token}` },
      });
      res.json(reposResponse.data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch repositories' });
    }
  });

  app.post('/api/logout', (req, res) => {
    req.session = null;
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
