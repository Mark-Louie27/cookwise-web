import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CookWise – AI-Powered Recipe Finder",
  description: "Discover recipes, get AI cooking help, and save favourites for offline use.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "CookWise" },
};

export const viewport: Viewport = {
  themeColor: "#2D4A3E",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
        {children}
      </body>
    </html>
  );
}