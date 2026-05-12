import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eternity Operator Workspace",
  description: "Operational intelligence compiler for generating client AI ecosystems and deployable repositories."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
