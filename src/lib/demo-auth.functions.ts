import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_USERNAME } from "./demo-auth";

const DemoAuthInput = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

function isDemoLoginEnabled() {
  return (
    process.env.DEMO_LOGIN_ENABLED === "true" ||
    process.env.NODE_ENV !== "production"
  );
}

export const ensureDemoAccount = createServerFn({ method: "POST" })
  .validator((d: unknown) => DemoAuthInput.parse(d))
  .handler(async ({ data }) => {
    if (!isDemoLoginEnabled()) {
      throw new Error("Demo login is disabled.");
    }

    if (
      data.username.trim().toLowerCase() !== DEMO_USERNAME ||
      data.password !== DEMO_PASSWORD
    ) {
      throw new Error("Invalid demo credentials.");
    }

    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseSecretKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      throw new Error(
        "Demo login needs SUPABASE_SECRET_KEY in .env.local to provision the account.",
      );
    }

    const admin = createClient<Database>(supabaseUrl, supabaseSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const created = await admin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: {
        display_name: DEMO_USERNAME,
        role: "demo",
      },
    });

    let userId = created.data.user?.id;

    if (created.error) {
      const message = created.error.message.toLowerCase();
      if (!message.includes("already") && !message.includes("registered")) {
        throw new Error(created.error.message);
      }

      const listed = await admin.auth.admin.listUsers();
      if (listed.error) throw new Error(listed.error.message);

      const existing = listed.data.users.find(
        (user) => user.email?.toLowerCase() === DEMO_EMAIL,
      );
      if (!existing) {
        throw new Error("Demo user exists but could not be loaded.");
      }

      userId = existing.id;
      const updated = await admin.auth.admin.updateUserById(existing.id, {
        password: DEMO_PASSWORD,
        user_metadata: {
          ...existing.user_metadata,
          display_name: DEMO_USERNAME,
          role: "demo",
        },
      });
      if (updated.error) throw new Error(updated.error.message);
    }

    if (userId) {
      await admin.from("profiles").upsert({
        id: userId,
        display_name: DEMO_USERNAME,
        exam_target: "Demo",
      });
    }

    return { email: DEMO_EMAIL };
  });
