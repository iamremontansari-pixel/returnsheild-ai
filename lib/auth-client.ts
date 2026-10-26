import { createClient } from "@supabase/supabase-js";

export type AuthPayload = {
  email: string;
  password: string;
  name?: string;
};

export type AuthResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function submitAuth(
  mode: "login" | "register",
  payload: AuthPayload
): Promise<AuthResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return {
      ok: false,
      message: "Authentication is not configured yet. Please try again later.",
    };
  }

  const supabase = createClient(url, key);

  try {
    if (mode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
       options: {
  data: {
    full_name: payload.name ?? "",
  },
  emailRedirectTo: `${window.location.origin}/login`,
},
      });

      if (error) {
        return { ok: false, message: error.message };
      }

      if (!data.session) {
        return {
          ok: true,
          message: "Registration received! Check your email to confirm your account.",
        };
      }

      return {
        ok: true,
        message: "Account created successfully!",
      };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true, message: "Login successful!" };
  } catch {
    return {
      ok: false,
      message: "Unable to connect. Please try again.",
    };
  }
}
