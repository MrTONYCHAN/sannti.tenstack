# Saanti

Saanti is an AI-powered mental wellness tracker for Indian board exam and entrance-test aspirants. It combines daily journaling, mood logs, pattern insights, and a conversational AI companion for contextual coping support.

## Features

- Authenticated student workspace with Supabase Auth and row-level security.
- AI companion for exam stress, self-doubt, burnout, sleep pressure, and study planning.
- Open-ended journal with mood, stress, energy, sleep, and study-hour logs.
- AI journal analysis for sentiment, hidden triggers, summaries, and tailored next steps.
- Insights dashboard with mood/stress/energy trends and recurring triggers.
- Crisis-aware support copy with India helplines.
- Solid-color accessible UI with no gradient surfaces.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and fill the Supabase values. `GOOGLE_GENERATIVE_AI_API_KEY` is only needed for AI chat and AI journal analysis.

```bash
cp .env.example .env.local
```

Required `.env.local` shape:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
GOOGLE_GENERATIVE_AI_API_KEY=optional-for-ai
GOOGLE_GENERATIVE_AI_MODEL=gemini-2.5-flash
DEMO_LOGIN_ENABLED=false
VITE_DEMO_LOGIN_ENABLED=false
SUPABASE_SECRET_KEY=server-only-secret-key-for-demo-login-provisioning
```

### Where To Get Keys

Supabase:

1. Open [supabase.com/dashboard](https://supabase.com/dashboard).
2. Select your project.
3. Go to **Project Settings > API**.
4. Copy **Project URL** into `VITE_SUPABASE_URL`.
5. Copy the **publishable key** or **anon public key** into `VITE_SUPABASE_PUBLISHABLE_KEY`.
6. Do not use the `service_role` or secret key in the browser.
7. Optional demo login: copy a Supabase secret key into `SUPABASE_SECRET_KEY`, set `DEMO_LOGIN_ENABLED=true`, and set `VITE_DEMO_LOGIN_ENABLED=true`.

Demo credentials, when enabled:

```text
username: superadmin
password: superadmin123
```

Google AI Studio / Gemini:

1. Open [Google AI Studio](https://aistudio.google.com/).
2. Go to **Get API key**.
3. Create or select an API key.
4. Copy it into `GOOGLE_GENERATIVE_AI_API_KEY`.
5. Keep `GOOGLE_GENERATIVE_AI_MODEL=gemini-2.5-flash` unless you intentionally want a different Gemini model.
6. Restart the dev server after changing `.env.local`.

7. Run the app:

```bash
npm run dev
```

## Quality Checks

```bash
npm run format
npm run lint
npm run typecheck
npm test
npm run build
npm audit
```

## Production Notes

- Apply all migrations in `supabase/migrations` before launch.
- Do not put Supabase secret/service-role keys in `VITE_` variables. This app does not need the secret key for normal local development.
- Demo login is for local/demo use only. Disable `DEMO_LOGIN_ENABLED` before production.
- The AI companion is supportive, not a substitute for professional care.
- If `GOOGLE_GENERATIVE_AI_API_KEY` is missing, chat AI and journal analysis will fail closed instead of exposing secrets or mock data.
