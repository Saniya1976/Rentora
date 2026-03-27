"use client";

import Image from "next/image";
import React, { useState } from "react";

const ImagePreviews = ({ images }: ImagePreviewsProps) => {
  const [currentImageIndex, _] = useState(0);

  return (
    <div className="relative h-[450px] w-full rounded-xl overflow-hidden shadow-md">
      {images.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
        >
          <Image
            src={image}
            alt={`Property Image ${index + 1}`}
            fill
            priority={index == 0}
            className="object-cover transition-transform duration-500 ease-in-out"
          />
        </div>
      ))}
    </div>
  );
};

export default ImagePreviews;