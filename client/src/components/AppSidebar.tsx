import { usePathname } from 'next/navigation';
import React from 'react'
import { Sidebar, SidebarHeader, SidebarMenu, useSidebar, SidebarMenuItem, SidebarContent, SidebarMenuButton } from './ui/sidebar';
import { Building, FileText, Heart, House, LogOut, Menu, X } from 'lucide-react';
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
            { icon: Building, label: "Properties", href: "/manager/properties" },
            { icon: FileText, label: "Applications", href: "/manager/applications" },
            { icon: FileText, label: "settings", href: "/manager/settings" },
            { icon: LogOut, label: "logout", href: "/manager/logout" }
        ] : [
            { icon: FileText, label: "Properties", href: "/tenant/properties" },
            { icon: FileText, label: "settings", href: "/tenant/settings" },
            { icon: Heart, label: "favorites", href: "/tenant/favorites" },
            { icon: House, label: "Residences", href: "/tenant/residences" }
        ]


    return (
        <Sidebar
            collapsible="icon"
            className='fixed left-0 bg-white dark:bg-neutral-900 shadow-lg border-r border-gray-100 dark:border-white/10 transition-colors duration-300'
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
                                open? "justify-between px-6":"justify-center"
                            )}>
                                {open?(
                                 <>

                                 <h1 className="text-lg font-bold text-gray-600 dark:text-gray-300">
                                    {userType === "manager" ? "Manager view" : "Renter view"}
                                 </h1>
                                 <button
                                    className="text-gray-600 dark:text-gray-300 hover:text-[#1acec8] hover:bg-[#1acec8]/10 transition-all"
                                    onClick={() => toggleSidebar()}
                                 >
                                <X className="w-5 h-5 text-gray-700" />

                                 </button>
                                 </>
                                ):(
                                   <button
                                    className="text-gray-600 dark:text-gray-300 hover:text-[#1acec8] hover:bg-[#1acec8]/10 transition-all"
                                    onClick={() => toggleSidebar()}
                                 >
                                <Menu className="w-5 h-5 text-gray-700" />

                                 </button>
                                )}
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    )
}

export default AppSidebar