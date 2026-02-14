import Navbar from "@/components/Navbar"
import HeroSection from "./(nondashboard)/landing/HeroSection";
import FeaturesSection from "./(nondashboard)/landing/FeaturesSection";
import DiscoverSection from "./(nondashboard)/landing/DiscoverSection";
import CallToActionSection from "./(nondashboard)/landing/CallToActionSection";

export default function Home() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <DiscoverSection />
      <CallToActionSection />
    </div>
  );
}
