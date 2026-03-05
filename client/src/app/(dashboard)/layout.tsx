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

  const { data: authUser, isLoading: authLoading } =
    useGetAuthUserQuery(undefined, {
      skip: !isClerkLoaded || !clerkUser,
    });

  const pathname = usePathname();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  const userRole = authUser?.userRole?.toLowerCase() as
    | "manager"
    | "tenant"
    | undefined;

  useEffect(() => {
    if (isClerkLoaded && !authLoading && userRole) {
      if (
        (userRole === "manager" && pathname.startsWith("/tenants")) ||
        (userRole === "tenant" && pathname.startsWith("/managers"))
      ) {
        router.push(
          userRole === "manager"
            ? "/managers/properties"
            : "/tenants/favorites",
          { scroll: false }
        );
      } else {
        setIsRedirecting(false);
      }
    }
  }, [isClerkLoaded, authLoading, userRole, pathname, router]);

  if (!isClerkLoaded || authLoading || isRedirecting) {
    return <>Loading...</>;
  }

  if (!userRole) return null;

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