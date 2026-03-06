import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedItems from "@/components/FeaturedItems";
import WhyChooseUs from "@/components/WhyChooseUs";
import Footer from "@/components/Footer";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import OffersBanner from "@/components/OffersBanner";

const Index = () => {
  const location = useLocation();

  /* =========================
     🔥 Scroll To Featured
  ========================= */
  useEffect(() => {
    if (location.state?.scrollTo === "featured") {
      const el = document.getElementById("featured-section");

      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 100); // slight delay ensures DOM is ready
      }
    }
  }, [location]);

  return (
    <main>
      <Navbar />
      <HeroSection />
      <CategoryGrid />
      <FeaturedItems />
      <WhyChooseUs />
      <Footer />
    </main>
  );
};

export default Index;