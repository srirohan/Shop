"use client";

import { useState, useEffect } from "react";
import { X, Send, Loader2, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/track";
import toast from "react-hot-toast";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactPhone?: string;
}

export default function ContactModal({ isOpen, onClose, contactPhone }: ContactModalProps) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) track("contact_open");
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();

      // Save to Supabase contacts table
      await supabase.from("contacts").insert({
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        message: form.message.trim(),
      });

      // Also send email via API (if configured)
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }).catch(() => {});

      toast.success("Message sent! We will get back to you soon.");
      setForm({ name: "", phone: "", email: "", message: "" });
      onClose();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-2xl font-bold text-rose-600 mb-1">Get in Touch</h2>
          <p className="text-gray-500 text-sm">
            Call us directly or send a message below.
          </p>
        </div>

        {/* Tap to Call Card */}
        {contactPhone && (
          <div className="mx-6 mb-5">
            <div className="flex items-center justify-between bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl px-4 py-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <Phone size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-rose-100">Contact Number</p>
                  <p className="text-lg font-bold tracking-wide">{contactPhone}</p>
                </div>
              </div>
              <span className="text-white/80 text-sm font-medium">Call Now →</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Or send a message
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Priya Sharma"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={form.phone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "");
                setForm({ ...form, phone: digits });
              }}
              placeholder="Your mobile number (optional)"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com (optional)"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Message
            </label>
            <textarea
              required
              rows={3}
              value={form.message}
              onChange={(e) => {
                setForm({ ...form, message: e.target.value });
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              placeholder="What are you looking for? Feel free to ask anything..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none overflow-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
