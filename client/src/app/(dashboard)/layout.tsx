import React from 'react'
import Navbar from '@/components/Navbar'
const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
        <Navbar/>
        <main className={'h-full w-full flex-col flex pt-[${NAVBAR_HEIGHT}px]'}>
         {children}
         </main>
    </div>
  )
}

export default layout