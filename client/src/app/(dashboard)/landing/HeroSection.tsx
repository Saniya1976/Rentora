'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MapPin, Home, Search } from 'lucide-react'

type TabType = 'buy' | 'sell' | 'rent'

export default function HeroSection(){
  const [activeTab, setActiveTab] = useState<TabType>('buy')

  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          
          {/* LEFT CONTENT */}
<div className="space-y-12 max-w-xl">

  {/* Heading */}
  <div className="space-y-4">
    <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-snug">
      Let’s Find a Home <br />
      That’s Perfect for you
    </h1>

    <p className="text-gray-500 text-sm leading-relaxed max-w-md">
      Each property design has its own meaning and we are ready to help you get a
      property according to your taste.
    </p>

    <p className="text-sm text-gray-700 font-medium cursor-pointer">
      Let’s discuss soon.
    </p>
  </div>

  {/* SEARCH CARD */}
  <div className="space-y-4">

    {/* Tabs */}
    <div className="grid grid-cols-3 bg-gray-100 rounded-lg overflow-hidden text-sm font-medium">
      {(['buy', 'sell', 'rent'] as TabType[]).map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`py-3 uppercase transition
            ${
              activeTab === tab
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
        >
          {tab}
        </button>
      ))}
    </div>

    {/* Inputs */}
    <div className="bg-white rounded-lg shadow-md grid grid-cols-3 divide-x">

      <div className="p-4 flex items-center gap-3">
        <MapPin className="w-4 h-4 text-gray-400" />
        <div>
          <p className="text-xs text-gray-400">Location</p>
          <p className="text-sm text-gray-700 font-medium">
            Semarang, Indonesia
          </p>
        </div>
      </div>

      <div className="p-4 flex items-center gap-3">
        <Home className="w-4 h-4 text-gray-400" />
        <div>
          <p className="text-xs text-gray-400">Type</p>
          <p className="text-sm text-gray-700 font-medium">
            Modern, Minimalist
          </p>
        </div>
      </div>

      <button className="bg-blue-600 text-white flex items-center justify-center gap-2 font-medium text-sm hover:bg-blue-700 transition">
        <Search className="w-4 h-4" />
        Search
      </button>
    </div>
  </div>

  {/* STATS */}
  <div className="grid grid-cols-3 gap-4 pt-6">
    <div className="bg-blue-50 rounded-lg py-6 text-center">
      <p className="text-2xl font-semibold text-blue-600">9K+</p>
      <p className="text-sm text-gray-600">Premium Properties</p>
    </div>

    <div className="bg-blue-100 rounded-lg py-6 text-center">
      <p className="text-2xl font-semibold text-blue-600">5K+</p>
      <p className="text-sm text-gray-600">Happy Customers</p>
    </div>

    <div className="bg-blue-50 rounded-lg py-6 text-center">
      <p className="text-2xl font-semibold text-blue-600">58+</p>
      <p className="text-sm text-gray-600">Awards Winning</p>
    </div>
  </div>
</div>

          {/* RIGHT IMAGE */}
          <div className="hidden lg:flex justify-center">
  <div className="relative w-[460px] h-[580px] overflow-hidden shadow-xl 
                  rounded-t-[220px] rounded-b-none">
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

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20">
          {[
            { value: '9K+', label: 'Premium Properties' },
            { value: '5K+', label: 'Happy Customers' },
            { value: '58+', label: 'Awards Winning' },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="bg-white rounded-xl p-6 shadow-md text-center"
            >
              <p className="text-4xl font-bold text-blue-600 mb-1">{value}</p>
              <p className="text-gray-700 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
