
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { navLinks } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSignedIn(Boolean(data.session));
        setCheckingAuth(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
      setCheckingAuth(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setOpen(false);

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const linkClass = (href: string) =>
    cn(
      "rounded-md px-3 py-2 text-[15px] font-medium transition-colors hover:text-cyan",
      pathname === href ? "text-cyan" : "text-soft",
    );

  async function handleLogout() {
    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setLoggingOut(false);
      window.alert("Unable to log out. Please try again.");
      return;
    }

    setSignedIn(false);
    setOpen(false);
    router.replace("/login");
    router.refresh();
    setLoggingOut(false);
  }

  function AccountLinks({ mobile = false }: { mobile?: boolean }) {
    if (checkingAuth) return null;

    if (signedIn) {
      return (
        <>
          <Link
            href="/dashboard"
            className={
              mobile
                ? "px-3 py-3 text-[15px] font-medium text-soft"
                : "px-3 py-2 text-[15px] font-medium text-soft hover:text-white"
            }
          >
            Dashboard
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className={
              mobile
                ? "flex items-center gap-2 px-3 py-3 text-left text-[15px] font-medium text-soft disabled:opacity-50"
                : "flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-[15px] font-semibold hover:bg-brand-dark disabled:opacity-50"
            }
          >
            <LogOut className="size-4" />
            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </>
      );
    }

    return (
      <>
        <Link
          href="/login"
          className={
            mobile
              ? "px-3 py-3 text-[15px] font-medium text-soft"
              : "px-3 py-2 text-[15px] font-medium text-soft hover:text-white"
          }
        >
          Log in
        </Link>
        <Link
          href="/register"
          className={
            mobile
              ? "block rounded-lg bg-brand px-4 py-3 text-center font-semibold"
              : "rounded-lg bg-brand px-4 py-2 text-[15px] font-semibold hover:bg-brand-dark"
          }
        >
          Get started
        </Link>
      </>
    );
  }

   if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          ReturnShield <span className="text-cyan">AI</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={linkClass(l.href)}
              aria-current={pathname === l.href ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <AccountLinks />
        </div>

        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-md md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="border-t border-white/10 px-6 pb-6 md:hidden"
        >
          <nav aria-label="Mobile" className="flex flex-col py-3">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(linkClass(l.href), "py-3")}
              >
                {l.label}
              </Link>
            ))}
            <AccountLinks mobile />
          </nav>
        </div>
      )}
    </header>
  );
}
