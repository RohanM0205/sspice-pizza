import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import heroPizza from "@/assets/hero-pizza.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={heroPizza}
          alt="Delicious pizza"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-xl"
        >
          <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-veg" />
            <span className="text-sm font-sans font-medium text-primary">100% Pure Veg</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 text-foreground">
            Born from{" "}
            <span className="text-gradient">Home Kitchen</span>
          </h1>

          <p className="text-lg sm:text-xl text-dim font-sans mb-8 leading-relaxed">
            Freshly baked pure veg pizzas, burgers & more — crafted with love in{" "}
            <span className="text-accent font-medium">Kalyan, Maharashtra</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/menu"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-sans font-semibold px-8 py-4 rounded-lg text-lg hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] glow-red"
            >
              Order Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="tel:+919876543210"
              className="inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-sans font-semibold px-8 py-4 rounded-lg text-lg hover:bg-secondary/80 transition-all border border-border"
            >
              <Phone className="w-5 h-5" />
              Call to Order
            </a>
          </div>

          <div className="mt-10 flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-accent">30</p>
              <p className="text-xs text-dim font-sans">Min Delivery</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-foreground">4.8★</p>
              <p className="text-xs text-dim font-sans">Rating</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-foreground">5000+</p>
              <p className="text-xs text-dim font-sans">Happy Customers</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
