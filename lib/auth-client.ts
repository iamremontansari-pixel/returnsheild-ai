
import { supabase } from "@/lib/supabase";

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
          message:
            "Registration received! Check your email to confirm your account.",
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
  } catch (error) {
    console.error("Authentication request failed:", error);

    return {
      ok: false,
      message: "Unable to connect. Please try again.",
    };
  }
}
