import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server';
import { apiApp } from './api-app.js';
import type { Env, Variables } from './types';

// TanStack Start SSR handler — renders pages and serves client assets for
// everything that isn't an /api route.
const startFetch = createStartHandler(defaultStreamHandler);

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Baseline security headers on every response (HSTS, X-Frame-Options,
// nosniff, referrer policy, …). No CSP yet — TanStack Start's hydration
// relies on inline scripts, so a strict CSP needs nonce plumbing first.
app.use(secureHeaders());

// Hono owns /api/*; everything else is handled by TanStack Start.
app.route('/', apiApp);
app.all('*', (c) => startFetch(c.req.raw));

export default app;
