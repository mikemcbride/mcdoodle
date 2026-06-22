import { Hono } from 'hono';
import { handleLogin } from './api/login/route.js';
import { handlePolls } from './api/polls/route.js';
import { handleQuestions } from './api/questions/route.js';
import { handleResponses } from './api/responses/route.js';
import { handleSubmissions } from './api/submissions/route.js';
import { handleUsers } from './api/users/route.js';
import { handleVerifications } from './api/verifications/route.js';
import { handleForgotPassword } from './api/forgot-password/route.js';
import { handleChangePassword } from './api/change-password/route.js';
import { handleVerifyEmail } from './api/verify-email/route.js';
import { getSessionUser, destroySession } from './auth.js';
import type { Env, Variables } from './types';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Resolve the current user from the session cookie for all API requests and
// expose it to handlers via c.get('user').
app.use('/api/*', async (c, next) => {
	const user = await getSessionUser(c, c.env);
	c.set('user', user);
	await next();
});

// Returns the currently authenticated user (or 401 if there's no valid session).
app.get('/api/me', async (c) => {
	const user = c.get('user');
	if (!user) {
		return c.json({ message: 'unauthenticated' }, 401);
	}
	return c.json(user, 200);
});

// Clears the session (deletes the row and the cookie).
app.post('/api/logout', async (c) => {
	await destroySession(c, c.env);
	return c.json({ message: 'ok' }, 200);
});

// API routes
app.post('/api/login', async (c) => {
	return handleLogin(c, c.env);
});

app.get('/api/polls', async (c) => {
	return handlePolls(c, c.env);
});

app.post('/api/polls', async (c) => {
	return handlePolls(c, c.env);
});

app.put('/api/polls', async (c) => {
	return handlePolls(c, c.env);
});

app.delete('/api/polls', async (c) => {
	return handlePolls(c, c.env);
});

app.get('/api/questions', async (c) => {
	return handleQuestions(c, c.env);
});

app.post('/api/questions', async (c) => {
	return handleQuestions(c, c.env);
});

app.get('/api/responses', async (c) => {
	return handleResponses(c, c.env);
});

app.post('/api/responses', async (c) => {
	return handleResponses(c, c.env);
});

app.put('/api/responses', async (c) => {
	return handleResponses(c, c.env);
});

app.get('/api/submissions', async (c) => {
	return handleSubmissions(c, c.env);
});

app.post('/api/submissions', async (c) => {
	return handleSubmissions(c, c.env);
});

app.put('/api/submissions', async (c) => {
	return handleSubmissions(c, c.env);
});

app.get('/api/users', async (c) => {
	return handleUsers(c, c.env);
});

app.post('/api/users', async (c) => {
	return handleUsers(c, c.env);
});

app.put('/api/users', async (c) => {
	return handleUsers(c, c.env);
});

app.get('/api/verifications', async (c) => {
	return handleVerifications(c, c.env);
});

app.post('/api/forgot-password', async (c) => {
	return handleForgotPassword(c, c.env);
});

app.post('/api/change-password', async (c) => {
	return handleChangePassword(c, c.env);
});

app.post('/api/verify-email', async (c) => {
	return handleVerifyEmail(c, c.env);
});

// Serve static assets for all non-API routes
app.all('*', async (c) => {
	// Check if ASSETS binding is available (may not be in all environments)
	if (!c.env.ASSETS) {
		return c.text('Assets not configured', 500);
	}
	return c.env.ASSETS.fetch(c.req.raw);
});

export default app;