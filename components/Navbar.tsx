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

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-forest/85 backdrop-blur-md border-white/15 shadow-[0_4px_24px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.1)]"
            : "bg-forest border-white/10"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group relative z-10"
          >
            <div className="w-9 h-9 rounded-xl bg-terracotta flex items-center justify-center transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
              <ChefHat size={20} color="white" />
            </div>
            <span className="font-display text-xl text-white font-semibold tracking-tight">
              Cook<span className="text-amber">Wise</span>
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
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? "text-amber bg-amber/10 shadow-[inset_0_0_0_1px_rgba(232,168,56,0.3)]"
                      : "text-white/75 hover:bg-white/[0.06] hover:text-white/95"
                  }`}
                >
                  <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                  {label}
                  {highlight && !active && (
                    <Sparkles size={12} className="opacity-60 text-amber" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-white transition-colors duration-200 ${
              open ? "bg-white/10" : "bg-transparent"
            }`}
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
        className={`md:hidden fixed inset-0 z-40 transition-[opacity,pointer-events] duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`absolute top-16 left-0 right-0 bg-forest border-b border-white/10 shadow-[0_24px_48px_rgba(0,0,0,0.3)] transition-all duration-300 ease-out ${
            open ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
          }`}
        >
          <div className="px-4 py-3 flex flex-col gap-1">
            {links.map(({ href, label, icon: Icon, highlight }, index) => {
              const active = path === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 no-underline ${
                    active
                      ? "text-amber bg-amber/10"
                      : "text-white/85 hover:bg-white/[0.06]"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      active ? "bg-amber/20" : "bg-white/[0.06]"
                    }`}
                  >
                    <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                  </div>
                  <span className="flex-1">{label}</span>
                  {highlight && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber/20 text-amber">
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Bottom hint */}
          <div className="px-8 py-4 text-center text-xs text-white/35">
            CookWise v1.0
          </div>
        </div>
      </div>
    </>
  );
}
