import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProductCard from "./ProductCard";

const FeaturedItems = () => {
  const [products, setProducts] = useState<any[]>([]);

  const normalizeProduct = (p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    image: p.image_url,
    isFeatured: true,
    variants: p.product_variants || [],
    addons: p.product_addons || [],
    category: p.categories?.name?.toLowerCase() || "",
  });

  const fetchProducts = async () => {
    // -------- BEST SELLERS --------
    const { data: orderItems } = await supabase
      .from("order_items")
      .select(`
        product_id,
        products(
          id,
          name,
          description,
          image_url,
          categories(name),
          product_variants(*),
          product_addons(*)
        )
      `);

    const salesMap: any = {};

    (orderItems || []).forEach((item: any) => {
      const p = item.products;
      if (!p) return;

      if (!salesMap[p.id]) {
        salesMap[p.id] = { ...p, sales: 0 };
      }

      salesMap[p.id].sales += 1;
    });

    const bestSellerProducts = Object.values(salesMap)
      .sort((a: any, b: any) => b.sales - a.sales)
      .map(normalizeProduct);

    // -------- FALLBACK PRODUCTS --------
    const { data: fallbackData } = await supabase
      .from("products")
      .select(`
        *,
        categories(name),
        product_variants(*),
        product_addons(*)
      `)
      .eq("is_available", true)
      .order("created_at", { ascending: false });

    const fallbackProducts = (fallbackData || []).map(normalizeProduct);

    // -------- CATEGORY HELPERS --------
    const getCategoryProducts = (list: any[], keyword: string) =>
      list.filter((p) => p.category.includes(keyword));

    const pizzas = getCategoryProducts(bestSellerProducts, "pizza");
    const burgers = getCategoryProducts(bestSellerProducts, "burger");
    const pasta = getCategoryProducts(bestSellerProducts, "pasta");
    const sides = getCategoryProducts(bestSellerProducts, "side");

    const fallbackPizzas = getCategoryProducts(fallbackProducts, "pizza");
    const fallbackBurgers = getCategoryProducts(fallbackProducts, "burger");
    const fallbackPasta = getCategoryProducts(fallbackProducts, "pasta");
    const fallbackSides = getCategoryProducts(fallbackProducts, "side");

    // -------- FINAL STRUCTURE --------
    const finalProducts = [
      ...pizzas.slice(0, 3),
      ...fallbackPizzas.slice(0, Math.max(0, 3 - pizzas.length)),

      burgers[0] || fallbackBurgers[0],
      pasta[0] || fallbackPasta[0],
      sides[0] || fallbackSides[0],
    ].filter(Boolean);

    setProducts(finalProducts);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <section
      id="featured-section"
      className="py-16 sm:py-20 bg-muted/30 scroll-mt-24"
    >
      <div className="container mx-auto px-4">

        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Customer Favourites
          </h2>
          <p className="text-dim font-sans text-lg">
            Our most loved dishes
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            No items available right now.
          </div>
        )}

      </div>
    </section>
  );
};

export default FeaturedItems;