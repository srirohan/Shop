"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Loader2, Upload, Pencil, X, Check, LayoutGrid, List } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Category } from "@/lib/types";

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

export default function CategoriesPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [fetching, setFetching] = useState(true);
  const [view, setView] = useState<"table" | "tile">("table");

  // Add modal
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Edit
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  async function fetchCategories() {
    const { data } = await supabase
      .from("categories").select("*").order("created_at", { ascending: true });
    setCategories(data || []);
    setFetching(false);
  }

  useEffect(() => { fetchCategories(); }, []);

  function resetAdd() {
    setName(""); setImageFile(null); setPreview(null); setShowAdd(false);
    if (fileRef.current) fileRef.current.value = "";
  }

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
      .select().single();

    if (error) {
      toast.error(error.message.includes("unique") ? "Category already exists." : "Something went wrong.");
    } else {
      toast.success("Category added!");
      setCategories((prev) => [...prev, newCat]);
      resetAdd();
    }
    setLoading(false);
  }

  function startEdit(cat: Category) {
    setEditId(cat.id); setEditName(cat.name);
    setEditPreview(cat.image_url); setEditFile(null);
  }

  function cancelEdit() {
    setEditId(null); setEditName(""); setEditFile(null); setEditPreview(null);
  }

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
      name: editName.trim(), slug: updatedSlug, image_url: imageUrl,
    }).eq("id", cat.id);

    if (error) {
      toast.error("Could not update category.");
    } else {
      setCategories((prev) =>
        prev.map((c) => c.id === cat.id
          ? { ...c, name: editName.trim(), slug: updatedSlug, image_url: imageUrl } : c)
      );
      toast.success("Category updated!");
      cancelEdit();
    }
    setEditLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category and all its items?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast.error("Could not delete."); return; }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast.success("Category deleted.");
  }

  return (
    <div className="w-full">

      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{categories.length} categories total</p>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setView("table")}
              className={`p-1.5 rounded-md transition-colors ${view === "table" ? "bg-white shadow-sm text-rose-500" : "text-gray-400 hover:text-gray-600"}`}
              title="Table view">
              <List size={15} />
            </button>
            <button onClick={() => setView("tile")}
              className={`p-1.5 rounded-md transition-colors ${view === "tile" ? "bg-white shadow-sm text-rose-500" : "text-gray-400 hover:text-gray-600"}`}
              title="Tile view">
              <LayoutGrid size={15} />
            </button>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            <Plus size={16} /> Add Category
          </button>
        </div>
      </div>

      {fetching ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-rose-400" size={24} />
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center text-gray-400 py-16 text-sm">
          No categories yet. Click "Add Category" to create one.
        </div>
      ) : view === "table" ? (

        /* ── TABLE VIEW ── */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-[48px_1fr_160px_100px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div>Image</div>
            <div>Name</div>
            <div>Slug</div>
            <div className="text-right">Actions</div>
          </div>
          <ul className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <li key={cat.id} className="grid grid-cols-[48px_1fr_160px_100px] gap-4 px-5 py-3.5 items-center hover:bg-gray-50/60 transition-colors">
                {editId === cat.id ? (
                  <div className="col-span-4 grid grid-cols-[48px_1fr_160px_100px] gap-4 items-center">
                    <div
                      className="relative w-10 h-10 rounded-lg overflow-hidden bg-rose-50 cursor-pointer border-2 border-dashed border-rose-200 hover:border-rose-400 transition-colors flex-shrink-0"
                      onClick={() => editFileRef.current?.click()}
                    >
                      {editPreview ? (
                        <Image src={editPreview} alt="edit" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Upload size={13} className="text-rose-300" />
                        </div>
                      )}
                      <input ref={editFileRef} type="file" accept="image/*" className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setEditFile(file);
                          setEditPreview(URL.createObjectURL(file));
                        }} />
                    </div>
                    <input
                      type="text" value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border border-rose-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                      autoFocus
                    />
                    <span className="text-xs text-gray-400 truncate">/{slugify(editName)}</span>
                    <div className="flex items-center gap-1.5 justify-end">
                      <button onClick={() => handleSaveEdit(cat)} disabled={editLoading}
                        className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 disabled:opacity-60 transition-colors">
                        {editLoading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save
                      </button>
                      <button onClick={cancelEdit}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors">
                        <X size={12} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-rose-50 flex-shrink-0">
                      {cat.image_url ? (
                        <Image src={cat.image_url} alt={cat.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">🛍️</div>
                      )}
                    </div>
                    <p className="font-semibold text-gray-800 text-sm truncate">{cat.name}</p>
                    <p className="text-xs text-gray-400 truncate">/{cat.slug}</p>
                    <div className="flex items-center gap-1.5 justify-end">
                      <button onClick={() => startEdit(cat)}
                        className="text-blue-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(cat.id)}
                        className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>

      ) : (

        /* ── TILE VIEW ── */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-36 bg-rose-50">
                {cat.image_url ? (
                  <Image src={cat.image_url} alt={cat.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-gray-800 text-sm truncate">{cat.name}</p>
                <p className="text-xs text-gray-400 truncate">/{cat.slug}</p>
                <div className="flex gap-1.5 mt-3">
                  <button onClick={() => startEdit(cat)}
                    className="flex-1 flex items-center justify-center gap-1 text-xs text-blue-500 bg-blue-50 hover:bg-blue-100 py-1.5 rounded-lg transition-colors font-medium">
                    <Pencil size={12} /> Edit
                  </button>
                  <button onClick={() => handleDelete(cat.id)}
                    className="flex-1 flex items-center justify-center gap-1 text-xs text-red-500 bg-red-50 hover:bg-red-100 py-1.5 rounded-lg transition-colors font-medium">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={resetAdd}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}>
            <button onClick={resetAdd}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold text-gray-800 mb-5">Add New Category</h2>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category Name</label>
                <input
                  type="text" required value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Lady Purse"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  autoFocus
                />
                {name && (
                  <p className="text-xs text-gray-400 mt-1">Slug: /{slugify(name)}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Cover Image (optional)</label>
                <div
                  className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-rose-300 transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  {preview ? (
                    <div className="relative h-32 w-full">
                      <Image src={preview} alt="preview" fill className="object-contain rounded-lg" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-gray-400 py-4">
                      <Upload size={22} />
                      <span className="text-xs">Click to upload image</span>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setImageFile(file); setPreview(URL.createObjectURL(file));
                    }} />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={resetAdd}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60 text-sm">
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  {loading ? "Adding..." : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
