"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Category } from "@/lib/types";

const fallbackEmoji: Record<string, string> = {
  "ladies-purse": "👜",
  "ladies-suit": "👗",
  "home-decor": "🏠",
  "hair-accessories": "💇",
  "handcrafts": "🏺",
};

export default function HeroSlider({ categories }: { categories: Category[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (categories.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % categories.length);
    }, 3600);
    return () => clearInterval(timer);
  }, [categories.length]);

  if (!categories.length) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] border border-[#e4ccb5] bg-[#fcf1e7] shadow-[0_35px_90px_-35px_rgba(188,136,101,0.35)]">
      <div className="absolute -left-10 top-6 h-24 w-24 rounded-full bg-[#f3d0bc]/70 blur-3xl animate-float-slow" />
      <div className="absolute right-8 bottom-10 h-28 w-28 rounded-full bg-[#f7e2ce]/70 blur-3xl animate-float-slow delay-2000" />

      {categories.map((cat, i) => (
        <div
          key={cat.id}
          className="absolute inset-0 transition-all duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0, transform: i === current ? "translateY(0) scale(1)" : "translateY(16px) scale(0.98)" }}
        >
          {cat.image_url ? (
            <Image src={cat.image_url} alt={cat.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f5d5c4] via-[#f9e2d2] to-[#f2d7c2]">
              <span className="text-8xl">{fallbackEmoji[cat.slug] || "🛍️"}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#775449]/20 via-transparent to-transparent" />
          <div className="absolute left-6 bottom-6 right-6 rounded-[1.6rem] border border-[#e4ccb5] bg-white/75 p-6 backdrop-blur-xl shadow-lg shadow-[#d6b092]/20">
            <p className="text-xs uppercase tracking-[0.3em] text-[#bb8d74]">Featured Collection</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#4b342d] md:text-3xl">{cat.name}</h2>
            <p className="mt-2 text-sm leading-6 text-[#7a5f51]">Discover a collection designed to feel light, luxurious, and beautifully balanced.</p>
            <Link
              href={`/category/${cat.slug}`}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#d07a62] via-[#e2b48e] to-[#e9d6bc] px-4 py-2 text-sm font-semibold text-[#4b342d] shadow-md shadow-[#d3a085]/30 transition hover:-translate-y-0.5"
            >
              Explore <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ))}

      {categories.length > 1 && (
        <div className="absolute right-6 top-6 flex gap-2 z-20">
          {categories.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-3 rounded-full transition-all duration-300 ${
                i === current ? "w-10 bg-[#b47c61]" : "w-3 bg-[#d7b59e]/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
