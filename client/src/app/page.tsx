import Navbar from "@/components/Navbar"
import HeroSection from "./(dashboard)/landing/HeroSection";

export default function Home() {
  return (
    <div className="bg-white min-h-screen">
     <Navbar />
     <HeroSection/>
    </div>
  );
}
