"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { submitAuth } from "@/lib/auth-client";
import { validateAuth, type AuthErrors, type AuthFields } from "@/lib/validation";

type Mode = "login" | "register";
type Status = { kind: "idle" } | { kind: "submitting" } | { kind: "error"; message: string } | { kind: "success" };

const empty: AuthFields = { name: "", email: "", password: "", confirm: "" };

export function AuthForm({ mode }: { mode: Mode }) {
  const [values, setValues] = useState<AuthFields>(empty);
  const [errors, setErrors] = useState<AuthErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const isRegister = mode === "register";

  const set = (key: keyof AuthFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateAuth(mode, values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setStatus({ kind: "submitting" });
    const result = await submitAuth(mode, { email: values.email.trim(), password: values.password, name: values.name.trim() || undefined });
    setStatus(result.ok ? { kind: "success" } : { kind: "error", message: result.message });
  }

  const field = (key: keyof AuthFields, label: string, type: string, autoComplete: string) => (
    <div>
      <label htmlFor={key} className="block text-sm font-semibold">
        {label}
      </label>
      <input
        id={key}
        name={key}
        type={type}
        autoComplete={autoComplete}
        value={values[key]}
        onChange={set(key)}
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={errors[key] ? `${key}-error` : undefined}
        className="mt-1 min-h-11 w-full rounded-lg border border-line px-3 text-base"
      />
      {errors[key] && (
        <p id={`${key}-error`} className="mt-1 text-sm text-rose-700">
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-2xl border border-line bg-white p-6 sm:p-8">
      {isRegister && field("name", "Full name", "text", "name")}
      {field("email", "Work email", "email", "email")}
      {field("password", "Password", "password", isRegister ? "new-password" : "current-password")}
      {isRegister && field("confirm", "Confirm password", "password", "new-password")}

      {status.kind === "error" && (
        <p role="alert" className="flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {status.message}
        </p>
      )}
      {status.kind === "success" && (
        <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
          Done. Continue to your dashboard once it is available.
        </p>
      )}

      <button
        type="submit"
        disabled={status.kind === "submitting"}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {status.kind === "submitting" && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {isRegister ? "Create account" : "Log in"}
      </button>

      <p className="text-center text-sm text-muted">
        {isRegister ? "Already have an account? " : "New to ReturnShield AI? "}
        <Link href={isRegister ? "/login" : "/register"} className="font-semibold text-brand underline">
          {isRegister ? "Log in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
