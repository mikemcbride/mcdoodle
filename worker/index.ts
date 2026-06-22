import { Hono } from 'hono';
import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server';
import { apiApp } from './api-app.js';
import type { Env, Variables } from './types';

// TanStack Start SSR handler — renders pages and serves client assets for
// everything that isn't an /api route.
const startFetch = createStartHandler(defaultStreamHandler);

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Hono owns /api/*; everything else is handled by TanStack Start.
app.route('/', apiApp);
app.all('*', (c) => startFetch(c.req.raw));

export default app;
