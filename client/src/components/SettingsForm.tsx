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
        <Card className="max-w-2xl border-none shadow-xl bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm">
            <CardHeader className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-[#1acec8]/10 text-[#1acec8]">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Profile Settings</CardTitle>
                </div>
                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                    Manage your account information and how we contact you.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 pt-2">
                    {/* Name Field */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">
                            Full Name
                        </Label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-[#1acec8]">
                                <User className="w-4 h-4 text-zinc-400" />
                            </div>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="pl-10 h-12 bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/10 rounded-xl focus:ring-[#1acec8] focus:border-[#1acec8] transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">
                            Email Address
                        </Label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-[#1acec8]">
                                <Mail className="w-4 h-4 text-zinc-400" />
                            </div>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@example.com"
                                className="pl-10 h-12 bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/10 rounded-xl focus:ring-[#1acec8] focus:border-[#1acec8] transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">
                            Phone Number
                        </Label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-[#1acec8]">
                                <Phone className="w-4 h-4 text-zinc-400" />
                            </div>
                            <Input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="+1 (555) 000-0000"
                                className="pl-10 h-12 bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/10 rounded-xl focus:ring-[#1acec8] focus:border-[#1acec8] transition-all"
                                required
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="pt-2 pb-6 border-zinc-100 dark:border-white/5 flex gap-3">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 h-12 rounded-xl bg-[#1acec8] hover:bg-[#15b8b3] text-white font-bold transition-all shadow-[0_4px_10px_rgba(26,206,200,0.2)] hover:shadow-[0_6px_15px_rgba(26,206,200,0.3)] disabled:opacity-70"
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
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={isLoading}
                        className="h-12 px-6 rounded-xl text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 font-bold transition-all"
                    >
                        Cancel
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default SettingsForm;
