import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import CoursesSection from "@/components/landing/CoursesSection";
import MetricsSection from "@/components/landing/MetricsSection";
import AISection from "@/components/landing/AISection";
import Footer from "@/components/landing/Footer";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CoursesSection />
      <AISection />
      <MetricsSection />
      <Footer />
    </div>
  );
};

export default Index;
