"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Category } from "@/lib/types";

const fallbackEmoji: Record<string, string> = {
  "lady-purse": "👜",
  "ladies-suit": "👗",
  "home-decor": "🏠",
  "hair-accessories": "💇",
};

export default function HeroSlider({ categories }: { categories: Category[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (categories.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % categories.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [categories.length]);

  if (!categories.length) return null;

  return (
    <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-2xl shadow-lg">
      {categories.map((cat, i) => (
        <div
          key={cat.id}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          {cat.image_url ? (
            <Image src={cat.image_url} alt={cat.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center">
              <span className="text-8xl">{fallbackEmoji[cat.slug] || "🛍️"}</span>
            </div>
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-rose-300 mb-1">
              Featured Collection
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{cat.name}</h2>
            <Link
              href={`/category/${cat.slug}`}
              className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors border border-white/30"
            >
              Explore <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ))}

      {/* Dots */}
      {categories.length > 1 && (
        <div className="absolute top-4 right-4 flex gap-1.5 z-10">
          {categories.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
