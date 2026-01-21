"use client"
import Image from 'next/image'
import React from 'react'
import { motion as Motion } from 'framer-motion'
const HeroSection = () => {
  return (
    
  <div className="h-screen flex items-center justify-center ">
  <div className="relative w-full h-full rounded-lg overflow-hidden">
    <Image
      src="/mylanding.jpg"
      alt="Hero Section Image"
      fill
      className="object-cover"
      priority
    />
    <div className="absolute inset-0 bg-black/50" />
  </div>
  <Motion.div 
   initial={{ opacity: 0 }}
   animate={{ opacity: 1 }}
   transition={{ duration: 1 }}
   className="absolute text-center px-4 z-20">
    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
      Find Your Dream Rental Apartment
    </h1>
    <p className="text-lg md:text-2xl text-white mb-8">
      Discover the best apartments tailored to your needs with Rentora.
    </p>
    
    {/* Search bar */}
    <div className="flex items-center w-full max-w-2xl mx-auto shadow-lg">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Search by location, keywords..."
          className="w-full pl-12 pr-4 py-4 text-gray-700 bg-white rounded-l-lg focus:outline-none placeholder:text-gray-400"
        />
        <svg 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-600"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <button className="px-10 py-4 bg-teal-500 text-white font-semibold rounded-r-lg hover:bg-teal-600 transition-colors">
        Buy
      </button>
    </div>
  </Motion.div>
</div>
  )
}

export default HeroSection