import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { categories } from "@/lib/menu-data";

const CategoryGrid = () => {
  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Explore Our Menu
          </h2>
          <p className="text-dim font-sans text-lg">
            Pure veg delights, made fresh for you
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/menu?category=${cat.id}`}
                className="group block rounded-xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-3 text-center">
                  <h3 className="font-sans font-semibold text-foreground group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
