"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Users, Trash2, Loader2, Phone, Mail, MessageSquare, Search } from "lucide-react";
import toast from "react-hot-toast";
import { Contact } from "@/lib/types";

export default function UserRecordsPage() {
  const supabase = createClient();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchContacts() {
      const { data } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });
      setContacts(data || []);
      setFetching(false);
    }
    fetchContacts();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Is record ko delete karna chahte hain?")) return;
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) { toast.error("Delete nahi hua."); return; }
    setContacts((prev) => prev.filter((c) => c.id !== id));
    toast.success("Record delete ho gaya.");
  }

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone || "").includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      c.message.toLowerCase().includes(q)
    );
  });

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users size={22} className="text-rose-500" /> User Records
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Contact form se aaye saare messages
        </p>
      </div>

      {/* Stats + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="bg-white rounded-xl px-5 py-3 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
            <MessageSquare size={16} className="text-rose-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800">{contacts.length}</p>
            <p className="text-xs text-gray-400">Total Messages</p>
          </div>
        </div>
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, phone, email se search karein..."
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>
      </div>

      {/* Records */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {fetching ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-rose-400" size={24} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-16 text-sm">
            {search ? "Koi result nahi mila." : "Abhi tak koi message nahi aaya."}
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {filtered.map((contact, idx) => (
              <li key={contact.id} className="p-5 hover:bg-gray-50/60 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Avatar */}
                    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm uppercase">
                      {contact.name.charAt(0)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-800 text-sm capitalize">{contact.name}</p>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          #{contacts.length - idx}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        {contact.phone && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Phone size={11} className="text-rose-400" /> {contact.phone}
                          </span>
                        )}
                        {contact.email && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Mail size={11} className="text-rose-400" /> {contact.email}
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-gray-700 bg-rose-50 rounded-lg px-3 py-2 border border-rose-100">
                        {contact.message}
                      </p>

                      <p className="mt-1.5 text-xs text-gray-400">{formatDate(contact.created_at)}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="flex-shrink-0 text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
