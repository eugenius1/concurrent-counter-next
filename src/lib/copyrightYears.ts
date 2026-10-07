const FIRST_PUBLISHED = 2025;

export function copyrightYears(now = new Date()): string {
  const current = now.getFullYear();
  return current > FIRST_PUBLISHED
    ? `${FIRST_PUBLISHED}–${current}`
    : String(FIRST_PUBLISHED);
}
