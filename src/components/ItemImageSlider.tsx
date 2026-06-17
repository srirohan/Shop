"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function ItemImageSlider({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [images.length]);

  if (!images.length) return null;

  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
      {images.map((src, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700 flex items-center justify-center p-2"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image 
            src={src} 
            alt="" 
            fill 
            className="object-contain drop-shadow-[0_15px_25px_rgba(120,60,30,0.25)] transition-transform duration-700 group-hover:scale-105" 
          />
        </div>
      ))}

      {images.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); setCurrent(i); }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "bg-[#c0622a] w-3 scale-110" : "bg-[#c0622a]/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
