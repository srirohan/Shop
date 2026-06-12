"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Mail, Phone, Upload, Loader2, Save, Camera } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const supabase = createClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email || "");
        setName(user.user_metadata?.full_name || "");
        setPhone(user.user_metadata?.phone || "");
        setAvatarUrl(user.user_metadata?.avatar_url || null);
      }
      setFetching(false);
    });
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    let newAvatarUrl = avatarUrl;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `profiles/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(path, imageFile, { upsert: true });

      if (uploadError) {
        toast.error("Image upload failed.");
        setLoading(false);
        return;
      }
      const { data } = supabase.storage.from("images").getPublicUrl(path);
      newAvatarUrl = data.publicUrl;
    }

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: name.trim(),
        phone: phone.trim(),
        avatar_url: newAvatarUrl,
      },
    });

    if (error) {
      toast.error("Could not update profile.");
    } else {
      toast.success("Profile updated successfully!");
      setAvatarUrl(newAvatarUrl);
      setImageFile(null);
      setPreview(null);
    }
    setLoading(false);
  }

  const displayAvatar = preview || avatarUrl;

  if (fetching) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-rose-400" size={28} />
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <User size={22} className="text-rose-500" />
          Profile
        </h1>
        <p className="text-sm text-gray-400 mt-1">Manage your admin profile</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Avatar */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-4">Profile Photo</p>
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center border-2 border-rose-100">
                {displayAvatar ? (
                  <Image src={displayAvatar} alt="avatar" fill className="object-cover rounded-full" />
                ) : (
                  <User size={32} className="text-rose-300" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-rose-500 rounded-full flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors"
              >
                <Camera size={13} className="text-white" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">{name || "Admin"}</p>
              <p className="text-xs text-gray-400">{email}</p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-xs text-rose-500 hover:text-rose-700 mt-1 flex items-center gap-1"
              >
                <Upload size={11} /> Change photo
              </button>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <p className="text-sm font-semibold text-gray-700">Personal Details</p>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-gray-400" size={15} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-gray-400" size={15} />
              <input
                type="email"
                value={email}
                disabled
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed here</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 text-gray-400" size={15} />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-sm"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
