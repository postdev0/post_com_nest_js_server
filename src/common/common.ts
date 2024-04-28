export function extractUsername(email: string) {
    const parts = email.split('@');
    return parts[0];
}