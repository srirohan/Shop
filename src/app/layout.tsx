import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aradhya Collection",
  description: "Ladies Purse, Suit, Home Decor aur Hair Accessories ki behtareen collection",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" className="h-full">
      <body className={`${geist.className} min-h-full flex flex-col antialiased`}>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
