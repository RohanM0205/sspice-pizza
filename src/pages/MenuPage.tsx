import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";

interface DBProduct {
  id: string;
  name: string;
  description: string;
  image_url: string;
  is_available: boolean;
  is_featured: boolean;
  category_id: string;
  product_variants: any[];
  product_addons: any[];
}

interface Category {
  id: string;
  name: string;
  sort_order: number;
  icon?: string;
}

const MenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // ✅ Fetch only ACTIVE categories
      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      // Fetch products
      const { data: productData } = await supabase
        .from("products")
        .select(`
          *,
          product_variants(*),
          product_addons(*)
        `)
        .eq("is_available", true);

      if (catData) {
        setCategories(catData);

        // List of active category ids
        const activeCategoryIds = catData.map((c) => c.id);

        // If user is currently on a hidden category → reset to "All"
        if (
          activeCategory !== "all" &&
          !activeCategoryIds.includes(activeCategory)
        ) {
          setSearchParams({});
        }

        if (productData) {
          const mapped = productData
            // ✅ Remove products from hidden categories
            .filter((p: DBProduct) =>
              activeCategoryIds.includes(p.category_id)
            )
            .map((p: DBProduct) => ({
              id: p.id,
              categoryId: p.category_id,
              name: p.name,
              description: p.description,
              image: p.image_url,
              isAvailable: p.is_available,
              isFeatured: p.is_featured,

              // Normalize variants
              variants: p.product_variants.map((v: any) => ({
                id: v.id,
                name: v.variant_name,
                price: Number(v.price),
                isDefault: v.is_default,
              })),

              // Normalize addons
              addons: p.product_addons.map((a: any) => ({
                id: a.id,
                name: a.name,
                price: Number(a.price),
              })),
            }));

          setProducts(mapped);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [activeCategory, setSearchParams]);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter((p) => p.categoryId === activeCategory);
  }, [activeCategory, products]);

  return (
    <main>
      <Navbar />

      <div className="pt-20 pb-24 md:pb-12">
        <div className="container mx-auto px-4">

          {/* Header */}
          <div className="text-center py-10">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Our Menu
            </h1>
            <p className="text-dim text-lg">
              Fresh, pure veg delights crafted with love
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            <button
              onClick={() => setSearchParams({})}
              className={`shrink-0 px-5 py-2.5 rounded-full font-medium text-sm border transition-all ${
                activeCategory === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
              }`}
            >
              All
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSearchParams({ category: cat.id })}
                className={`shrink-0 px-5 py-2.5 rounded-full font-medium text-sm border transition-all ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
                }`}
              >
                {/* Optional icon support */}
                {cat.icon ? `${cat.icon} ` : ""}
                {cat.name}
              </button>
            ))}
          </div>

          {loading && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                Loading menu...
              </p>
            </div>
          )}

          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                No items found in this category
              </p>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </main>
  );
};

export default MenuPage;