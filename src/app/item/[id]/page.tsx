import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft, Phone, CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";
import PageTracker from "@/components/PageTracker";
import ItemGallery from "@/components/ItemGallery";
import ShareButton from "@/components/ShareButton";

export const revalidate = 60;

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("items")
    .select("*, categories(*)")
    .eq("id", id)
    .single();

  if (!item) notFound();

  // Fetch contact setting
  const { data: setting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "contact_phone")
    .single();
  const contactPhone = setting?.value || "";

  const images = item.image_urls?.length ? item.image_urls : [item.image_url];
  const categoryName = item.categories?.name || "Collection";
  const categorySlug = item.categories?.slug || "";

  return (
    <>
      <Navbar />
      <PageTracker page={`item/${id}`} meta={item.name} />
      <PageTracker page={`item/${id}`} meta={item.name} event="item_detail_view" />
      
      <div className="min-h-[100dvh] bg-[#f7ede4] bg-[radial-gradient(#c0622a22_1.5px,transparent_1.5px)] [background-size:32px_32px] flex flex-col pt-6 pb-20 relative overflow-hidden">
        
        {/* Soft top gradient to blend the navbar */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#f7ede4] to-transparent pointer-events-none z-0"></div>

        <main className="flex-1 max-w-[1400px] mx-auto px-4 sm:px-8 w-full relative z-10">
          {/* Back Navigation */}
          <Link
            href={`/category/${categorySlug}`}
            className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#a66a4f] hover:text-[#c0622a] transition-colors mb-8 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-[#dbb99a]/50 shadow-sm hover:shadow-md"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            Back to {categoryName}
          </Link>

          {/* Product Section */}
          <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white p-6 sm:p-10 shadow-2xl shadow-[#3d1f10]/5 flex flex-col lg:flex-row gap-10 lg:gap-16">
            
            {/* Left: Gallery */}
            <div className="w-full lg:w-1/2">
              <ItemGallery images={images} />
            </div>

            {/* Right: Details */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <div className="mb-4">
                <span className="inline-block rounded-full border border-[#dbb99a]/60 bg-white/70 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-[#b07050] backdrop-blur-sm">
                  ✦ {categoryName}
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2a160f] tracking-tight leading-tight mb-4">
                {item.name}
              </h1>
              
              <div className="flex items-center gap-2 text-sm text-[#8b674f] font-medium mb-8">
                <CheckCircle2 size={16} className="text-green-600" />
                Available in stock
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-[#dbb99a]/50 to-transparent mb-8" />

              <p className="text-[#6f5344] leading-relaxed mb-10 text-lg whitespace-pre-wrap">
                {item.description || `Experience premium quality and elegant design with our latest ${categoryName.toLowerCase()} collection. Perfect for your exquisite taste and everyday luxury.`}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                {/* Buy/WhatsApp CTA */}
                <a
                  href={`https://wa.me/${contactPhone.replace(/\D/g, '')}?text=Hi, I am interested in ${encodeURIComponent(item.name)} (ID: ${item.id})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 group flex items-center justify-center gap-3 rounded-full px-8 py-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#c0622a]/20"
                  style={{ background: "linear-gradient(135deg,#c0622a,#e8956d)" }}
                >
                  <Phone size={18} className="text-white" />
                  <span className="text-sm font-bold tracking-widest text-white uppercase">Inquire Now</span>
                </a>

                {/* Share CTA */}
                <ShareButton title={item.name} />
              </div>

              {/* Product Features / Highlights */}
              <div className="mt-10 pt-8 border-t border-[#dbb99a]/30">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#a66a4f] mb-6 flex items-center gap-3">
                  <span className="w-8 h-px bg-[#a66a4f]/30"></span>
                  Why You'll Love It
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/40 p-4 rounded-2xl border border-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors">
                    <h4 className="text-sm font-bold text-[#4a2e23] mb-1">Premium Craft</h4>
                    <p className="text-xs text-[#6f5344] leading-relaxed">Meticulously designed with attention to every detail for a flawless finish.</p>
                  </div>
                  <div className="bg-white/40 p-4 rounded-2xl border border-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors">
                    <h4 className="text-sm font-bold text-[#4a2e23] mb-1">Luxurious Feel</h4>
                    <p className="text-xs text-[#6f5344] leading-relaxed">Tailored from handpicked materials to offer unmatched ease and comfort.</p>
                  </div>
                  <div className="bg-white/40 p-4 rounded-2xl border border-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors">
                    <h4 className="text-sm font-bold text-[#4a2e23] mb-1">Timeless Elegance</h4>
                    <p className="text-xs text-[#6f5344] leading-relaxed">A perfect blend of classic aesthetics and contemporary style.</p>
                  </div>
                  <div className="bg-white/40 p-4 rounded-2xl border border-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors">
                    <h4 className="text-sm font-bold text-[#4a2e23] mb-1">Authentic Assured</h4>
                    <p className="text-xs text-[#6f5344] leading-relaxed">100% genuine products directly from our exclusive collection.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}
