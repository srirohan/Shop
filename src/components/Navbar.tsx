"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Phone, Settings, ChevronDown, Sparkles } from "lucide-react";
import ContactModal from "./ContactModal";
import { createClient } from "@/lib/supabase/client";
import { Category } from "@/lib/types";

export default function Navbar({ minimal = false }: { minimal?: boolean }) {
  const [contactOpen, setContactOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [contactPhone, setContactPhone] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (minimal) return;
    const supabase = createClient();
    supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data }) => setCategories(data || []));
    supabase
      .from("settings")
      .select("value")
      .eq("key", "contact_phone")
      .single()
      .then(({ data }) => { if (data) setContactPhone(data.value); });
  }, [minimal]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-rose-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-600 rounded-lg flex items-center justify-center shadow-sm">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
              Aradhya Collection
            </span>
          </Link>

          {/* Right Buttons — hidden on minimal mode */}
          {!minimal && (
            <div className="flex items-center gap-2">

              {/* Categories Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-rose-600 text-sm font-semibold px-4 py-2 rounded-full hover:bg-rose-50 transition-colors"
                >
                  Collections
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-xl border border-rose-50 overflow-hidden z-50">
                    <div className="px-4 py-2.5 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
                      <p className="text-xs font-semibold text-rose-500 uppercase tracking-wider">
                        Our Categories
                      </p>
                    </div>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-rose-50 transition-colors group"
                      >
                        <span className="text-lg">
                          {cat.name.toLowerCase().includes("purse") ? "👜" :
                           cat.name.toLowerCase().includes("suit") ? "👗" :
                           cat.name.toLowerCase().includes("hair") ? "💇" : "🏠"}
                        </span>
                        <span className="text-sm text-gray-700 group-hover:text-rose-600 font-medium">
                          {cat.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact */}
              <button
                onClick={() => setContactOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-md"
              >
                <Phone size={14} />
                Contact
              </button>

              {/* Admin */}
              <Link
                href="/admin/login"
                className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-2 rounded-full transition-colors"
              >
                <Settings size={14} />
                Admin
              </Link>
            </div>
          )}
        </div>
      </header>

      {!minimal && (
        <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} contactPhone={contactPhone} />
      )}
    </>
  );
}
