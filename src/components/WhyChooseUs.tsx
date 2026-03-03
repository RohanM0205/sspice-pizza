import { motion } from "framer-motion";
import { Leaf, Timer, Bike, Heart } from "lucide-react";

const features = [
  {
    icon: Leaf,
    title: "100% Pure Veg",
    desc: "Every dish is vegetarian, made with the freshest ingredients",
  },
  {
    icon: Heart,
    title: "Made with Love",
    desc: "Born from our home kitchen, recipes perfected over years",
  },
  {
    icon: Timer,
    title: "Fresh & Hot",
    desc: "Prepared fresh for every order, never pre-made",
  },
  {
    icon: Bike,
    title: "Fast Delivery",
    desc: "Quick delivery across Kalyan within 30 minutes",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Why Choose Us
          </h2>
          <p className="text-dim font-sans text-lg">
            What makes KalyanBites special
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-dim text-sm font-sans">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
