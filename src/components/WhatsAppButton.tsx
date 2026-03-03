import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/919876543210?text=Hi!%20I'd%20like%20to%20place%20an%20order"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 md:bottom-6 right-4 z-40 w-14 h-14 rounded-full bg-[hsl(142,70%,45%)] text-[hsl(0,0%,100%)] flex items-center justify-center shadow-lg hover:scale-110 transition-transform animate-pulse-glow"
      aria-label="Chat on WhatsApp"
      style={{ boxShadow: "0 0 20px hsl(142 70% 45% / 0.4)" }}
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
};

export default WhatsAppButton;
