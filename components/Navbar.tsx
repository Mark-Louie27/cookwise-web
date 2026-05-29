"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, Bookmark, Search, MessageCircle, Menu, X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { href: "/", label: "Discover", icon: Search },
    { href: "/saved", label: "Saved", icon: Bookmark },
    { href: "/chat", label: "AI Chef", icon: MessageCircle, highlight: true },
  ];

  useEffect(() => { setOpen(false); }, [path]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <nav
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? "rgba(20, 83, 45, 0.85)" : "var(--forest)",
          backdropFilter: scrolled ? "blur(12px) saturate(1.2)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px) saturate(1.2)" : "none",
          borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.1)"}`,
          boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1)" : "none",
        }}
      >
        <div
          style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group relative z-10">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 group-active:scale-95"
              style={{ backgroundColor: "var(--terracotta)" }}
            >
              <ChefHat size={20} color="white" />
            </div>
            <span className="font-display text-xl text-white font-semibold tracking-tight">
              Cook<span style={{ color: "var(--amber)" }}>Wise</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon, highlight }) => {
              const active = path === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    color: active ? "var(--amber)" : "rgba(255,255,255,0.75)",
                    backgroundColor: active ? "rgba(232,168,56,0.12)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.95)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                    }
                  }}
                >
                  {active && (
                    <span className="absolute inset-0 rounded-xl" style={{ boxShadow: "inset 0 0 0 1px rgba(232,168,56,0.3)" }} />
                  )}
                  <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                  {label}
                  {highlight && !active && (
                    <Sparkles size={12} className="opacity-60" style={{ color: "var(--amber)" }} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl text-white transition-colors duration-200"
            style={{ backgroundColor: open ? "rgba(255,255,255,0.1)" : "transparent", border: "none", cursor: "pointer" }}
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className="md:hidden"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          transition: "opacity 0.3s, pointer-events 0.3s",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {/* Backdrop */}
        <div
          style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          onClick={() => setOpen(false)}
        />

        {/* Menu Panel */}
        <div
          style={{
            position: "absolute",
            top: "64px",
            left: 0,
            right: 0,
            backgroundColor: "var(--forest)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
            transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
            transform: open ? "translateY(0)" : "translateY(-12px)",
            opacity: open ? 1 : 0,
          }}
        >
          <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {links.map(({ href, label, icon: Icon, highlight }, index) => {
              const active = path === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    padding: "14px 16px",
                    color: active ? "var(--amber)" : "rgba(255,255,255,0.85)",
                    backgroundColor: active ? "rgba(232,168,56,0.12)" : "transparent",
                    animationDelay: `${index * 50}ms`,
                    textDecoration: "none",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: active ? "rgba(232,168,56,0.2)" : "rgba(255,255,255,0.06)" }}
                  >
                    <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                  </div>
                  <span style={{ flex: 1 }}>{label}</span>
                  {highlight && (
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "rgba(232,168,56,0.2)", color: "var(--amber)" }}
                    >
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Bottom hint */}
          <div style={{ padding: "16px 32px", textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
            CookWise v1.0
          </div>
        </div>
      </div>
    </>
  );
}