const DEFAULT_ADMIN_EMAILS = ['jdbanna34@gmail.com', '22ibo048@smvdu.ac.in']

const ADMIN_EMAILS = (process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAILS.join(','))
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

export function normalizeEmail(email?: string | null): string | null {
  return email?.trim().toLowerCase() ?? null
}

export function isConfiguredAdminEmail(email?: string | null): boolean {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return false
  return ADMIN_EMAILS.includes(normalizedEmail)
}
