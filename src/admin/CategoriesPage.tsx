import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";

import {
  DndContext,
  closestCenter
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

const RESTAURANT_ID = "11111111-1111-1111-1111-111111111111";

const icons = ["🍕","🍔","🍝","🌯","🍟","🍰","🥤","🥗","🍗","🍜"];

const SortableItem = ({ cat, onDelete, onRename, onToggleStatus }: any) => {

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: cat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(cat.name);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between bg-card border border-border p-4 rounded-lg"
    >

      <div className="flex items-center gap-4">

        <div
          {...attributes}
          {...listeners}
          className="cursor-grab opacity-60"
        >
          ☰
        </div>

        <div className="text-xl">{cat.icon || "🍽️"}</div>

        {editing ? (
          <input
            value={name}
            onChange={(e)=>setName(e.target.value)}
            onBlur={()=>{
              onRename(cat.id,name)
              setEditing(false)
            }}
            className="px-2 py-1 border rounded bg-secondary"
            autoFocus
          />
        ) : (
          <div>
            <div className="font-medium">{cat.name}</div>
            <div className="text-xs opacity-60">
              {cat.products_count} products
            </div>
          </div>
        )}

      </div>

      <div className="flex items-center gap-4 text-sm">

        <span
          className={`px-2 py-1 rounded text-xs ${
            cat.is_active
              ? "bg-green-600/20 text-green-500"
              : "bg-yellow-600/20 text-yellow-400"
          }`}
        >
          {cat.is_active ? "Active" : "Hidden"}
        </span>

        <button
          onClick={()=>setEditing(true)}
          className="text-blue-500"
        >
          Edit
        </button>

        <button
          onClick={()=>onToggleStatus(cat)}
          className="opacity-70 hover:opacity-100"
        >
          Toggle
        </button>

        <button
          onClick={()=>onDelete(cat)}
          className="text-red-500"
        >
          Delete
        </button>

      </div>

    </div>
  );
};

const CategoriesPage = () => {

  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {

    const { data, error } = await supabase
      .from("categories")
      .select(`
        *,
        products(count)
      `)
      .order("sort_order", { ascending: true });

    if (error) {
      toast.error("Failed to load categories");
    } else {

      const formatted = (data || []).map((c:any)=>({
        ...c,
        products_count: c.products?.[0]?.count || 0
      }));

      setCategories(formatted);
    }

    setLoading(false);
  };

  useEffect(()=>{
    fetchCategories();
  },[]);

  const addCategory = async () => {

    if (!newCategory.trim()) return;

    const { error } = await supabase.from("categories").insert([{
      name: newCategory,
      restaurant_id: RESTAURANT_ID,
      sort_order: categories.length + 1,
      icon: icons[Math.floor(Math.random()*icons.length)],
      is_active: true
    }]);

    if (error) {
      toast.error("Failed to add category");
    } else {
      toast.success("Category added");
      setNewCategory("");
      fetchCategories();
    }
  };

  const deleteCategory = async (cat:any) => {

    if(cat.products_count > 0){
      toast.error("Cannot delete category with products");
      return;
    }

    if (!confirm("Delete this category?")) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", cat.id);

    if (error) toast.error("Delete failed");
    else {
      toast.success("Deleted");
      fetchCategories();
    }
  };

  const renameCategory = async (id:string,name:string)=>{

    const { error } = await supabase
      .from("categories")
      .update({ name })
      .eq("id",id);

    if(error){
      toast.error("Rename failed")
    } else {
      toast.success("Updated")
      fetchCategories()
    }

  }

  const toggleStatus = async (cat:any)=>{

    const { error } = await supabase
      .from("categories")
      .update({ is_active: !cat.is_active })
      .eq("id",cat.id)

    if(error){
      toast.error("Update failed")
    } else {
      fetchCategories()
    }

  }

  const handleDragEnd = async (event:any)=>{

    const {active,over} = event

    if(active.id !== over.id){

      const oldIndex = categories.findIndex(c=>c.id===active.id)
      const newIndex = categories.findIndex(c=>c.id===over.id)

      const newItems = arrayMove(categories,oldIndex,newIndex)

      setCategories(newItems)

      for(let i=0;i<newItems.length;i++){
        await supabase
          .from("categories")
          .update({sort_order:i+1})
          .eq("id",newItems[i].id)
      }

      toast.success("Category order updated")
    }

  }

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>

      <h1 className="text-3xl font-bold mb-6">Categories</h1>

      <div className="flex gap-4 mb-6">

        <input
          value={newCategory}
          onChange={(e)=>setNewCategory(e.target.value)}
          placeholder="New Category Name"
          className="px-4 py-2 border border-border rounded-lg bg-secondary w-80"
        />

        <button
          onClick={addCategory}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg"
        >
          Add
        </button>

        <input
          placeholder="Search categories..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          className="ml-auto px-4 py-2 border border-border rounded-lg bg-secondary"
        />

      </div>

      {loading && <p>Loading...</p>}

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >

        <SortableContext
          items={filtered.map(c=>c.id)}
          strategy={verticalListSortingStrategy}
        >

          <div className="space-y-3">

            {filtered.map(cat=>(
              <SortableItem
                key={cat.id}
                cat={cat}
                onDelete={deleteCategory}
                onRename={renameCategory}
                onToggleStatus={toggleStatus}
              />
            ))}

          </div>

        </SortableContext>

      </DndContext>

    </AdminLayout>
  );
};

export default CategoriesPage;