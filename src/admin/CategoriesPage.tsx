import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";

const RESTAURANT_ID = "11111111-1111-1111-1111-111111111111";

const CategoriesPage = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      toast.error("Failed to load categories");
    } else {
      setCategories(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async () => {
    if (!newCategory.trim()) return;

    const { error } = await supabase.from("categories").insert([
      {
        name: newCategory,
        restaurant_id: RESTAURANT_ID,
        sort_order: categories.length + 1,
      },
    ]);

    if (error) {
      toast.error("Failed to add category");
    } else {
      toast.success("Category added");
      setNewCategory("");
      fetchCategories();
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) toast.error("Delete failed");
    else {
      toast.success("Deleted");
      fetchCategories();
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Categories</h1>

      {/* Add Category */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New Category Name"
          className="px-4 py-2 border border-border rounded-lg bg-secondary w-80"
        />
        <button
          onClick={addCategory}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg"
        >
          Add
        </button>
      </div>

      {loading && <p>Loading...</p>}

      <div className="space-y-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex justify-between items-center bg-card border border-border p-4 rounded-lg"
          >
            <span className="font-medium">{cat.name}</span>

            <button
              onClick={() => deleteCategory(cat.id)}
              className="text-red-500 text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default CategoriesPage;