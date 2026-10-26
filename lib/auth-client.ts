// Integration point for the FastAPI backend (not implemented yet).
// With NEXT_PUBLIC_API_URL unset this never pretends to sign anyone in.

export type AuthPayload = { email: string; password: string; name?: string };
export type AuthResult = { ok: true } | { ok: false; message: string };

export async function submitAuth(mode: "login" | "register", payload: AuthPayload): Promise<AuthResult> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    return {
      ok: false,
      message: "The backend is not connected yet, so no account was created or signed in. Your details were not sent anywhere.",
    };
  }
  try {
    const res = await fetch(`${base}/api/v1/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { ok: false, message: "We could not complete that request. Check your details and try again." };
    return { ok: true };
  } catch {
    return { ok: false, message: "We could not reach the server. Try again in a moment." };
  }
}
