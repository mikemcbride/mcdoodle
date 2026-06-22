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

// The Hono API. Decoupled from the worker entry (and from TanStack Start) so it
// can be imported and exercised directly in tests against a real D1 binding.
export const apiApp = new Hono<{ Bindings: Env; Variables: Variables }>();

// Resolve the current user from the session cookie for all API requests and
// expose it to handlers via c.get('user').
apiApp.use('/api/*', async (c, next) => {
	const user = await getSessionUser(c, c.env);
	c.set('user', user);
	await next();
});

// Returns the currently authenticated user (or 401 if there's no valid session).
apiApp.get('/api/me', async (c) => {
	const user = c.get('user');
	if (!user) {
		return c.json({ message: 'unauthenticated' }, 401);
	}
	return c.json(user, 200);
});

// Clears the session (deletes the row and the cookie).
apiApp.post('/api/logout', async (c) => {
	await destroySession(c, c.env);
	return c.json({ message: 'ok' }, 200);
});

apiApp.post('/api/login', async (c) => handleLogin(c, c.env));

apiApp.get('/api/polls', async (c) => handlePolls(c, c.env));
apiApp.post('/api/polls', async (c) => handlePolls(c, c.env));
apiApp.put('/api/polls', async (c) => handlePolls(c, c.env));
apiApp.delete('/api/polls', async (c) => handlePolls(c, c.env));

apiApp.get('/api/questions', async (c) => handleQuestions(c, c.env));
apiApp.post('/api/questions', async (c) => handleQuestions(c, c.env));

apiApp.get('/api/responses', async (c) => handleResponses(c, c.env));
apiApp.post('/api/responses', async (c) => handleResponses(c, c.env));
apiApp.put('/api/responses', async (c) => handleResponses(c, c.env));

apiApp.get('/api/submissions', async (c) => handleSubmissions(c, c.env));
apiApp.post('/api/submissions', async (c) => handleSubmissions(c, c.env));
apiApp.put('/api/submissions', async (c) => handleSubmissions(c, c.env));

apiApp.get('/api/users', async (c) => handleUsers(c, c.env));
apiApp.post('/api/users', async (c) => handleUsers(c, c.env));
apiApp.put('/api/users', async (c) => handleUsers(c, c.env));

apiApp.get('/api/verifications', async (c) => handleVerifications(c, c.env));
apiApp.post('/api/forgot-password', async (c) => handleForgotPassword(c, c.env));
apiApp.post('/api/change-password', async (c) => handleChangePassword(c, c.env));
apiApp.post('/api/verify-email', async (c) => handleVerifyEmail(c, c.env));

export default apiApp;
