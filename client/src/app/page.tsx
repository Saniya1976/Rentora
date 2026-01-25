import Navbar from "@/components/Navbar"
import HeroSection from "./(dashboard)/landing/HeroSection";
import FeaturesSection from "./(dashboard)/landing/FeaturesSection";
import DiscoverSection from "./(dashboard)/landing/DiscoverSection";
import CallToActionSection from "./(dashboard)/landing/CallToActionSection";

export default function Home() {
  return (
    <div className="bg-white min-h-screen">
     <Navbar />
     <HeroSection/>
     <FeaturesSection/>
     <DiscoverSection/>
     <CallToActionSection/>
    </div>
  );
}
