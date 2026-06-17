"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Phone, Settings, ChevronDown, Sparkles, Menu, X } from "lucide-react";
import ContactModal from "./ContactModal";
import { createClient } from "@/lib/supabase/client";
import { Category } from "@/lib/types";

const catEmoji: Record<string, string> = {
  purse: "👜", suit: "👗", hair: "✂️", home: "🏡",
};
function getEmoji(name: string) {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(catEmoji)) {
    if (lower.includes(key)) return emoji;
  }
  return "🛍️";
}

export default function Navbar({ minimal = false }: { minimal?: boolean }) {
  const [contactOpen, setContactOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [scrolled, setScrolled]           = useState(false);
  const [categories, setCategories]       = useState<Category[]>([]);
  const [contactPhone, setContactPhone]   = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* close mobile menu on resize to desktop */
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    if (minimal) return;
    const supabase = createClient();
    supabase.from("categories").select("*").order("created_at", { ascending: true })
      .then(({ data }) => setCategories(data || []));
    supabase.from("settings").select("value").eq("key", "contact_phone").single()
      .then(({ data }) => { if (data) setContactPhone(data.value); });
  }, [minimal]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header
        className="sticky top-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(253,246,238,0.92)" : "rgba(253,246,238,0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: scrolled ? "1px solid rgba(192,98,42,0.18)" : "1px solid rgba(192,98,42,0.08)",
          boxShadow: scrolled ? "0 4px 32px -8px rgba(180,80,30,0.18)" : "none",
        }}
      >
        {/* Animated gradient top line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: "linear-gradient(90deg,transparent 0%,#c0622a 20%,#e8956d 50%,#c0622a 80%,transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer-soft 3s linear infinite",
          }}
        />

        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* ── LOGO ── */}
          <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
            <div className="relative">
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md"
                style={{ background: "linear-gradient(135deg,#c0622a,#e8956d)", transform: "scale(1.4)" }}
              />
              <div
                className="relative w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg,#c0622a,#e8956d,#d4845a)" }}
              >
                <Sparkles size={17} className="text-white drop-shadow" />
              </div>
            </div>
            <span
              className="text-base sm:text-[1.15rem] font-black tracking-tight"
              style={{
                background: "linear-gradient(120deg,#7a3a1e 0%,#c0622a 40%,#e8956d 60%,#7a3a1e 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "shimmer-soft 4s linear infinite",
              }}
            >
              Aradhya Collection
            </span>
          </Link>

          {/* ── DESKTOP NAV ── */}
          {!minimal && (
            <div className="hidden md:flex items-center gap-1.5">

              {/* Collections dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300"
                  style={{ color: dropdownOpen ? "#c0622a" : "#5c3a2a", background: dropdownOpen ? "rgba(192,98,42,0.08)" : "transparent" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(192,98,42,0.08)")}
                  onMouseLeave={e => { if (!dropdownOpen) e.currentTarget.style.background = "transparent"; }}
                >
                  <span>Collections</span>
                  <ChevronDown size={14} style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s", color: "#c0622a" }} />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 top-14 w-64 overflow-hidden z-50"
                    style={{
                      borderRadius: "1.5rem",
                      background: "linear-gradient(160deg,#2a1408,#4d2010,#7a3a1e)",
                      boxShadow: "0 32px 64px -16px rgba(120,50,10,0.6), 0 0 0 1px rgba(232,149,109,0.15)",
                    }}
                  >
                    <div className="px-5 pt-4 pb-3 border-b border-white/10">
                      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#e8956d]/80">✦ Our Collections</p>
                    </div>
                    <div className="p-2">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/category/${cat.slug}`}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                          style={{ color: "rgba(255,255,255,0.75)" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(232,149,109,0.15)"; e.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base" style={{ background: "rgba(232,149,109,0.15)" }}>
                            {getEmoji(cat.name)}
                          </span>
                          <div>
                            <p className="text-sm font-semibold leading-none">{cat.name}</p>
                            <p className="text-[10px] mt-0.5 opacity-50">Explore collection →</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="px-5 py-3 border-t border-white/10">
                      <Link href="/#categories" onClick={() => setDropdownOpen(false)} className="text-[10px] font-bold uppercase tracking-widest text-[#e8956d]/70 hover:text-[#e8956d] transition-colors">
                        View all collections →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact */}
              <button
                onClick={() => setContactOpen(true)}
                className="relative group flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-full overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                style={{ background: "linear-gradient(135deg,#c0622a,#e8956d,#d4845a)", boxShadow: "0 4px 16px rgba(192,98,42,0.45)" }}
              >
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%)" }} />
                <Phone size={14} className="relative" />
                <span className="relative">Call Us</span>
              </button>

              {/* Admin */}
              <Link
                href="/admin/login"
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200"
                style={{ color: "rgba(92,58,42,0.5)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(192,98,42,0.08)"; e.currentTarget.style.color = "#c0622a"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(92,58,42,0.5)"; }}
              >
                <Settings size={13} />
                <span>Admin</span>
              </Link>
            </div>
          )}

          {/* ── MOBILE HAMBURGER ── */}
          {!minimal && (
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200"
              style={{ background: mobileOpen ? "rgba(192,98,42,0.12)" : "transparent" }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen
                ? <X size={22} style={{ color: "#c0622a" }} />
                : <Menu size={22} style={{ color: "#7a3a1e" }} />
              }
            </button>
          )}
        </div>
      </header>

      {/* ── MOBILE FULL-SCREEN MENU ── */}
      {!minimal && (
        <div
          className="fixed inset-0 z-40 md:hidden transition-all duration-400"
          style={{
            opacity: mobileOpen ? 1 : 0,
            pointerEvents: mobileOpen ? "all" : "none",
            transform: mobileOpen ? "translateY(0)" : "translateY(-12px)",
            transition: "opacity 0.35s ease, transform 0.35s ease",
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#1a0a04]/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />

          {/* Slide-down panel */}
          <div
            className="absolute top-16 left-0 right-0 overflow-y-auto"
            style={{
              background: "linear-gradient(160deg,#2a1408 0%,#4d2010 50%,#7a3a1e 100%)",
              borderRadius: "0 0 2rem 2rem",
              boxShadow: "0 40px 80px -20px rgba(80,20,0,0.7)",
              maxHeight: "calc(100vh - 4rem)",
            }}
          >
            {/* Top label */}
            <div className="px-6 pt-6 pb-3 border-b border-white/10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#e8956d]/60">✦ Navigate</p>
            </div>

            {/* Category links */}
            <div className="p-4 space-y-1">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 active:scale-95"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(232,149,109,0.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl" style={{ background: "rgba(232,149,109,0.15)" }}>
                    {getEmoji(cat.name)}
                  </span>
                  <div>
                    <p className="text-base font-bold text-white">{cat.name}</p>
                    <p className="text-xs opacity-40 mt-0.5">Explore collection →</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* CTA row */}
            <div className="px-4 pb-6 pt-2 border-t border-white/10 space-y-3">
              <button
                onClick={() => { setMobileOpen(false); setContactOpen(true); }}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold text-white transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg,#c0622a,#e8956d)", boxShadow: "0 8px 24px rgba(192,98,42,0.4)" }}
              >
                <Phone size={16} /> Contact Us
              </button>
              <Link
                href="/admin/login"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <Settings size={14} /> Admin Panel
              </Link>
            </div>
          </div>
        </div>
      )}

      {!minimal && (
        <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} contactPhone={contactPhone} />
      )}
    </>
  );
}
