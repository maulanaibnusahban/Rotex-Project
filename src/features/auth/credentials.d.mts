export function normalizeEmail(email: string): string;
export function hashPassword(password: string): Promise<string>;
export function verifyPassword(password: string, encoded?: string | null): Promise<boolean>;
export function createToken(): string;
export function hashToken(value: string): string;
