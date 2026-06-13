export const DEMO_USERNAME = "superadmin";
export const DEMO_PASSWORD = "superadmin123";
export const DEMO_EMAIL = "superadmin@saanti.local";

export function isDemoUsername(value: string) {
  return value.trim().toLowerCase() === DEMO_USERNAME;
}

export function resolveAuthEmail(identifier: string) {
  return isDemoUsername(identifier) ? DEMO_EMAIL : identifier.trim();
}
