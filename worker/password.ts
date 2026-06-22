import { scrypt } from '@noble/hashes/scrypt.js';

// scrypt parameters (match the values used historically so legacy hashes verify).
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, dkLen: 64 } as const;
const SCHEME = 'scrypt';

function toHex(bytes: Uint8Array): string {
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function scryptHex(password: string, salt: string): string {
    return toHex(scrypt(password, salt, SCRYPT_PARAMS));
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
export function hashPassword(password: string): string {
    const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
    const hash = scryptHex(password, salt);
    return `${SCHEME}$${salt}$${hash}`;
}

// Verify a password against a stored value.
// Supports both the new per-user-salt scheme and the legacy global-salt scheme.
// `needsRehash` is true when a successful verification used the legacy scheme,
// signalling the caller to opportunistically re-store with hashPassword().
export function verifyPassword(
    password: string,
    stored: string,
    legacySalt: string,
): { valid: boolean; needsRehash: boolean } {
    if (stored.startsWith(`${SCHEME}$`)) {
        const [, salt, hash] = stored.split('$');
        if (!salt || !hash) return { valid: false, needsRehash: false };
        return { valid: timingSafeEqual(scryptHex(password, salt), hash), needsRehash: false };
    }
    // Legacy: `stored` is a bare hex hash computed with the global salt.
    return { valid: timingSafeEqual(scryptHex(password, legacySalt), stored), needsRehash: true };
}
