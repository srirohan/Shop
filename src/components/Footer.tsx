import Link from "next/link";
import { Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function Footer() {
  const supabase = await createClient();
  const { data: setting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "contact_phone")
    .single();
  
  const contactPhone = setting?.value || "";

  return (
    <footer className="relative overflow-hidden" style={{ background: "linear-gradient(160deg,#1e0d06 0%,#3d1f10 40%,#6b3520 100%)" }}>

      {/* Decorative blobs */}
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full blur-3xl opacity-30" style={{ background: "radial-gradient(circle,#e8956d,transparent)" }} />
      <div className="absolute right-0 top-0 h-48 w-48 rounded-full blur-3xl opacity-20" style={{ background: "radial-gradient(circle,#c0622a,transparent)" }} />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#e8956d 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      {/* Top shimmer line */}
      <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg,transparent,#e8956d,#c0622a,#e8956d,transparent)" }} />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">

        {/* Main footer grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-10 sm:py-14 border-b border-white/10">

          {/* Brand column */}
          <div className="flex flex-col items-center sm:items-start gap-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-white font-black text-lg shadow-xl"
                style={{ background: "linear-gradient(135deg,#c0622a,#e8956d)" }}
              >
                A
              </div>
              <div>
                <p className="text-base font-black text-white tracking-tight">Aradhya Collection</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8956d]/60">✦ Premium Fashion</p>
              </div>
            </div>
            <p className="text-xs leading-5 text-white/40 text-center sm:text-left max-w-[200px]">
              Handpicked fashion &amp; home collections crafted with warmth and elegance.
            </p>
          </div>

          {/* Collections */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#e8956d]/60 mb-1">✦ Collections</p>
            {[
              { name: "Ladies Suit",       slug: "ladies-suit",       emoji: "👗" },
              { name: "Home Decor",        slug: "home-decor",        emoji: "🏡" },
              { name: "Hair Accessories",  slug: "hair-accessories",  emoji: "✂️" },
              { name: "Ladies Purse",      slug: "ladies-purse",      emoji: "👜" },
              { name: "Handcrafts",        slug: "handcrafts",        emoji: "🏺" },
            ].map((item) => (
              <Link
                key={item.slug}
                href={`/category/${item.slug}`}
                className="flex items-center gap-2 text-xs font-medium text-white/50 transition-all duration-200 hover:text-white hover:translate-x-1"
              >
                <span>{item.emoji}</span>
                {item.name}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center sm:items-end gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#e8956d]/60 mb-1">✦ Get in Touch</p>
            <a
              href={`tel:${contactPhone}`}
              className="group flex items-center gap-2.5 rounded-2xl px-5 py-3 transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: "rgba(232,149,109,0.1)", border: "1px solid rgba(232,149,109,0.2)" }}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "linear-gradient(135deg,#c0622a,#e8956d)" }}
              >
                <Phone size={14} className="text-white" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#e8956d]/50">Call Us</p>
                <p className="text-sm font-bold text-white">{contactPhone}</p>
              </div>
            </a>
            <p className="text-[10px] text-white/25 text-center sm:text-right">Available Mon – Sat, 9am – 7pm</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-5">
          <p className="text-[10px] text-white/25 tracking-wide">
            © {new Date().getFullYear()} Aradhya Collection. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            {["✦","◈","❋","◈","✦"].map((s, i) => (
              <span key={i} className="text-[#e8956d]/20 text-xs">{s}</span>
            ))}
          </div>
          <p className="text-[10px] text-white/20 tracking-wide">Made with ❤️ in India</p>
        </div>

      </div>
    </footer>
  );
}
