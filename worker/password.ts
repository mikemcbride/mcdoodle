import { scryptAsync } from '@noble/hashes/scrypt.js';

// scrypt parameters (match the values used historically so legacy hashes verify).
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, dkLen: 64 } as const;
const SCHEME = 'scrypt';

function toHex(bytes: Uint8Array): string {
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// scryptAsync yields to the event loop between blocks instead of pinning the
// CPU for the full ~50-100ms a synchronous scrypt takes on a Worker.
async function scryptHex(password: string, salt: string): Promise<string> {
    return toHex(await scryptAsync(password, salt, SCRYPT_PARAMS));
}

// Constant-time comparison of two equal-length hex strings.
function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let mismatch = 0;
    for (let i = 0; i < a.length; i++) {
        mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return mismatch === 0;
}

// Hash a password with a fresh, random, per-user salt.
// Returns a self-describing string: `scrypt$<saltHex>$<hashHex>`.
export async function hashPassword(password: string): Promise<string> {
    const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
    const hash = await scryptHex(password, salt);
    return `${SCHEME}$${salt}$${hash}`;
}

// Verify a password against a stored value.
// Supports both the new per-user-salt scheme and the legacy global-salt scheme.
// `needsRehash` is true when a successful verification used the legacy scheme,
// signalling the caller to opportunistically re-store with hashPassword().
export async function verifyPassword(
    password: string,
    stored: string,
    legacySalt: string,
): Promise<{ valid: boolean; needsRehash: boolean }> {
    if (stored.startsWith(`${SCHEME}$`)) {
        const [, salt, hash] = stored.split('$');
        if (!salt || !hash) return { valid: false, needsRehash: false };
        return { valid: timingSafeEqual(await scryptHex(password, salt), hash), needsRehash: false };
    }
    // Legacy: `stored` is a bare hex hash computed with the global salt.
    return { valid: timingSafeEqual(await scryptHex(password, legacySalt), stored), needsRehash: true };
}
