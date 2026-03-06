import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
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
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

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

        const activeCategoryIds = catData.map((c) => c.id);

        if (
          activeCategory !== "all" &&
          !activeCategoryIds.includes(activeCategory)
        ) {
          setSearchParams({});
        }

        if (productData) {
          const mapped = productData
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

              variants: p.product_variants.map((v: any) => ({
                id: v.id,
                name: v.variant_name,
                price: Number(v.price),
                isDefault: v.is_default,
              })),

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
    let result = products;

    if (activeCategory !== "all") {
      result = result.filter((p) => p.categoryId === activeCategory);
    }

    if (search.trim() !== "") {
      const term = search.toLowerCase();

      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [activeCategory, products, search]);

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

            <p className="text-dim text-lg mb-6">
              Fresh, pure veg delights crafted with love and care
            </p>

            {/* Centered Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl mx-auto"
            >
              <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-card">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search pizza, burgers, garlic bread..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent outline-none text-sm text-center flex-1"
                />
              </div>
            </motion.div>
          </div>

          {/* Sticky Categories */}
          <div className="sticky top-[72px] z-30 bg-background/90 backdrop-blur border-b border-border">
            <div className="flex justify-center">
              <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
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
                    {cat.icon ? `${cat.icon} ` : ""}
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!loading && (
            <p className="text-sm text-muted-foreground mb-6 text-center">
              Showing {filtered.length} delicious item
              {filtered.length !== 1 && "s"}
            </p>
          )}

          {!loading && (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                />
              ))}
            </motion.div>
          )}

        </div>
      </div>

      <Footer />
    </main>
  );
};

export default MenuPage;