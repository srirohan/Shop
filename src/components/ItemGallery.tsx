"use client";

import { useState } from "react";
import Image from "next/image";

export default function ItemGallery({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return <div className="h-96 bg-black/5 flex items-center justify-center rounded-3xl">No Image</div>;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden bg-gradient-to-br from-[#f1e4d8] to-[#f9ede4] shadow-inner group">
        <Image
          src={images[currentIndex]}
          alt="Product Image"
          fill
          className="object-contain p-4 drop-shadow-[0_20px_40px_rgba(120,60,30,0.3)] transition-transform duration-500 group-hover:scale-150 cursor-zoom-in"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                currentIndex === idx ? "border-[#c0622a] opacity-100 scale-105" : "border-transparent opacity-60 hover:opacity-100 bg-[#f1e4d8]"
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
