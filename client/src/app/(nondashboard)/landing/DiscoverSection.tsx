"use client";

import React from "react";
// Import Variants type to fix the 'variants' prop error
import { motion, Variants } from "framer-motion";
import { Search, Calendar, Heart, ArrowRight } from "lucide-react";

// Explicitly type the variants as 'Variants'
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  },
};

const DiscoverSection = () => {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
      className="py-24 bg-white"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tighter leading-[1.1]">
            Discover your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14ced2] to-[#08babd]">
              dream rental property
            </span>
          </h2>
          <p className="text-slate-600 text-lg font-medium opacity-90 leading-relaxed">
            Searching for your dream rental has never been easier. With our user-friendly 
            feature set, you can find the perfect home that meets all your needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {[
            {
              icon: <Search className="w-6 h-6" />,
              title: "Search for Properties",
              description: "Browse through our extensive collection of rental properties in your desired location.",
              action: "Search",
            },
            {
              icon: <Calendar className="w-6 h-6" />,
              title: "Book Your Rental",
              description: "Once you've found the perfect rental property, easily book it online with just a few clicks.",
              action: "Book Now",
            },
            {
              icon: <Heart className="w-6 h-6" />,
              title: "Enjoy your New Home",
              description: "Move into your new rental property and start enjoying your dream home immediately.",
              action: "Discover",
            },
          ].map((card, index) => (
            <motion.div key={index} variants={itemVariants}>
              <DiscoverCard {...card} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

const DiscoverCard = ({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
}) => (
  <div className="group relative bg-white p-10 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-50 hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 text-center flex flex-col items-center h-full">
    <div className="w-16 h-16 mb-8 rounded-2xl bg-gradient-to-br from-[#0dc1c4] to-[#09c4c7] flex items-center justify-center text-white shadow-lg shadow-[#009698]/20 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>

    <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">
      {title}
    </h3>
    
    <p className="text-slate-500 font-medium leading-relaxed mb-8">
      {description}
    </p>

    <button className="mt-auto inline-flex items-center gap-2 px-8 py-3 bg-[#1dc9cc] text-white rounded-full font-bold text-sm hover:bg-[#009698] transition-all active:scale-95 shadow-md shadow-[#009698]/10 group-hover:shadow-lg">
      {action}
      <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

export default DiscoverSection;