"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { useGetAuthUserQuery } from "@/state/api";
import { useRouter } from "next/navigation";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (authUser?.userRole) {
        const role = authUser.userRole.toLowerCase();

        if (role === "manager") {
          router.push("/managers/properties", { scroll: false });
        } else if (role === "tenant") {
          router.push("/tenants/favorites", { scroll: false });
        } else {
          setIsRedirecting(false);
        }
      } else {
        setIsRedirecting(false);
      }
    }
  }, [authUser, authLoading, router]);

  if (authLoading || isRedirecting) return <>Loading...</>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-700 transition-colors duration-300">
      <Navbar />
      <main
        className="flex-grow w-full"
        style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;