"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChefHat,
  Bookmark,
  Search,
  MessageCircle,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for glassmorphism intensity
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

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [path]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <nav
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled
            ? "rgba(20, 83, 45, 0.85)" // var(--forest) with opacity
            : "var(--forest)",
          backdropFilter: scrolled ? "blur(12px) saturate(1.2)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px) saturate(1.2)" : "none",
          borderBottom: `1px solid ${
            scrolled
              ? "rgba(255,255,255,0.15)"
              : "rgba(255,255,255,0.1)"
          }`,
          boxShadow: scrolled
            ? "0 4px 24px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1)"
            : "none",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }} className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group relative z-10"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 group-active:scale-95"
              style={{ backgroundColor: "var(--terracotta)" }}
            >
              <ChefHat size={20} color="white" />
            </div>
            <span className="font-display text-xl text-white font-semibold tracking-tight mr-2">
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
                  className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--forest)] focus-visible:ring-[var(--amber)]"
                  style={{
                    color: active ? "var(--amber)" : "rgba(255,255,255,0.75)",
                    backgroundColor: active
                      ? "rgba(232,168,56,0.12)"
                      : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255,255,255,0.06)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.95)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color =
                        "rgba(255,255,255,0.75)";
                    }
                  }}
                >
                  {/* Active indicator pill */}
                  {active && (
                    <span
                      className="absolute inset-0 rounded-xl"
                      style={{
                        boxShadow:
                          "inset 0 0 0 1px rgba(232,168,56,0.3)",
                      }}
                    />
                  )}
                  <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                  {label}
                  {highlight && !active && (
                    <Sparkles
                      size={12}
                      className="opacity-60"
                      style={{ color: "var(--amber)" }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl text-white transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
            style={{
              backgroundColor: open
                ? "rgba(255,255,255,0.1)"
                : "transparent",
            }}
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <span className="transition-transform duration-200">
              {open ? <X size={22} /> : <Menu size={22} />}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`absolute top-16 left-0 right-0 transition-all duration-300 ease-out ${
            open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
          style={{
            backgroundColor: "var(--forest)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
          }}
        >
          <div className="px-4 py-3 space-y-1">
            {links.map(({ href, label, icon: Icon, highlight }, index) => {
              const active = path === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
                  style={{
                    color: active ? "var(--amber)" : "rgba(255,255,255,0.85)",
                    backgroundColor: active
                      ? "rgba(232,168,56,0.12)"
                      : "transparent",
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: active
                        ? "rgba(232,168,56,0.2)"
                        : "rgba(255,255,255,0.06)",
                    }}
                  >
                    <Icon
                      size={18}
                      strokeWidth={active ? 2.5 : 2}
                    />
                  </div>
                  <span className="flex-1">{label}</span>
                  {highlight && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                      style={{
                        backgroundColor: "rgba(232,168,56,0.2)",
                        color: "var(--amber)",
                      }}
                    >
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Bottom hint */}
          <div
            className="px-8 py-4 text-center text-xs"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            CookWise v1.0
          </div>
        </div>
      </div>
    </>
  );
}