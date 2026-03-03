import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedItems from "@/components/FeaturedItems";
import WhyChooseUs from "@/components/WhyChooseUs";
import Footer from "@/components/Footer";

const Index = () => {
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
