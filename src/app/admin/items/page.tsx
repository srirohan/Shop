"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus, Trash2, Loader2, Upload, Pencil, X, Check, Images,
  LayoutGrid, List,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Category, Item } from "@/lib/types";

export default function ItemsPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<(Item & { categories: Category })[]>([]);
  const [filterCat, setFilterCat] = useState("all");
  const [fetching, setFetching] = useState(true);
  const [view, setView] = useState<"table" | "tile">("table");

  // Add modal
  const [showAdd, setShowAdd] = useState(false);
  const [addCat, setAddCat] = useState("");
  const [addName, setAddName] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addFiles, setAddFiles] = useState<File[]>([]);
  const [addPreviews, setAddPreviews] = useState<string[]>([]);
  const [addLoading, setAddLoading] = useState(false);
  const addFileRef = useRef<HTMLInputElement>(null);

  // Edit modal
  const [showEdit, setShowEdit] = useState(false);
  const [editItem, setEditItem] = useState<(Item & { categories: Category }) | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCat, setEditCat] = useState("");
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [editPreviews, setEditPreviews] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  async function fetchData() {
    const [{ data: cats }, { data: itms }] = await Promise.all([
      supabase.from("categories").select("*").order("created_at"),
      supabase.from("items")
        .select("*, categories(id,name,slug,image_url,created_at)")
        .order("created_at", { ascending: false }),
    ]);
    setCategories(cats || []);
    setItems((itms as (Item & { categories: Category })[]) || []);
    if (cats && cats.length > 0) setAddCat(cats[0].id);
    setFetching(false);
  }

  useEffect(() => { fetchData(); }, []);

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

  function handleAddFiles(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files);
    setAddFiles((prev) => [...prev, ...arr]);
    setAddPreviews((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))]);
  }

  function removeAddPreview(i: number) {
    setAddFiles((prev) => prev.filter((_, idx) => idx !== i));
    setAddPreviews((prev) => prev.filter((_, idx) => idx !== i));
  }

  function resetAdd() {
    setAddName(""); setAddDesc(""); setAddFiles([]); setAddPreviews([]); setShowAdd(false);
    if (addFileRef.current) addFileRef.current.value = "";
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addName.trim() || !addCat || addFiles.length === 0) {
      toast.error("Name, category and at least 1 image required."); return;
    }
    setAddLoading(true);
    const urls = await uploadFiles(addFiles, "items");
    if (urls.length === 0) { setAddLoading(false); return; }

    const { data: newItem, error } = await supabase.from("items")
      .insert({ name: addName.trim(), description: addDesc.trim(), category_id: addCat, image_url: urls[0], image_urls: urls })
      .select("*, categories(id,name,slug,image_url,created_at)").single();

    if (error) toast.error("Could not add item.");
    else {
      toast.success("Item added!");
      setItems((prev) => [newItem as Item & { categories: Category }, ...prev]);
      resetAdd();
    }
    setAddLoading(false);
  }

  function openEdit(item: Item & { categories: Category }) {
    setEditItem(item);
    setEditName(item.name);
    setEditDesc(item.description || "");
    setEditCat(item.category_id);
    setEditPreviews(item.image_urls?.length ? item.image_urls : [item.image_url]);
    setEditFiles([]);
    setShowEdit(true);
  }

  function resetEdit() {
    setShowEdit(false); setEditItem(null); setEditName(""); setEditDesc(""); setEditCat("");
    setEditFiles([]); setEditPreviews([]);
    if (editFileRef.current) editFileRef.current.value = "";
  }

  function handleEditFiles(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files);
    setEditFiles((prev) => [...prev, ...arr]);
    setEditPreviews((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))]);
  }

  function removeEditPreview(i: number) {
    const existingCount = editPreviews.length - editFiles.length;
    setEditPreviews((prev) => prev.filter((_, idx) => idx !== i));
    if (i >= existingCount) setEditFiles((prev) => prev.filter((_, idx) => idx !== (i - existingCount)));
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editItem || !editName.trim()) return;
    setEditLoading(true);

    let finalUrls = editPreviews.filter((p) => p.startsWith("http"));
    if (editFiles.length > 0) {
      const newUrls = await uploadFiles(editFiles, "items");
      finalUrls = [...finalUrls, ...newUrls];
    }
    if (finalUrls.length === 0) { toast.error("At least 1 image required."); setEditLoading(false); return; }

    const { error } = await supabase.from("items").update({
      name: editName.trim(), description: editDesc.trim(), category_id: editCat,
      image_url: finalUrls[0], image_urls: finalUrls,
    }).eq("id", editItem.id);

    if (error) toast.error("Could not update item.");
    else {
      const cat = categories.find((c) => c.id === editCat)!;
      setItems((prev) => prev.map((it) =>
        it.id === editItem.id
          ? { ...it, name: editName.trim(), description: editDesc.trim(), category_id: editCat, image_url: finalUrls[0], image_urls: finalUrls, categories: cat }
          : it
      ));
      toast.success("Item updated!");
      resetEdit();
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
    <div className="w-full">

      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-400">{filteredItems.length} items</p>
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-300">
            <option value="all">All Categories</option>
            {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
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
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm">
            <Plus size={16} /> Add Item
          </button>
        </div>
      </div>

      {fetching ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-rose-400" size={24} />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center text-gray-400 py-16 text-sm">
          No items found. Click "Add Item" to create one.
        </div>
      ) : view === "table" ? (

        /* ── TABLE VIEW ── */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-[56px_1fr_140px_60px_100px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div>Image</div>
            <div>Name</div>
            <div>Category</div>
            <div className="text-center">Imgs</div>
            <div className="text-right">Actions</div>
          </div>
          <ul className="divide-y divide-gray-50">
            {filteredItems.map((item) => {
              const allImages = item.image_urls?.length ? item.image_urls : [item.image_url];
              return (
                <li key={item.id} className="grid grid-cols-[56px_1fr_140px_60px_100px] gap-4 px-5 py-3 items-center hover:bg-gray-50/60 transition-colors">
                  <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-rose-50 flex-shrink-0">
                    <Image src={allImages[0]} alt={item.name} fill className="object-cover" />
                  </div>
                  <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                  <span className="text-xs text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full truncate w-fit">{item.categories?.name}</span>
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                    <Images size={12} /> {allImages.length}
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <button onClick={() => openEdit(item)}
                      className="text-blue-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(item.id)}
                      className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

      ) : (

        /* ── TILE VIEW ── */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map((item) => {
            const allImages = item.image_urls?.length ? item.image_urls : [item.image_url];
            return (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-44 bg-rose-50">
                  <Image src={allImages[0]} alt={item.name} fill className="object-cover" />
                  {allImages.length > 1 && (
                    <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <Images size={9} /> {allImages.length}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                  <span className="text-xs text-rose-400">{item.categories?.name}</span>
                  <div className="flex gap-1.5 mt-3">
                    <button onClick={() => openEdit(item)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs text-blue-500 bg-blue-50 hover:bg-blue-100 py-1.5 rounded-lg transition-colors font-medium">
                      <Pencil size={12} /> Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs text-red-500 bg-red-50 hover:bg-red-100 py-1.5 rounded-lg transition-colors font-medium">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={resetAdd}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <button onClick={resetAdd} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-gray-800 mb-5">Add New Item</h2>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
                <select required value={addCat} onChange={(e) => setAddCat(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300">
                  <option value="">Select category...</option>
                  {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Item Name</label>
                <input type="text" required value={addName} onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Pink Leather Purse"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  autoFocus />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                <textarea value={addDesc} onChange={(e) => setAddDesc(e.target.value)} rows={2}
                  placeholder="Enter item details..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Images <span className="text-rose-500">*</span>
                  <span className="text-gray-400 font-normal ml-1">(select multiple)</span>
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-rose-300 transition-colors">
                  {addPreviews.length > 0 ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-4 gap-2">
                        {addPreviews.map((src, i) => (
                          <div key={i} className="relative h-16 rounded-lg overflow-hidden bg-rose-50 group">
                            <Image src={src} alt="" fill className="object-cover" />
                            <button type="button" onClick={() => removeAddPreview(i)}
                              className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <X size={9} />
                            </button>
                            {i === 0 && <span className="absolute bottom-0.5 left-0.5 bg-rose-500 text-white text-[9px] px-1 rounded">Main</span>}
                          </div>
                        ))}
                        <button type="button" onClick={() => addFileRef.current?.click()}
                          className="h-16 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-rose-300 transition-colors">
                          <Plus size={14} /><span className="text-[10px] mt-0.5">Add</span>
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 text-center">{addPreviews.length} image(s) • First = main</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400 cursor-pointer py-3"
                      onClick={() => addFileRef.current?.click()}>
                      <Upload size={22} />
                      <span className="text-sm">Click to upload images</span>
                      <span className="text-xs">You can select multiple at once</span>
                    </div>
                  )}
                  <input ref={addFileRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={(e) => handleAddFiles(e.target.files)} />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={resetAdd}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={addLoading}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60 text-sm">
                  {addLoading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  {addLoading ? "Adding..." : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {showEdit && editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={resetEdit}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <button onClick={resetEdit} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-gray-800 mb-5">Edit Item</h2>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
                <select value={editCat} onChange={(e) => setEditCat(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300">
                  {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Item Name</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all shadow-sm"
                  required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all shadow-sm resize-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Images</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-rose-300 transition-colors">
                  <div className="grid grid-cols-4 gap-2">
                    {editPreviews.map((src, i) => (
                      <div key={i} className="relative h-16 rounded-lg overflow-hidden bg-rose-50 group">
                        <Image src={src} alt="" fill className="object-cover" />
                        <button type="button" onClick={() => removeEditPreview(i)}
                          className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={9} />
                        </button>
                        {i === 0 && <span className="absolute bottom-0.5 left-0.5 bg-rose-500 text-white text-[9px] px-1 rounded">Main</span>}
                      </div>
                    ))}
                    <button type="button" onClick={() => editFileRef.current?.click()}
                      className="h-16 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-rose-300 transition-colors">
                      <Plus size={14} /><span className="text-[10px] mt-0.5">Add</span>
                    </button>
                  </div>
                  <input ref={editFileRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={(e) => handleEditFiles(e.target.files)} />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={resetEdit}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={editLoading}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60 text-sm">
                  {editLoading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
