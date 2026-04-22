"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useUser } from "@clerk/nextjs";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { useGetAuthUserQuery } from "@/state/api";
import { usePathname, useRouter } from "next/navigation";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded: isClerkLoaded, user: clerkUser } = useUser();

  const clerkRoleHint = (
    (clerkUser?.publicMetadata?.userType as string) ||
    (clerkUser?.unsafeMetadata?.role as string)
  )?.toLowerCase();

  const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery(clerkRoleHint, {
    skip: !isClerkLoaded,
  });
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    if (authLoading || !isClerkLoaded) return;

    if (pathname === "/" || pathname.startsWith("/search")) {
      setIsRedirecting(false);
      return;
    }

    if (authUser?.userRole) {
      const role = authUser.userRole.toLowerCase();

      if (role === "manager") {
        router.push("/manager", { scroll: false });
      } else if (role === "tenant") {
        router.push("/tenant/favourites", { scroll: false });
      } else {
        setIsRedirecting(false);
      }
    } else {
      setIsRedirecting(false);
    }
  }, [authUser, authLoading, router, pathname]);

  if (!isClerkLoaded || authLoading || isRedirecting) return <>Loading...</>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-700 transition-colors duration-300">
      <Navbar />
      <main
        className="grow w-full"
        style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;