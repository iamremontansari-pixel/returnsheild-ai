export type AuthFields = { name: string; email: string; password: string; confirm: string };
export type AuthErrors = Partial<Record<keyof AuthFields, string>>;

export function validateAuth(mode: "login" | "register", v: AuthFields): AuthErrors {
  const e: AuthErrors = {};
  if (mode === "register" && v.name.trim().length < 2) e.name = "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "Enter a valid email address.";
  if (v.password.length < 8) e.password = "Use at least 8 characters.";
  if (mode === "register" && v.confirm !== v.password) e.confirm = "Passwords do not match.";
  return e;
}
