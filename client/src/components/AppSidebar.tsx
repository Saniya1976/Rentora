import { usePathname } from 'next/navigation';
import React from 'react'
import { useSidebar } from './ui/sidebar';
import { Building, FileText } from 'lucide-react';

const AppSidebar = ({userType}:AppSidebarProps) => {
  const pathname = usePathname();
  const {toggleSidebar,open } = useSidebar();
  const navlinks=
  userType==="manager"?[
    { icon:Building,label:"Properties",href:"/manager/properties"}
  ]:[
    { icon:FileText,label:"Properties",href:"/tenant/properties"}
  ]
    
  
    return (
    <div>AppSidebar</div>
  )
}

export default AppSidebar