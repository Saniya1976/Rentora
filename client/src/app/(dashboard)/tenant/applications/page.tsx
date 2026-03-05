"use client"

import React from 'react'

const ApplicationsPage = () => {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-black bg-gradient-to-r from-[#1acec8] to-[#15b8b3] bg-clip-text text-transparent uppercase tracking-tight">
                Applications
            </h1>
            <p className="text-gray-500 dark:text-zinc-400 text-sm italic">
                Track your rental applications...
            </p>
        </div>
    )
}

export default ApplicationsPage
