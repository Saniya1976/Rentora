'use client'

import Image from 'next/image'
import { MapPin, Home, Search } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="bg-gray-50 py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
           
          {/* LEFT CONTENT */}
          <div className="space-y-12 max-w-xl">

            {/* Heading Group */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
                Let’s find a home <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-[#07c2c5] to-[#06bcc0]">
                  that’s perfect for you
                </span>
              </h1>

              <p className="text-slate-700 text-lg md:text-xl leading-relaxed max-w-md font-medium">
                Every home tells a story.
                With Rentora, finding the right rental becomes simple and stress-free.
Explore homes that match your taste, comfort, and everyday needs.
              </p>
            </div>

            {/* ENHANCED SEARCH BAR */}
  <div className="w-full max-w-lg">
 
  {/* Unified Search Input - PILL SHAPE */}
  <div className="relative flex items-center group">
    <div className="absolute left-6 text-slate-400 group-focus-within:text-[#009698] transition-colors">
      <Search className="w-6 h-6" />
    </div>
    
    <input 
      type="text"
      placeholder="Search by location, type..."
      className="w-full pl-16 pr-40 py-5 bg-white rounded-full shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] border-none focus:ring-2 focus:ring-[#009698]/20 text-slate-700 placeholder:text-slate-400 text-base outline-none transition-all"
    />

    <button className="absolute right-2 px-8 py-3.5 bg-[#04bbbe] text-white rounded-full font-bold text-sm hover:bg-[#02a2a5] transition-all active:scale-95 shadow-md shadow-[#009698]/20">
      Search
    </button>
  </div>


              {/* Quick Info Tags */}
              <div className="flex gap-6 mt-5 ml-4">
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-400 uppercase tracking-tight">
                  <MapPin className="w-3.5 h-3.5 text-[#009698]" />
                  Semarang, Indonesia
                </div>
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-400 uppercase tracking-tight">
                  <Home className="w-3.5 h-3.5 text-[#009698]" />
                  Modern Minimalist
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="hidden lg:flex justify-center">
            <div className="relative w-[460px] h-[560px] overflow-hidden shadow-2xl 
                  rounded-t-[240px] rounded-b-none border-[12px] border-white">
              <Image
                src="/mylandingpage.jpg"
                alt="Modern apartment"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}