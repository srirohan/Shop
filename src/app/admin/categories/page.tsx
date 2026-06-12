"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShoppingBag, Plus, Trash2, Loader2, Upload, Pencil, X, Check } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Category } from "@/lib/types";

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

export default function CategoriesPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  async function fetchCategories() {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true });
    setCategories(data || []);
    setFetching(false);
  }

  useEffect(() => { fetchCategories(); }, []);

  // Add new category
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    let imageUrl: string | null = null;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `categories/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("images").upload(path, imageFile, { upsert: true });
      if (uploadError) { toast.error("Image upload failed."); setLoading(false); return; }
      imageUrl = supabase.storage.from("images").getPublicUrl(path).data.publicUrl;
    }

    const slug = slugify(name);
    const { data: newCat, error } = await supabase
      .from("categories")
      .insert({ name: name.trim(), slug, image_url: imageUrl })
      .select()
      .single();

    if (error) {
      toast.error(error.message.includes("unique") ? "Category already exists." : "Something went wrong.");
    } else {
      toast.success("Category added!");
      setCategories((prev) => [...prev, newCat]);
      setName(""); setImageFile(null); setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
    }
    setLoading(false);
  }

  // Start editing
  function startEdit(cat: Category) {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditPreview(cat.image_url);
    setEditFile(null);
  }

  function cancelEdit() {
    setEditId(null); setEditName(""); setEditFile(null); setEditPreview(null);
  }

  function handleEditFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditFile(file);
    setEditPreview(URL.createObjectURL(file));
  }

  // Save edit — update state directly after DB update
  async function handleSaveEdit(cat: Category) {
    if (!editName.trim()) return;
    setEditLoading(true);

    let imageUrl = cat.image_url;
    if (editFile) {
      const ext = editFile.name.split(".").pop();
      const path = `categories/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("images").upload(path, editFile, { upsert: true });
      if (uploadError) { toast.error("Image upload failed."); setEditLoading(false); return; }
      imageUrl = supabase.storage.from("images").getPublicUrl(path).data.publicUrl;
    }

    const updatedSlug = slugify(editName);
    const { error } = await supabase.from("categories").update({
      name: editName.trim(),
      slug: updatedSlug,
      image_url: imageUrl,
    }).eq("id", cat.id);

    if (error) {
      toast.error("Could not update category.");
    } else {
      // Update state directly — no refetch needed
      setCategories((prev) =>
        prev.map((c) =>
          c.id === cat.id
            ? { ...c, name: editName.trim(), slug: updatedSlug, image_url: imageUrl }
            : c
        )
      );
      toast.success("Category updated!");
      cancelEdit();
    }
    setEditLoading(false);
  }

  // Delete
  async function handleDelete(id: string) {
    if (!confirm("This will delete the category and all its items. Are you sure?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast.error("Could not delete."); return; }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast.success("Category deleted.");
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ShoppingBag size={22} className="text-rose-500" /> Categories
        </h1>
        <p className="text-sm text-gray-400 mt-1">Add, edit or delete categories</p>
      </div>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4 text-sm">Add New Category</h2>
        <div className="space-y-3">
          <input
            type="text" required value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Category name (e.g. Lady Purse)"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          />

          <div
            className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-rose-300 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            {preview ? (
              <div className="relative h-28 w-full">
                <Image src={preview} alt="preview" fill className="object-contain" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-gray-400">
                <Upload size={20} />
                <span className="text-xs">Upload cover image (optional)</span>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setImageFile(file); setPreview(URL.createObjectURL(file));
            }} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 text-sm">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {loading ? "Adding..." : "Add Category"}
          </button>
        </div>
      </form>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700 text-sm">Existing Categories ({categories.length})</h2>
        </div>

        {fetching ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-rose-400" size={24} />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">No categories yet.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <li key={cat.id} className="p-4">
                {editId === cat.id ? (
                  /* ── Edit Mode ── */
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {/* Image upload in edit */}
                      <div
                        className="relative w-14 h-14 rounded-xl overflow-hidden bg-rose-50 flex-shrink-0 cursor-pointer border-2 border-dashed border-rose-200 hover:border-rose-400 transition-colors"
                        onClick={() => editFileRef.current?.click()}
                        title="Click to change image"
                      >
                        {editPreview ? (
                          <Image src={editPreview} alt="edit" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-rose-300">
                            <Upload size={16} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Upload size={13} className="text-white" />
                        </div>
                        <input ref={editFileRef} type="file" accept="image/*" className="hidden" onChange={handleEditFile} />
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <input
                          type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                          className="w-full border border-rose-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                          autoFocus
                        />
                        <p className="text-xs text-gray-400">Click image to change it</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => handleSaveEdit(cat)} disabled={editLoading}
                        className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60">
                        {editLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
                      </button>
                      <button onClick={cancelEdit}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── View Mode ── */
                  <div className="flex items-center gap-3">
                    <div
                      className="relative w-12 h-12 rounded-lg overflow-hidden bg-rose-50 flex-shrink-0 cursor-pointer"
                      onClick={() => startEdit(cat)}
                      title="Click to edit"
                    >
                      {cat.image_url ? (
                        <Image src={cat.image_url} alt={cat.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">🛍️</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{cat.name}</p>
                      <p className="text-xs text-gray-400">/{cat.slug}</p>
                    </div>
                    <button onClick={() => startEdit(cat)}
                      className="text-blue-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors" title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(cat.id)}
                      className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
