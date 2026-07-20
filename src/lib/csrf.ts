import { randomBytes } from 'crypto';

/**
 * Generate a cryptographically random token (base64url encoded).
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Verify that the token supplied by the client matches the secret stored in an HttpOnly cookie.
 * The token and the secret cookie must be identical strings.
 */
export function verifyCsrfToken(token: string | undefined, secret: string | undefined): boolean {
  if (!token || !secret) return false;
  return token === secret;
}
