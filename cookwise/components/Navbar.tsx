"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, Bookmark, Search, MessageCircle } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Discover", icon: Search },
    { href: "/saved", label: "Saved", icon: Bookmark },
    { href: "/chat", label: "AI Chef", icon: MessageCircle },
  ];

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{ backgroundColor: "var(--forest)", borderColor: "rgba(255,255,255,0.1)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--terracotta)" }}
          >
            <ChefHat size={20} color="white" />
          </div>
          <span className="font-display text-xl text-white font-semibold tracking-tight">
            Cook<span style={{ color: "var(--amber)" }}>Wise</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  color: active ? "var(--amber)" : "rgba(255,255,255,0.75)",
                  backgroundColor: active ? "rgba(232,168,56,0.15)" : "transparent",
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className="flex flex-col gap-1.5">
            <span
              className="block w-6 h-0.5 bg-white transition-transform"
              style={{ transform: menuOpen ? "rotate(45deg) translate(2px, 3px)" : "none" }}
            />
            <span
              className="block h-0.5 bg-white transition-opacity"
              style={{ opacity: menuOpen ? 0 : 1, width: "1rem" }}
            />
            <span
              className="block w-6 h-0.5 bg-white transition-transform"
              style={{ transform: menuOpen ? "rotate(-45deg) translate(2px, -3px)" : "none" }}
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t px-4 pb-4" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          {links.map(({ href, label, icon: Icon }) => {
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 py-3 text-sm font-medium"
                style={{ color: active ? "var(--amber)" : "rgba(255,255,255,0.8)" }}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
