"use client";

import React, { useState, useEffect } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
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

// ── Validators ────────────────────────────────────────────────────────────────
function validateName(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return "Name is required.";
    if (trimmed.length < 2) return "Name must be at least 2 characters.";
    if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) return "Name can only contain letters, spaces, hyphens, or apostrophes.";
    return "";
}

function validateEmail(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Enter a valid email address.";
    return "";
}

function validatePhone(value: string): string {
    // Strip spaces, dashes, parentheses before counting digits
    const digits = value.replace(/[\s\-().+]/g, "");
    if (!digits) return "Phone number is required.";
    if (!/^\d+$/.test(digits)) return "Phone number must contain only digits.";
    if (digits.length !== 10) return `Phone number must be exactly 10 digits (currently ${digits.length}).`;
    return "";
}

// ── Field Error Component ─────────────────────────────────────────────────────
function FieldError({ message }: { message: string }) {
    if (!message) return null;
    return (
        <p className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-rose-500 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle size={12} className="shrink-0" />
            {message}
        </p>
    );
}

function FieldSuccess() {
    return (
        <CheckCircle2
            size={16}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in duration-200"
        />
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
const SettingsForm = ({ initialData, onSubmit, isLoading }: SettingsFormProps) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        email: initialData?.email || "",
        phoneNumber: initialData?.phoneNumber || "",
    });

    // Track which fields the user has interacted with (show errors only after blur)
    const [touched, setTouched] = useState({ name: false, email: false, phoneNumber: false });

    const errors = {
        name: validateName(formData.name),
        email: validateEmail(formData.email),
        phoneNumber: validatePhone(formData.phoneNumber),
    };

    const hasErrors = Object.values(errors).some(Boolean);

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

        // For phone: only allow digits, spaces, dashes, parens, +
        if (name === "phoneNumber") {
            const sanitised = value.replace(/[^\d\s\-().+]/g, "");
            setFormData((prev) => ({ ...prev, [name]: sanitised }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setTouched((prev) => ({ ...prev, [e.target.name]: true }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Touch all fields so all errors become visible
        setTouched({ name: true, email: true, phoneNumber: true });
        if (hasErrors) return;
        await onSubmit(formData);
    };

    // Helper: border colour based on field state
    const fieldClass = (field: keyof typeof errors) => {
        const isError = touched[field] && errors[field];
        const isOk = touched[field] && !errors[field] && formData[field].trim();
        return cn(
            "h-12 bg-gray-50/50 dark:bg-zinc-900/50 rounded-xl text-base pr-10 transition-all duration-300",
            "border focus:ring-4",
            isError
                ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/10"
                : isOk
                    ? "border-emerald-400 focus:border-emerald-400 focus:ring-emerald-400/10"
                    : "border-gray-200 dark:border-white/10 focus:border-[#1acec8] focus:ring-[#1acec8]/10"
        );
    };

    return (
        <Card className="max-w-xl border border-gray-100 dark:border-white/5 shadow-2xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-zinc-800/80 backdrop-blur-xl rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-cyan-500/5">
            <form onSubmit={handleSubmit} noValidate>
                <CardContent className="space-y-5 p-6 md:p-8">

                    {/* ── Name ── */}
                    <div className="space-y-1 group animate-in fade-in slide-in-from-left-4 duration-500 delay-75">
                        <Label
                            htmlFor="name"
                            className={cn(
                                "text-sm font-bold ml-1 transition-colors",
                                touched.name && errors.name
                                    ? "text-rose-500"
                                    : "text-gray-700 dark:text-gray-200 group-focus-within:text-[#1acec8]"
                            )}
                        >
                            Full Name
                        </Label>
                        <div className="relative">
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Enter your full name"
                                className={fieldClass("name")}
                                autoComplete="name"
                            />
                            {touched.name && !errors.name && formData.name.trim() && <FieldSuccess />}
                        </div>
                        {touched.name && <FieldError message={errors.name} />}
                    </div>

                    {/* ── Email ── */}
                    <div className="space-y-1 group animate-in fade-in slide-in-from-left-4 duration-500 delay-150">
                        <Label
                            htmlFor="email"
                            className={cn(
                                "text-sm font-bold ml-1 transition-colors",
                                touched.email && errors.email
                                    ? "text-rose-500"
                                    : "text-gray-700 dark:text-gray-200 group-focus-within:text-[#1acec8]"
                            )}
                        >
                            Email Address
                        </Label>
                        <div className="relative">
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="name@example.com"
                                className={fieldClass("email")}
                                autoComplete="email"
                            />
                            {touched.email && !errors.email && formData.email.trim() && <FieldSuccess />}
                        </div>
                        {touched.email && <FieldError message={errors.email} />}
                    </div>

                    {/* ── Phone ── */}
                    <div className="space-y-1 group animate-in fade-in slide-in-from-left-4 duration-500 delay-225">
                        <Label
                            htmlFor="phoneNumber"
                            className={cn(
                                "text-sm font-bold ml-1 transition-colors",
                                touched.phoneNumber && errors.phoneNumber
                                    ? "text-rose-500"
                                    : "text-gray-700 dark:text-gray-200 group-focus-within:text-[#1acec8]"
                            )}
                        >
                            Phone Number
                            <span className="ml-1.5 text-[10px] font-medium text-gray-400">(10 digits)</span>
                        </Label>
                        <div className="relative">
                            <Input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                inputMode="numeric"
                                maxLength={15}
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="9876543210"
                                className={fieldClass("phoneNumber")}
                                autoComplete="tel"
                            />
                            {touched.phoneNumber && !errors.phoneNumber && formData.phoneNumber.trim() && <FieldSuccess />}
                        </div>
                        {touched.phoneNumber && <FieldError message={errors.phoneNumber} />}
                        {/* Live digit counter */}
                        {formData.phoneNumber && (
                            <p className={cn(
                                "text-[11px] font-medium ml-1 tabular-nums transition-colors",
                                formData.phoneNumber.replace(/[\s\-().+]/g, "").length === 10
                                    ? "text-emerald-500"
                                    : "text-gray-400"
                            )}>
                                {formData.phoneNumber.replace(/[\s\-().+]/g, "").length} / 10 digits
                            </p>
                        )}
                    </div>

                </CardContent>

                <CardFooter className="p-6 md:px-8 md:pb-8 pt-0 flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={isLoading}
                        onClick={() => {
                            setFormData({
                                name: initialData?.name || "",
                                email: initialData?.email || "",
                                phoneNumber: initialData?.phoneNumber || "",
                            });
                            setTouched({ name: false, email: false, phoneNumber: false });
                        }}
                        className="flex-1 h-12 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white font-bold text-base transition-all duration-300 active:scale-95"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-2 h-12 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-base transition-all duration-300 hover:shadow-lg hover:shadow-gray-400/20 dark:hover:shadow-white/10 active:scale-95 disabled:opacity-70 group"
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
