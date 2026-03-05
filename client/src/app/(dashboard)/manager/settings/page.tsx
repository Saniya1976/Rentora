"use client"

import React from 'react'
import SettingsForm from '@/components/SettingsForm'
import { useGetAuthUserQuery, useUpdateManagerSettingsMutation } from '@/state/api'
import { toast } from 'sonner'

const SettingsPage = () => {
    const { data: authUser, isLoading: isUserLoading } = useGetAuthUserQuery();
    const [updateManager, { isLoading: isUpdating }] = useUpdateManagerSettingsMutation();

    const userInfo = authUser?.userInfo;
    const cognitoId = authUser?.cognitoInfo?.id;

    const initialData = {
        name: userInfo && 'name' in userInfo ? userInfo.name : "",
        email: userInfo && 'email' in userInfo ? userInfo.email : "",
        phoneNumber: userInfo && 'phoneNumber' in userInfo ? userInfo.phoneNumber : "",
    };

    const handleSubmit = async (data: { name: string; email: string; phoneNumber: string }) => {
        if (!cognitoId) return;

        try {
            await updateManager({
                cognitoId,
                ...data
            }).unwrap();
            toast.success("Settings updated successfully!");
        } catch (error) {
            console.error("Failed to update settings:", error);
            toast.error("Failed to update settings. Please try again.");
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto py-8">
            <div className="space-y-1">
                <h1 className="text-4xl font-black bg-gradient-to-r from-[#1acec8] to-[#15b8b3] bg-clip-text text-transparent uppercase tracking-tight">
                    Manager Settings
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                    Update your business profile and contact information
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
