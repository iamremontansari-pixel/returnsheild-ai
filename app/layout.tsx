
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { headers } from "next/headers";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: {
    default: "ReturnShield AI",
    template: "%s | ReturnShield AI",
  },
  description:
    "AI-powered insights that help e-commerce sellers identify return risks, reduce preventable RTO, and protect profit margins.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <html lang="en" className={manrope.variable}>
      <body className="antialiased">
        {!isDashboard && <Navbar />}
        <main>{children}</main>
        {!isDashboard && <Footer />}
      </body>
    </html>
  );
}
