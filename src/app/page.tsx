import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { Category } from "@/lib/types";
import { ArrowRight, Star, Phone } from "lucide-react";
import HeroSlider from "@/components/HeroSlider";
import PageTracker from "@/components/PageTracker";

export const revalidate = 60;

const category3DImage: Record<string, string> = {
  "ladies-purse": "/categories/ladies-purse.png",
  "ladies-suit": "/categories/ladies-suit-v2.png",
  "home-decor": "/categories/home-decor.png",
  "hair-accessories": "/categories/hair-accessories.png",
  "handcrafts": "/categories/handcrafts.png",
};

const categoryTheme: Record<string, { bg: string; imgBg: string; badge: string; glow: string; pill: string; pillText: string; label: string }> = {
  "ladies-suit": {
    bg: "linear-gradient(145deg,#2d1b3d 0%,#4a2060 40%,#6b3080 100%)",
    imgBg: "linear-gradient(135deg,#3d1f5e,#6b3494,#9b59b6)",
    badge: "linear-gradient(135deg,#c084fc,#a855f7)",
    glow: "rgba(168,85,247,0.55)",
    pill: "rgba(192,132,252,0.18)",
    pillText: "#e9d5ff",
    label: "LADIES COLLECTION",
  },
  "home-decor": {
    bg: "linear-gradient(145deg,#1a2f1a 0%,#2d5a27 40%,#4a7c42 100%)",
    imgBg: "linear-gradient(135deg,#1e4620,#3a7d44,#5ba85b)",
    badge: "linear-gradient(135deg,#86efac,#22c55e)",
    glow: "rgba(34,197,94,0.50)",
    pill: "rgba(134,239,172,0.18)",
    pillText: "#bbf7d0",
    label: "HOME COLLECTION",
  },
  "hair-accessories": {
    bg: "linear-gradient(145deg,#2a1535 0%,#6b2d6b 40%,#c2185b 100%)",
    imgBg: "linear-gradient(135deg,#4a1040,#8e24aa,#e91e8c)",
    badge: "linear-gradient(135deg,#f9a8d4,#ec4899)",
    glow: "rgba(236,72,153,0.55)",
    pill: "rgba(249,168,212,0.18)",
    pillText: "#fce7f3",
    label: "HAIR COLLECTION",
  },
  "ladies-purse": {
    bg: "linear-gradient(145deg,#1a1a2e 0%,#16213e 40%,#0f3460 100%)",
    imgBg: "linear-gradient(135deg,#1e2a4a,#2d4a8a,#4169b8)",
    badge: "linear-gradient(135deg,#93c5fd,#3b82f6)",
    glow: "rgba(59,130,246,0.50)",
    pill: "rgba(147,197,253,0.18)",
    pillText: "#dbeafe",
    label: "PURSE COLLECTION",
  },
  "handcrafts": {
    bg: "linear-gradient(145deg,#2c1a10 0%,#543018 40%,#7a4524 100%)",
    imgBg: "linear-gradient(135deg,#3c2010,#6b3b1c,#9c5a30)",
    badge: "linear-gradient(135deg,#fcd34d,#f59e0b)",
    glow: "rgba(245,158,11,0.50)",
    pill: "rgba(252,211,77,0.18)",
    pillText: "#fef3c7",
    label: "HANDICRAFT COLLECTION",
  },
};

const defaultTheme = {
  bg: "linear-gradient(145deg,#2d1f1a 0%,#5c3a2a 40%,#8b5e3c 100%)",
  imgBg: "linear-gradient(135deg,#3d2010,#7a4020,#c0703a)",
  badge: "linear-gradient(135deg,#fdba74,#f97316)",
  glow: "rgba(249,115,22,0.50)",
  pill: "rgba(253,186,116,0.18)",
  pillText: "#ffedd5",
  label: "COLLECTION",
};

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: settingsRows }] = await Promise.all([
    supabase.from("categories").select("*").order("created_at", { ascending: true }),
    supabase.from("settings").select("key, value"),
  ]);

  const settings = Object.fromEntries((settingsRows || []).map((s) => [s.key, s.value]));
  const contactPhone = settings.contact_phone || "8077982246";

  return (
    <>
      <Navbar />
      <PageTracker page="home" />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#f7ede4] flex items-center min-h-[100dvh] lg:min-h-[92vh]">

        {/* Mesh orbs */}
        <div className="absolute -left-20 sm:-left-40 -top-20 h-64 w-64 sm:h-[500px] sm:w-[500px] rounded-full bg-gradient-to-br from-[#f9c5a7]/60 to-[#f4a27a]/40 blur-[80px] sm:blur-[120px] animate-float-slow" />
        <div className="absolute right-[-40px] sm:right-[-80px] top-10 h-56 w-56 sm:h-[450px] sm:w-[450px] rounded-full bg-gradient-to-tl from-[#f7d4b5]/50 to-[#f0b28a]/30 blur-[80px] sm:blur-[100px] animate-float-slow delay-2000" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-40 sm:h-64 w-full sm:w-[800px] rounded-full bg-[#fce8d5]/60 blur-3xl" />

        {/* Dot grid texture */}
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "radial-gradient(#8b5e3c 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        <div className="relative mx-auto max-w-7xl w-full px-4 sm:px-6 py-16 sm:py-20 lg:py-28">
          <div className="grid gap-10 lg:gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">

            {/* ── LEFT ── */}
            <div className="space-y-6 sm:space-y-8">

              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 sm:gap-2.5 rounded-full border border-[#dbb99a]/60 bg-white/70 px-3 sm:px-5 py-2 sm:py-2.5 backdrop-blur-md shadow-sm">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d97b6b] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d97b6b]" />
                </span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#9d5b3f]">✦ Handpicked looks for every celebration</span>
              </div>

              {/* Headline */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.06] tracking-tight text-[#2a160f]">
                  Elegant style
                  <br />
                  <span
                    style={{
                      background: "linear-gradient(120deg,#c0622a 0%,#e8956d 30%,#c9773b 60%,#a0522d 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    that feels warm,
                  </span>
                  <br />
                  <span className="text-[#4a2c24]">modern &amp; unforgettable.</span>
                </h1>
                <p className="max-w-lg text-sm sm:text-base leading-7 sm:leading-8 text-[#6f5344]">
                  Aradhya Collection — soft champagne tones, subtle motion, and a luxe
                  presentation that feels <span className="font-semibold text-[#9d5b3f]">premium</span> without being cold.
                </p>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
                <Link
                  href="#categories"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-5 sm:px-7 py-3 sm:py-3.5 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  style={{ background: "linear-gradient(135deg,#c0622a,#e8956d,#d4845a)" }}
                >
                  <span className="absolute inset-0 bg-white/0 transition-colors duration-300 group-hover:bg-white/10" />
                  <span className="relative">Explore Collection</span>
                  <ArrowRight size={16} className="relative transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href={`tel:${contactPhone}`}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-[#c5a48b] bg-white/60 px-5 sm:px-7 py-3 sm:py-3.5 text-sm font-bold text-[#7d5d4f] backdrop-blur-sm transition-all duration-300 hover:bg-white hover:border-[#d97b6b] hover:text-[#d97b6b] hover:shadow-lg"
                >
                  <Phone size={14} /> Call Us
                </Link>
              </div>

              {/* Stat chips */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { icon: "✦", label: "Soft Luxury", sub: "Warm palette" },
                  { icon: "◈", label: "Live Motion", sub: "Fluid animations" },
                  { icon: "❋", label: "Curated",     sub: "Category stories" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-[#e5d0bb] bg-white/70 p-3 sm:p-4 backdrop-blur-sm shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#d4a080]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="text-base sm:text-lg text-[#c0622a]">{s.icon}</span>
                    <p className="mt-1 text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.18em] text-[#b77662]">{s.label}</p>
                    <p className="mt-0.5 text-[10px] sm:text-xs font-medium text-[#5c3a2a] hidden sm:block">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT PANEL — hidden on mobile, shown on lg ── */}
            <div className="relative hidden lg:block">
              {/* Glow blob behind panel */}
              <div className="absolute inset-0 -m-8 rounded-[3rem] bg-gradient-to-br from-[#f9cba8]/50 to-[#f0a070]/30 blur-3xl" />

              <div
                className="relative overflow-hidden rounded-[2.5rem] p-1 shadow-[0_40px_100px_-30px_rgba(180,90,50,0.4)]"
                style={{ background: "linear-gradient(140deg,#e8c4a0,#f5ddc5,#dba87a,#f0cca0)" }}
              >
                <div className="rounded-[2.3rem] bg-[#fdf6ee]/95 p-6 backdrop-blur-xl space-y-4">

                  {/* Top hero card */}
                  <div
                    className="relative overflow-hidden rounded-[1.8rem] p-6"
                    style={{ background: "linear-gradient(135deg,#3d1f10,#7a3a1e,#c0703a)" }}
                  >
                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#f0a060]/30 blur-2xl" />
                    <div className="absolute bottom-0 left-0 h-20 w-20 rounded-full bg-[#e87040]/20 blur-xl" />
                    <p className="relative text-[10px] font-bold uppercase tracking-[0.25em] text-[#f0c090]/70">✦ Aradhya — Styled for you</p>
                    <h2 className="relative mt-2 text-2xl font-black leading-snug text-white">
                      A beautifully balanced<br />
                      <span style={{ background:"linear-gradient(90deg,#fdd5a0,#f9a060)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>first impression.</span>
                    </h2>
                    <p className="relative mt-2 text-xs leading-5 text-white/60">Soft neutrals, golden glow &amp; a welcoming vibe that feels polished and personal.</p>
                  </div>

                  {/* Stat row */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: "🛍️", label: "Collections", val: `${categories?.length || 0}+`,  sub: "Categories live" },
                      { icon: "⭐", label: "Quality",     val: "Premium",                        sub: "Handpicked only" },
                      { icon: "🎁", label: "Gift Ready",  val: "100%",                           sub: "Instant packaging" },
                      { icon: "📞", label: "Support",     val: "24 / 7",                          sub: "Always available" },
                    ].map((st) => (
                      <div
                        key={st.label}
                        className="group flex flex-col gap-1 rounded-2xl border border-[#edd8c0] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-[#d4a080]"
                      >
                        <span className="text-xl">{st.icon}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#b07050]">{st.label}</span>
                        <span className="text-lg font-black text-[#3a1e10]">{st.val}</span>
                        <span className="text-[10px] text-[#9a7060]">{st.sub}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bottom trust badge */}
                  <div className="flex items-center gap-3 rounded-2xl border border-[#e8d0b8] bg-gradient-to-r from-[#fff5ec] to-[#ffeedd] px-5 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#d97b6b] to-[#c0622a] text-white font-black text-sm shadow-md">A</div>
                    <div>
                      <p className="text-xs font-bold text-[#4a2c20]">Aradhya Collection</p>
                      <p className="text-[10px] text-[#9a7060]">Trusted by thousands of happy customers ✦</p>
                    </div>
                    <Star size={14} className="ml-auto text-[#e8956d]" fill="#e8956d" />
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── MARQUEE TICKER ── */}
      <div className="relative overflow-hidden border-y border-[#d4a882]/40" style={{ background: "linear-gradient(90deg,#3d1f10,#7a3a1e,#c0703a,#7a3a1e,#3d1f10)" }}>
        <div className="flex items-center py-3" style={{ animation: "marquee-scroll 22s linear infinite", whiteSpace: "nowrap", display: "flex", width: "max-content" }}>
          {[
            "✦ Ladies Suits", "◈ Home Decor", "❋ Hair Accessories", "✦ Ladies Purse",
            "◈ Premium Quality", "❋ Gift Ready", "✦ Fast Delivery", "◈ Aradhya Collection",
            "✦ Ladies Suits", "◈ Home Decor", "❋ Hair Accessories", "✦ Ladies Purse",
            "◈ Premium Quality", "❋ Gift Ready", "✦ Fast Delivery", "◈ Aradhya Collection",
          ].map((t, i) => (
            <span key={i} className="mx-4 sm:mx-6 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] sm:tracking-[0.22em] text-white/80">{t}</span>
          ))}
        </div>
      </div>

      {categories && categories.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-10">
          <HeroSlider categories={categories as Category[]} />
        </div>
      )}

      <main id="categories" className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full">

        {/* Section heading */}
        <div className="mb-8 sm:mb-14 flex flex-col items-center text-center">
          <span className="inline-block rounded-full border border-[#dbb99a]/60 bg-white/70 px-4 sm:px-5 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.22em] sm:tracking-[0.25em] text-[#b07050] backdrop-blur-sm mb-4 sm:mb-5">✦ Featured Collections</span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight"
            style={{ background:"linear-gradient(120deg,#2a160f 0%,#c0622a 45%,#2a160f 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}
          >
            Shop the Collections
          </h2>
          <p className="mt-3 sm:mt-4 max-w-lg text-xs sm:text-sm leading-6 sm:leading-7 text-[#6f5344] px-4 sm:px-0">
            Curated with warmth, crafted with love — each category is a premium shopping experience.
          </p>
          {/* Decorative accent line */}
          <div className="mt-4 sm:mt-5 flex items-center gap-3">
            <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-[#c0622a]/60" />
            <span className="text-[#c0622a] text-lg">✦</span>
            <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-[#c0622a]/60" />
          </div>
        </div>



        {!categories || categories.length === 0 ? (
          <div className="text-center text-[#7b5d51] py-20">No categories available yet.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 md:grid-cols-2 xl:grid-cols-4">
            {(categories as Category[]).map((cat) => {
              const theme = categoryTheme[cat.slug] || defaultTheme;
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="cat-card-wrap group block transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02]"
                  style={{ filter: `drop-shadow(0 25px 50px ${theme.glow})` }}
                >
                  <div
                    className="cat-card-inner"
                    style={{ background: theme.bg }}
                  >
                    {/* Sparkle accents */}
                    <span className="absolute top-4 right-5 text-white/20 text-xl animate-sparkle select-none pointer-events-none">✦</span>
                    <span className="absolute top-9 right-10 text-white/10 text-xs animate-sparkle delay-300 select-none pointer-events-none">✦</span>
                    <span className="absolute top-5 left-6 text-white/10 text-xs animate-sparkle delay-600 select-none pointer-events-none">✦</span>

                    {/* Image zone */}
                    <div
                      className="relative mx-4 mt-4 flex h-52 items-center justify-center overflow-hidden rounded-[1.4rem]"
                      style={{ background: theme.imgBg }}
                    >
                      {/* Inner glow blob */}
                      <div
                        className="absolute inset-0 rounded-[1.4rem] animate-card-glow"
                        style={{ background: `radial-gradient(ellipse at 50% 60%, ${theme.glow} 0%, transparent 70%)` }}
                      />
                      {/* Subtle grid overlay */}
                      <div
                        className="absolute inset-0 opacity-[0.07]"
                        style={{
                          backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(255,255,255,0.5) 24px,rgba(255,255,255,0.5) 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,rgba(255,255,255,0.5) 24px,rgba(255,255,255,0.5) 25px)",
                        }}
                      />
                      {cat.image_url ? (
                        <Image
                          src={cat.image_url}
                          alt={cat.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : category3DImage[cat.slug] ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={category3DImage[cat.slug]}
                            alt={cat.name}
                            fill
                            className="object-contain p-4 animate-img-float"
                            style={{ filter: `drop-shadow(0 24px 48px ${theme.glow}) drop-shadow(0 8px 16px rgba(0,0,0,0.4))` }}
                          />
                        </div>
                      ) : (
                        <span className="text-7xl">🛍️</span>
                      )}

                      {/* Top pill badge */}
                      <div
                        className="absolute top-3 left-3 animate-badge-pop rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md"
                        style={{ background: theme.pill, color: theme.pillText, border: `1px solid ${theme.pillText}30` }}
                      >
                        {theme.label}
                      </div>
                    </div>

                    {/* Text content */}
                    <div className="px-5 pb-5 pt-4">
                      {/* Divider line */}
                      <div
                        className="mb-4 h-px w-full opacity-20"
                        style={{ background: `linear-gradient(90deg, transparent, ${theme.pillText}, transparent)` }}
                      />
                      <h3 className="text-xl font-bold tracking-tight text-white">{cat.name}</h3>
                      <p className="mt-1 text-sm leading-6 opacity-60 text-white">Explore our curated {cat.name.toLowerCase()} collection.</p>

                      {/* CTA row */}
                      <div className="mt-4 flex items-center justify-between">
                        <span
                          className="rounded-full px-4 py-1.5 text-xs font-semibold backdrop-blur-md"
                          style={{ background: theme.badge, color: "#fff", boxShadow: `0 4px 16px ${theme.glow}` }}
                        >
                          Shop Now
                        </span>
                        <span className="flex items-center gap-1 text-xs font-semibold text-white/50 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white/90">
                          View All <span className="text-base">→</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
