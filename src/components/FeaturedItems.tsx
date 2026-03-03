import { products } from "@/lib/menu-data";
import ProductCard from "./ProductCard";

const FeaturedItems = () => {
  const featured = products.filter((p) => p.isFeatured);

  return (
    <section className="py-16 sm:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Customer Favourites
          </h2>
          <p className="text-dim font-sans text-lg">
            Our most loved dishes, handpicked for you
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.slice(0, 6).map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedItems;
