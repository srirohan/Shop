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
      
      <div className="min-h-[100dvh] bg-[#f7ede4] flex flex-col pt-6 pb-20">
        <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 w-full">
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

              {/* Trust badges */}
              <div className="mt-8 flex items-center justify-center sm:justify-start gap-6 opacity-60">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xl">✨</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#2a160f]">Premium</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xl">🛡️</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#2a160f]">Quality</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xl">🚚</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#2a160f]">Fast Ship</span>
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
