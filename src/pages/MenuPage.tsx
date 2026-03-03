import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { categories, products } from "@/lib/menu-data";

const MenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";

  const filtered = useMemo(
    () =>
      activeCategory === "all"
        ? products
        : products.filter((p) => p.categoryId === activeCategory),
    [activeCategory]
  );

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
            <p className="text-dim font-sans text-lg">
              Fresh, pure veg delights crafted with love
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            <button
              onClick={() => setSearchParams({})}
              className={`shrink-0 px-5 py-2.5 rounded-full font-sans font-medium text-sm border transition-all ${
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
                className={`shrink-0 px-5 py-2.5 rounded-full font-sans font-medium text-sm border transition-all ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-sans text-lg">
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
