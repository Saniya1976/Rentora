"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaLinkedin,
} from "react-icons/fa";

const CallToActionSection = () => {
  return (
    <div className="relative py-24 overflow-hidden">
      {/* Background Image */}
      <Image
        src="/landing-cta.png"
        alt="Rentiful Search Section Background"
        fill
        priority
        className="object-cover object-center z-0"
      />

      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/45 z-10" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-20 max-w-4xl xl:max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-12"
      >
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8">
          
          {/* Text */}
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-xl">
              Find Homes That Actually Fit Your Life
            </h2>
            <p className="text-white text-lg drop-shadow-md">
              Discover hand-picked rental homes in locations that actually fit your life.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-center md:justify-start gap-4">
            <button
              onClick={() =>
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
              className="px-7 py-3 rounded-xl font-semibold bg-white text-[#04aaac] shadow-lg hover:bg-[#038f90] hover:text-white transition"
            >
              Search Homes
            </button>

            <Link
              href="/signup"
              scroll={false}
              className="px-7 py-3 rounded-xl font-semibold bg-[#04aaac] text-white shadow-lg hover:bg-[#038f90] transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-white">
          
          {/* Footer links */}
          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm font-medium">
            <Link href="/about" className="hover:underline">
              About
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
            <Link href="/faqs" className="hover:underline">
              FAQs
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
          </div>

          {/* Social Icons */}
          <div className="flex gap-5 text-xl">
            <a href="#" aria-label="Instagram" className="hover:text-[#04aaac] transition">
              <FaInstagram />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-[#04aaac] transition">
              <FaTwitter />
            </a>
            <a href="#" aria-label="YouTube" className="hover:text-[#04aaac] transition">
              <FaYoutube />
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-[#04aaac] transition">
              <FaLinkedin />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CallToActionSection;
