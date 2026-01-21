import Navbar from "@/components/Navbar"
import HeroSection from "./(dashboard)/landing/HeroSection";
import FeaturesSection from "./(dashboard)/landing/FeaturesSection";

export default function Home() {
  return (
    <div className="bg-white min-h-screen">
     <Navbar />
     <HeroSection/>
     <FeaturesSection/>
    </div>
  );
}
