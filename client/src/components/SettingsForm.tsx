"use client";

import React, { useState, useEffect } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Phone, Mail, User, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsFormProps {
    initialData?: {
        name?: string;
        email?: string;
        phoneNumber?: string;
    };
    onSubmit: (data: { name: string; email: string; phoneNumber: string }) => Promise<void>;
    isLoading?: boolean;
}

const SettingsForm = ({ initialData, onSubmit, isLoading }: SettingsFormProps) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        email: initialData?.email || "",
        phoneNumber: initialData?.phoneNumber || "",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                email: initialData.email || "",
                phoneNumber: initialData.phoneNumber || "",
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <Card className="max-w-xl border border-gray-100 dark:border-white/5 shadow-2xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-zinc-800/80 backdrop-blur-xl rounded-[1.5rem] overflow-hidden transition-all duration-500 hover:shadow-cyan-500/5">
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 p-6 md:p-8">
                    {/* Name Field */}
                    <div className="space-y-2 group animate-in fade-in slide-in-from-left-4 duration-500 delay-75">
                        <Label htmlFor="name" className="text-sm font-bold text-gray-700 dark:text-gray-200 ml-1 transition-colors group-focus-within:text-[#1acec8]">
                            Name
                        </Label>
                        <div className="relative">
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className="h-12 bg-gray-50/50 dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 rounded-xl focus:border-[#1acec8] focus:ring-4 focus:ring-[#1acec8]/10 text-base transition-all duration-300"
                                required
                            />
                        </div>
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2 group animate-in fade-in slide-in-from-left-4 duration-500 delay-150">
                        <Label htmlFor="email" className="text-sm font-bold text-gray-700 dark:text-gray-200 ml-1 transition-colors group-focus-within:text-[#1acec8]">
                            Email
                        </Label>
                        <div className="relative">
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                                className="h-12 bg-gray-50/50 dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 rounded-xl focus:border-[#1acec8] focus:ring-4 focus:ring-[#1acec8]/10 text-base transition-all duration-300"
                                required
                            />
                        </div>
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-2 group animate-in fade-in slide-in-from-left-4 duration-500 delay-225">
                        <Label htmlFor="phoneNumber" className="text-sm font-bold text-gray-700 dark:text-gray-200 ml-1 transition-colors group-focus-within:text-[#1acec8]">
                            Phone Number
                        </Label>
                        <div className="relative">
                            <Input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                                className="h-12 bg-gray-50/50 dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 rounded-xl focus:border-[#1acec8] focus:ring-4 focus:ring-[#1acec8]/10 text-base transition-all duration-300"
                                required
                            />
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="p-6 md:px-8 md:pb-8 pt-0 flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={isLoading}
                        className="flex-1 h-12 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white font-bold text-base transition-all duration-300 active:scale-95"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-[2] h-12 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-base transition-all duration-300 hover:shadow-lg hover:shadow-gray-400/20 dark:hover:shadow-white/10 active:scale-95 disabled:opacity-70 group"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default SettingsForm;
