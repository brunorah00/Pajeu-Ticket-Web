const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  if (!normalized || normalized.length > 254) return false;
  if (normalized.startsWith('.') || normalized.endsWith('.') || normalized.includes('..')) {
    return false;
  }
  return EMAIL_PATTERN.test(normalized);
}

export function getEmailValidationError(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return 'Informe o e-mail.';
  if (!isValidEmail(trimmed)) {
    return 'E-mail inválido. Use um endereço válido, ex.: seu@email.com';
  }
  return null;
}
