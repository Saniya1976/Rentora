"use client"

import { usePathname } from 'next/navigation';
import { Sidebar, SidebarHeader, SidebarMenu, useSidebar, SidebarMenuItem, SidebarContent, SidebarMenuButton } from './ui/sidebar';
import { Building, FileText, Heart, House, LogOut, Menu, X, LayoutDashboard, Settings } from 'lucide-react';
import { NAVBAR_HEIGHT } from '@/lib/constants';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
    userType: "manager" | "tenant";
}

const AppSidebar = ({ userType }: AppSidebarProps) => {
    const pathname = usePathname();
    const { toggleSidebar, open } = useSidebar();
    const navlinks =
        userType === "manager" ? [
            { icon: LayoutDashboard, label: "Dashboard", href: "/manager" },
            { icon: Building, label: "Properties", href: "/manager/properties" },
            { icon: FileText, label: "Applications", href: "/manager/applications" },
            { icon: Settings, label: "Settings", href: "/manager/settings" },
            { icon: LogOut, label: "Logout", href: "/manager/logout" }
        ] : [
            { icon: House, label: "Residences", href: "/tenant/residences" },
            { icon: FileText, label: "Applications", href: "/tenant/applications" },
            { icon: Heart, label: "Favourites", href: "/tenant/favourites" },
            { icon: Settings, label: "Settings", href: "/tenant/settings" }
        ]


    return (
        <Sidebar
            collapsible="icon"
            className='bg-white dark:bg-zinc-700 shadow-lg border-r border-gray-100 dark:border-white/10 transition-colors duration-300'
            style={{
                top: `${NAVBAR_HEIGHT}px`,
                height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
            }}
        >
            <SidebarContent className='p-4'>
                <SidebarMenu className='gap-2'>
                    <SidebarMenuItem>
                        <div
                            className={cn(
                                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-bold",
                                open ? "justify-between px-6" : "justify-center"
                            )}>
                            {open ? (
                                <>
                                    <h1 className="text-xl font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                        {userType === "manager" ? "Manager view" : "Renter view"}
                                    </h1>
                                    <button
                                        className="text-gray-600 dark:text-gray-300 hover:text-[#1acec8] hover:bg-[#1acec8]/10 transition-all p-3 rounded-lg"
                                        onClick={() => toggleSidebar()}
                                    >
                                        <X className="w-8 h-8 shrink-0" />
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="text-gray-600 dark:text-gray-300 hover:text-[#1acec8] hover:bg-[#1acec8]/10 transition-all p-3 rounded-lg"
                                    onClick={() => toggleSidebar()}
                                >
                                    <Menu className="w-8 h-8 shrink-0" />
                                </button>
                            )}
                        </div>
                    </SidebarMenuItem>

                    <div className="mt-1 flex flex-col gap-2">
                        {navlinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <SidebarMenuItem key={link.label}>
                                    <Link href={link.href} passHref>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            className={cn(
                                                "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-bold",
                                                isActive
                                                    ? "bg-[#1acec8] text-white shadow-[0_4px_10px_rgba(26,206,200,0.2)]"
                                                    : "text-gray-600 dark:text-gray-300 hover:text-[#1acec8] hover:bg-[#1acec8]/5"
                                            )}
                                            tooltip={link.label}
                                        >
                                            <div className={cn("flex items-center", open ? "gap-4" : "justify-center w-full")}>
                                                <link.icon className={cn("w-7 h-7 shrink-0", isActive ? "text-white" : "text-gray-500")} />
                                                {open && <span className="capitalize text-base">{link.label}</span>}
                                            </div>
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            );
                        })}
                    </div>
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    )
}

export default AppSidebar