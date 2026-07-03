import type { HandlerContext } from './types.js';

// Run a task after the response is sent. Uses ctx.waitUntil so the Worker stays
// alive until the task settles; falls back to a detached promise in test
// environments where there is no execution context (Hono's app.request()).
// Failures are logged, never thrown — callers must not depend on the result.
export function runInBackground(c: HandlerContext, label: string, task: () => Promise<unknown>): void {
    const settled = task().catch((err) => {
        console.error(`background task failed: ${label}`, err);
    });
    try {
        c.executionCtx.waitUntil(settled);
    } catch {
        // No execution context (e.g. tests) — let it run detached.
        void settled;
    }
}
