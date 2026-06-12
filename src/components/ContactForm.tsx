"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.from("contacts").insert({
      name: name.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      message: message.trim(),
    });

    if (error) {
      toast.error("Something went wrong. Please try again.");
    } else {
      setSubmitted(true);
      setName(""); setPhone(""); setEmail(""); setMessage("");
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
        <CheckCircle2 size={44} className="text-rose-400" />
        <h3 className="text-lg font-bold text-gray-800">Message Sent!</h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Humne aapka message receive kar liya hai. Hum jaldi hi aapse contact karenge.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-2 text-sm text-rose-500 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Aapka naam"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Mobile number"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address (optional)"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Message / Inquiry <span className="text-rose-500">*</span>
        </label>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Kya chahiye aapko? Koi bhi sawaal poochh sakte hain..."
          rows={4}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-rose-200 disabled:opacity-60"
      >
        {loading ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
        {loading ? "Bhej rahe hain..." : "Message Bhejein"}
      </button>
    </form>
  );
}
