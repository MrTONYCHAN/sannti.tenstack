export const LOCAL_AUTH_TOKEN = "saanti-local-session";
export const LOCAL_USER_ID = "00000000-0000-4000-8000-000000000001";

export function isLocalAuthToken(token: string | null | undefined) {
  return token === LOCAL_AUTH_TOKEN;
}
