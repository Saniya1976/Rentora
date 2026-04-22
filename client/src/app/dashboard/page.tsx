"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function DashboardRedirectPage() {
    const { isLoaded, user } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isLoaded) return;

        if (!user) {
            router.replace("/signin");
            return;
        }

        // Always delegate role detection to /auth-redirect, which queries the
        // backend. Reading publicMetadata?.userType here can be stale or missing
        // (e.g. right after sign-up before Clerk propagates the metadata).
        router.replace("/auth-redirect");
    }, [isLoaded, user, router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-zinc-900">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-[#1acec8] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    Redirecting to your dashboard…
                </p>
            </div>
        </div>
    );
}
