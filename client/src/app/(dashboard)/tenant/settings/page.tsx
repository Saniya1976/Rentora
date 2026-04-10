"use client"

import React from 'react'
import SettingsForm from '@/components/SettingsForm'
import { useGetAuthUserQuery, useUpdateTenantSettingsMutation } from '@/state/api'
import { toast } from 'sonner'

const SettingsPage = () => {
    const { data: authUser, isLoading: isUserLoading } = useGetAuthUserQuery();
    const [updateTenant, { isLoading: isUpdating }] = useUpdateTenantSettingsMutation();

    const clerkId = authUser?.clerkId;
    const initialData = {
        name: authUser?.name || "",
        email: authUser?.email || "",
        phoneNumber: authUser?.phoneNumber || "",
    };

    const handleSubmit = async (data: { name: string; email: string; phoneNumber: string }) => {
        if (!clerkId) return;

        try {
            await updateTenant({
                clerkId,
                ...data
            }).unwrap();
            toast.success("Settings updated successfully!");
        } catch (error) {
            console.error("Failed to update settings:", error);
            toast.error("Failed to update settings. Please try again.");
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-2xl py-6 px-2">
            <div className="space-y-1 animate-in fade-in slide-in-from-top-4 duration-700">
                <h1 className="text-5xl font-black bg-linear-to-r from-[#07c2c5] to-[#04a7aa] bg-clip-text text-transparent uppercase tracking-tight leading-[1.1]">
                    Tenant <span className="text-foreground/90 font-black">Settings</span>
                </h1>
                <p className="text-muted-foreground text-lg font-medium italic pl-1">
                    Manage your account preferences and personal info.
                </p>
            </div>

            <div className="mt-4">
                {isUserLoading ? (
                    <div className="flex items-center justify-center p-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1acec8]"></div>
                    </div>
                ) : (
                    <SettingsForm
                        initialData={initialData}
                        onSubmit={handleSubmit}
                        isLoading={isUpdating}
                    />
                )}
            </div>
        </div>
    )
}

export default SettingsPage
