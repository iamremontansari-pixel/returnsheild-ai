import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  variant?: "primary" | "outline" | "dark";
  className?: string;
  children: React.ReactNode;
};

const styles = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  outline: "border border-soft/60 text-white hover:bg-white/10",
  dark: "bg-navy text-white hover:bg-navy-3",
};

export function LinkButton({ href, variant = "primary", className, children }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-2.5 text-base font-semibold transition-colors",
        styles[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
