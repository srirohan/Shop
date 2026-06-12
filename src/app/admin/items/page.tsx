"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Package, Plus, Trash2, Loader2, Upload, Pencil, X, Check, Images } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Category, Item } from "@/lib/types";

export default function ItemsPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<(Item & { categories: Category })[]>([]);
  const [selectedCat, setSelectedCat] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [name, setName] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCat, setEditCat] = useState("");
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [editPreviews, setEditPreviews] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  async function fetchData() {
    const [{ data: cats }, { data: itms }] = await Promise.all([
      supabase.from("categories").select("*").order("created_at"),
      supabase.from("items").select("*, categories(id,name,slug,image_url,created_at)")
        .order("created_at", { ascending: false }),
    ]);
    setCategories(cats || []);
    setItems((itms as (Item & { categories: Category })[]) || []);
    if (cats && cats.length > 0 && !selectedCat) setSelectedCat(cats[0].id);
    setFetching(false);
  }

  useEffect(() => { fetchData(); }, []);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files);
    setImageFiles((prev) => [...prev, ...arr]);
    setPreviews((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))]);
  }

  function removePreview(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadFiles(files: File[], folder: string): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("images").upload(path, file, { upsert: true });
      if (error) { toast.error(`Upload failed: ${file.name}`); continue; }
      urls.push(supabase.storage.from("images").getPublicUrl(path).data.publicUrl);
    }
    return urls;
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !selectedCat || imageFiles.length === 0) {
      toast.error("Name, category and at least 1 image required.");
      return;
    }
    setLoading(true);
    const urls = await uploadFiles(imageFiles, "items");
    if (urls.length === 0) { setLoading(false); return; }

    const { data: newItem, error } = await supabase.from("items")
      .insert({ name: name.trim(), category_id: selectedCat, image_url: urls[0], image_urls: urls })
      .select("*, categories(id,name,slug,image_url,created_at)")
      .single();

    if (error) { toast.error("Could not add item."); }
    else {
      toast.success("Item added!");
      setItems((prev) => [newItem as Item & { categories: Category }, ...prev]);
      setName(""); setImageFiles([]); setPreviews([]);
      if (fileRef.current) fileRef.current.value = "";
    }
    setLoading(false);
  }

  function startEdit(item: Item & { categories: Category }) {
    setEditId(item.id);
    setEditName(item.name);
    setEditCat(item.category_id);
    const existing = item.image_urls?.length ? item.image_urls : [item.image_url];
    setEditPreviews(existing);
    setEditFiles([]);
  }

  function cancelEdit() {
    setEditId(null); setEditName(""); setEditCat("");
    setEditFiles([]); setEditPreviews([]);
  }

  function handleEditFiles(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files);
    setEditFiles((prev) => [...prev, ...arr]);
    setEditPreviews((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))]);
  }

  function removeEditPreview(index: number) {
    setEditPreviews((prev) => prev.filter((_, i) => i !== index));
    // If it's a new file (index >= existing count), remove from editFiles too
    const existingCount = editPreviews.length - editFiles.length;
    if (index >= existingCount) {
      setEditFiles((prev) => prev.filter((_, i) => i !== (index - existingCount)));
    }
  }

  async function handleSaveEdit(item: Item) {
    if (!editName.trim()) return;
    setEditLoading(true);

    // Upload new files
    let finalUrls = editPreviews.filter((p) => p.startsWith("http")); // keep existing supabase URLs
    if (editFiles.length > 0) {
      const newUrls = await uploadFiles(editFiles, "items");
      finalUrls = [...finalUrls, ...newUrls];
    }
    if (finalUrls.length === 0) { toast.error("At least 1 image required."); setEditLoading(false); return; }

    const { error } = await supabase.from("items").update({
      name: editName.trim(),
      category_id: editCat,
      image_url: finalUrls[0],
      image_urls: finalUrls,
    }).eq("id", item.id);

    if (error) { toast.error("Could not update item."); }
    else {
      const cat = categories.find((c) => c.id === editCat)!;
      setItems((prev) => prev.map((it) =>
        it.id === item.id
          ? { ...it, name: editName.trim(), category_id: editCat, image_url: finalUrls[0], image_urls: finalUrls, categories: cat }
          : it
      ));
      toast.success("Item updated!");
      cancelEdit();
    }
    setEditLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) toast.error("Could not delete.");
    else { setItems((prev) => prev.filter((i) => i.id !== id)); toast.success("Item deleted."); }
  }

  const filteredItems = filterCat === "all" ? items : items.filter((i) => i.category_id === filterCat);

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package size={22} className="text-rose-500" /> Items
        </h1>
        <p className="text-sm text-gray-400 mt-1">Add, edit or delete products — multiple images supported</p>
      </div>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4 text-sm">Add New Item</h2>
        <div className="space-y-3">
          <select required value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400">
            <option value="">Select a category...</option>
            {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>

          <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Item name (e.g. Pink Leather Purse)"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />

          {/* Multi image upload */}
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 hover:border-rose-300 transition-colors">
            {previews.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  {previews.map((src, i) => (
                    <div key={i} className="relative h-20 rounded-lg overflow-hidden bg-rose-50 group">
                      <Image src={src} alt="" fill className="object-cover" />
                      <button type="button" onClick={() => removePreview(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={10} />
                      </button>
                      {i === 0 && <span className="absolute bottom-1 left-1 bg-rose-500 text-white text-xs px-1 rounded">Main</span>}
                    </div>
                  ))}
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="h-20 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-rose-300 transition-colors">
                    <Plus size={16} /><span className="text-xs mt-1">Add</span>
                  </button>
                </div>
                <p className="text-xs text-gray-400 text-center">{previews.length} image(s) • First image = main image</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400 cursor-pointer py-2" onClick={() => fileRef.current?.click()}>
                <Images size={24} />
                <span className="text-sm font-medium">Upload Images</span>
                <span className="text-xs">Select multiple images at once *</span>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => handleFiles(e.target.files)} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 text-sm">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {loading ? "Adding..." : "Add Item"}
          </button>
        </div>
      </form>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <h2 className="font-semibold text-gray-700 text-sm flex-1">Items ({filteredItems.length})</h2>
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none">
            <option value="all">All Categories</option>
            {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>

        {fetching ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-rose-400" size={24} /></div>
        ) : filteredItems.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">No items found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
            {filteredItems.map((item) => {
              const allImages = item.image_urls?.length ? item.image_urls : [item.image_url];
              return (
                <div key={item.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  {editId === item.id ? (
                    <div className="p-3 space-y-2">
                      {/* Edit images */}
                      <div className="grid grid-cols-3 gap-1.5">
                        {editPreviews.map((src, i) => (
                          <div key={i} className="relative h-16 rounded-lg overflow-hidden bg-rose-50 group">
                            <Image src={src} alt="" fill className="object-cover" />
                            <button type="button" onClick={() => removeEditPreview(i)}
                              className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <X size={9} />
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={() => editFileRef.current?.click()}
                          className="h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-rose-300">
                          <Plus size={14} />
                        </button>
                        <input ref={editFileRef} type="file" accept="image/*" multiple className="hidden"
                          onChange={(e) => handleEditFiles(e.target.files)} />
                      </div>
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                        className="w-full border border-rose-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-rose-400" />
                      <select value={editCat} onChange={(e) => setEditCat(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs">
                        {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                      <div className="flex gap-1.5">
                        <button onClick={() => handleSaveEdit(item)} disabled={editLoading}
                          className="flex-1 bg-rose-500 text-white text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 disabled:opacity-60">
                          {editLoading ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Save
                        </button>
                        <button onClick={cancelEdit}
                          className="flex-1 bg-gray-100 text-gray-600 text-xs py-1.5 rounded-lg flex items-center justify-center gap-1">
                          <X size={11} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="relative h-36 bg-rose-50">
                        <Image src={allImages[0]} alt={item.name} fill className="object-cover" />
                        {allImages.length > 1 && (
                          <span className="absolute top-1.5 right-1.5 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1">
                            <Images size={10} /> {allImages.length}
                          </span>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                        <p className="text-xs text-rose-400 truncate">{item.categories?.name}</p>
                        <div className="flex gap-1.5 mt-2">
                          <button onClick={() => startEdit(item)}
                            className="flex-1 flex items-center justify-center gap-1 text-xs text-blue-400 hover:text-blue-600 hover:bg-blue-50 py-1 rounded-lg transition-colors">
                            <Pencil size={11} /> Edit
                          </button>
                          <button onClick={() => handleDelete(item.id)}
                            className="flex-1 flex items-center justify-center gap-1 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 py-1 rounded-lg transition-colors">
                            <Trash2 size={11} /> Delete
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
