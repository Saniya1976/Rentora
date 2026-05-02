import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              // Allow scripts from self, Clerk, and necessary CDNs
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://clerk.rentora-app-three.vercel.app https://*.clerk.com https://*.clerkstage.dev https://challenges.cloudflare.com",
              // Allow styles from self and inline
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Allow connections to API, Clerk, and Stripe
              "connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://rentora-mija.onrender.com https://api.stripe.com wss://*.clerk.accounts.dev",
              // Allow frames for Clerk and Stripe
              "frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com",
              // Allow images including maps and markers
              "img-src 'self' data: blob: https://*.clerk.com https://img.clerk.com https://images.unsplash.com https://res.cloudinary.com https://*.amazonaws.com https://*.tile.openstreetmap.org https://cdnjs.cloudflare.com https://raw.githubusercontent.com",
              // Allow fonts
              "font-src 'self' https://fonts.gstatic.com",
              // Allow workers
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
