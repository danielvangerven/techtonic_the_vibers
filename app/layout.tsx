import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KBC Ahead",
  description: "Your next 90 days, prepared with the experience of people like you.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-100 text-neutral-900">{children}</body>
    </html>
  );
}
