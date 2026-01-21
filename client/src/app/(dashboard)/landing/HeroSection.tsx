import Image from 'next/image'
import React from 'react'

const HeroSection = () => {
  return (
    
    <div className="h-screen flex items-center justify-center p-8">
  <div className="relative w-full h-full rounded-lg overflow-hidden">
    <Image
      src="/mylanding.jpg"
      alt="Hero Section Image"
      fill
      className="object-cover"
      priority
    />
    <div className="absolute inset-0 bg-black/40" />
  </div>
</div>
  )
}

export default HeroSection