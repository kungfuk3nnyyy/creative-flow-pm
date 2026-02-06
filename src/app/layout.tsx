import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreativeFlow PM",
  description:
    "Project management for creative studios - interior design, conference decor, exhibitions, and experiential activations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-canvas antialiased">{children}</body>
    </html>
  );
}
