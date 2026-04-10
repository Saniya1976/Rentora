"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { usePathname, useRouter } from "next/navigation";
import { useGetAuthUserQuery } from "@/state/api";
import { useUser } from "@clerk/nextjs";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded: isClerkLoaded, user: clerkUser } = useUser();

  const pathname = usePathname();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  const viewType = pathname.startsWith("/manager") ? "manager" : "tenant";

  const { data: authUser, isLoading: authLoading } =
    useGetAuthUserQuery(viewType, {
      skip: !isClerkLoaded || !clerkUser,
    });

  const userRole = (
    authUser?.userRole ||
    (clerkUser?.publicMetadata?.userType as string) ||
    (clerkUser?.unsafeMetadata?.role as string)
  )?.toLowerCase() as "manager" | "tenant" | undefined;

  useEffect(() => {
    if (isClerkLoaded && !authLoading) {
      if (!userRole) {
        setIsRedirecting(false);
      } else if (
        (userRole === "manager" && pathname.startsWith("/tenant")) ||
        (userRole === "tenant" && pathname.startsWith("/manager"))
      ) {
        router.push(
          userRole === "manager"
            ? "/manager"
            : "/tenant/favourites",
          { scroll: false }
        );
      } else {
        setIsRedirecting(false);
      }
    }
  }, [isClerkLoaded, authLoading, userRole, pathname, router]);

  if (!isClerkLoaded || authLoading || isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1acec8] mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
        <p className="text-gray-600 mb-6">We couldn't find your community profile. Please make sure you're registered.</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2 bg-[#1acec8] text-white rounded-xl font-bold hover:bg-[#15b8b3] transition-all"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="w-full min-h-screen bg-white dark:bg-zinc-700 transition-colors duration-300">
        <Navbar />
        <div style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
          <main className="flex w-full">
            <AppSidebar userType={userRole} />
            <div className="flex-1 transition-all duration-300 p-4 md:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;