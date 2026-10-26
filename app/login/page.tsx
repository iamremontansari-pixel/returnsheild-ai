import type { Metadata } from "next";
import { AuthForm } from "@/components/ui/AuthForm";

export const metadata: Metadata = { title: "Log in" };

export default function Page() {
  return (
    <section className="bg-mist py-16">
      <div className="mx-auto max-w-md px-6">
        <h1 className="mb-6 text-3xl font-extrabold tracking-tight">Welcome back</h1>
        <AuthForm mode="login" />
      </div>
    </section>
  );
}
