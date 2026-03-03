import { MapPin, Phone, Clock, Instagram, Facebook } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                <span className="font-display text-primary-foreground text-lg font-bold">K</span>
              </div>
              <span className="font-display text-xl font-bold text-foreground">
                Kalyan<span className="text-primary">Bites</span>
              </span>
            </div>
            <p className="text-dim text-sm font-sans leading-relaxed">
              Born from a home kitchen in Kalyan, serving freshly made pure veg pizzas, burgers & more with love.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-dim text-sm font-sans hover:text-primary transition-colors">Home</Link>
              <Link to="/menu" className="text-dim text-sm font-sans hover:text-primary transition-colors">Menu</Link>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Contact</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-dim text-sm font-sans">Near Kalyan Station, Kalyan West, Maharashtra 421301</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:+919876543210" className="text-dim text-sm font-sans hover:text-accent transition-colors">+91 98765 43210</a>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-dim text-sm font-sans">Mon–Sun: 11:00 AM – 11:00 PM</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Follow Us</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-dim hover:text-primary hover:bg-primary/10 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-dim hover:text-primary hover:bg-primary/10 transition-all">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center">
          <p className="text-dim text-xs font-sans">
            © 2026 KalyanBites. All rights reserved. Made with ❤️ in Kalyan.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
