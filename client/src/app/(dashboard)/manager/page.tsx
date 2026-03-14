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
        <div className="flex flex-col gap-6 max-w-2xl py-6 px-2">
            <div className="space-y-1 animate-in fade-in slide-in-from-top-4 duration-700">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                    Manager Settings
                </h1>
                <p className="text-gray-500 dark:text-zinc-400 text-sm md:text-base font-medium max-w-xl">
                    Manage your account preferences and personal information
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
