function readEnv(...names: string[]) {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return undefined;
}

export function getSupabaseServerEnv() {
  const url = readEnv("SUPABASE_URL", "VITE_SUPABASE_URL");
  const publishableKey = readEnv(
    "SUPABASE_PUBLISHABLE_KEY",
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_ANON_KEY",
    "VITE_SUPABASE_ANON_KEY",
  );
  const secretKey = readEnv("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY");

  return { url, publishableKey, secretKey };
}

export function hasSupabaseServerConfig() {
  const env = getSupabaseServerEnv();
  return Boolean(env.url && env.publishableKey);
}

export function requireSupabaseServerEnv() {
  const env = getSupabaseServerEnv();
  const missing = [
    ...(!env.url ? ["SUPABASE_URL or VITE_SUPABASE_URL"] : []),
    ...(!env.publishableKey
      ? ["SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_PUBLISHABLE_KEY"]
      : []),
  ];

  if (missing.length > 0) {
    const message = `Missing Supabase environment variable(s): ${missing.join(", ")}. Add them to .env.local and restart the dev server.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }

  return {
    url: env.url!,
    publishableKey: env.publishableKey!,
    secretKey: env.secretKey,
  };
}
