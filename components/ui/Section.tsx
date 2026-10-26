import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  title: string;
  intro?: string;
  tone?: "light" | "mist" | "dark";
  children: React.ReactNode;
};

export function Section({ id, title, intro, tone = "light", children }: Props) {
  return (
    <section
      id={id}
      className={cn(
        "py-20",
        tone === "mist" && "bg-mist",
        tone === "dark" && "bg-navy text-white",
      )}
    >
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
        {intro && (
          <p className={cn("mt-4 max-w-2xl text-lg leading-relaxed", tone === "dark" ? "text-soft" : "text-muted")}>
            {intro}
          </p>
        )}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
