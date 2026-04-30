"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCreatePropertyMutation, useUpdatePropertyMutation } from "@/state/api";
import { Property, Location } from "@/types/prismaTypes";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import Image from "next/image";

const propertySchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    pricePerMonth: z.coerce.number().min(0, "Price must be positive"),
    securityDeposit: z.coerce.number().min(0, "Deposit must be positive"),
    applicationFee: z.coerce.number().min(0, "Fee must be positive"),
    beds: z.coerce.number().int("Beds must be a whole number").min(0, "Beds must be at least 0"),
    baths: z.coerce.number().min(0, "Baths must be at least 0"),
    squareFeet: z.coerce.number().min(0, "Square feet must be positive"),
    propertyType: z.enum(["Rooms", "Tinyhouse", "Apartment", "Villa", "Townhouse", "Cottage"]),
    isPetsAllowed: z.boolean().default(false),
    isParkingIncluded: z.boolean().default(false),
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    country: z.string().min(2, "Country is required"),
    postalCode: z.string().min(3, "Postal code is required"),
    amenities: z.string().optional(),
    highlights: z.string().optional(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

interface PropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    property?: Property & { location: Location };
    managerClerkId: string;
}

const PropertyModal = ({ isOpen, onClose, property, managerClerkId }: PropertyModalProps) => {
    const [createProperty, { isLoading: isCreating }] = useCreatePropertyMutation();
    const [updateProperty, { isLoading: isUpdating }] = useUpdatePropertyMutation();
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
    const [existingPhotos, setExistingPhotos] = React.useState<string[]>([]);

    const form = useForm<PropertyFormValues>({
        resolver: zodResolver(propertySchema),
        defaultValues: {
            name: "",
            description: "",
            pricePerMonth: 0,
            securityDeposit: 0,
            applicationFee: 0,
            beds: 1,
            baths: 1,
            squareFeet: 500,
            propertyType: "Apartment",
            isPetsAllowed: false,
            isParkingIncluded: false,
            address: "",
            city: "",
            state: "",
            country: "India",
            postalCode: "",
            amenities: "",
            highlights: "",
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingPhoto = (index: number) => {
        setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        if (isOpen) {
            if (property) {
                form.reset({
                    name: property.name,
                    description: property.description,
                    pricePerMonth: property.pricePerMonth,
                    securityDeposit: property.securityDeposit,
                    applicationFee: property.applicationFee,
                    beds: property.beds,
                    baths: property.baths,
                    squareFeet: property.squareFeet,
                    propertyType: property.propertyType,
                    isPetsAllowed: property.isPetsAllowed,
                    isParkingIncluded: property.isParkingIncluded,
                    address: property.location.address,
                    city: property.location.city,
                    state: property.location.state,
                    country: property.location.country,
                    postalCode: property.location.postalCode,
                    amenities: property.amenities?.join(", ") || "",
                    highlights: property.highlights?.join(", ") || "",
                });
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setExistingPhotos(property.photoUrls || []);
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setSelectedFiles([]);
            } else {
                form.reset({
                    name: "",
                    description: "",
                    pricePerMonth: 0,
                    securityDeposit: 0,
                    applicationFee: 0,
                    beds: 1,
                    baths: 1,
                    squareFeet: 500,
                    propertyType: "Apartment",
                    isPetsAllowed: false,
                    isParkingIncluded: false,
                    address: "",
                    city: "",
                    state: "UP",
                    country: "India",
                    postalCode: "",
                    amenities: "",
                    highlights: "",
                });
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setExistingPhotos([]);
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setSelectedFiles([]);
            }
        }
    }, [property, form, isOpen]);

    // Clean up object URLs to prevent memory leaks
    useEffect(() => {
        const urls = selectedFiles.map(file => URL.createObjectURL(file));
        return () => urls.forEach(url => URL.revokeObjectURL(url));
    }, [selectedFiles]);

    const onSubmit = async (values: PropertyFormValues) => {
        try {
            const formData = new FormData();

            // Append all values
            Object.entries(values).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value.toString());
                }
            });

            // Handle images
            selectedFiles.forEach((file) => {
                formData.append("images", file);
            });

            // For existing properties, we might need to send the current photos that were kept
            if (property) {
                formData.append("existingPhotoUrls", JSON.stringify(existingPhotos));
            }

            formData.append("managerClerkId", managerClerkId);

            if (property) {
                await updateProperty({ id: property.id, formData }).unwrap();
                toast.success("Property updated successfully!");
            } else {
                await createProperty(formData).unwrap();
                toast.success("Property created successfully!");
            }
            onClose();
        } catch (error: unknown) {
            console.error("Failed to save property:", error);
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message || "Failed to save property. Please try again.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl bg-white dark:bg-zinc-800 p-0">
                <DialogHeader className="p-8 pb-0">
                    <DialogTitle className="text-3xl font-black uppercase text-foreground">
                        {property ? "Edit" : "Add New"} <span className="text-[#1acec8]">Property</span>
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 pt-6 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* Basic Info */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Basic Information</h3>

                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Property Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Modern Villa" className="rounded-xl border-border bg-muted/20" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Describe the property..." className="rounded-xl border-border bg-muted/20 min-h-[120px]" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="propertyType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-bold">Property Type</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="rounded-xl border-border bg-muted/20">
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-xl">
                                                        {["Rooms", "Tinyhouse", "Apartment", "Villa", "Townhouse", "Cottage"].map((type) => (
                                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="amenities"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Amenities (comma-separated)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. WiFi, Pool, Gym" className="rounded-xl border-border bg-muted/20" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="highlights"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Highlights (comma-separated)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Near Metro, Pet friendly" className="rounded-xl border-border bg-muted/20" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Pricing & Details */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Pricing & Details</h3>

                                {/* Rent - full width single line */}
                                <FormField
                                    control={form.control}
                                    name="pricePerMonth"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-xs uppercase">Rent (₹)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="500" className="rounded-xl border-border bg-muted/20 font-bold text-[#1acec8] text-lg h-12" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Deposit - full width single line */}
                                <FormField
                                    control={form.control}
                                    name="securityDeposit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-xs uppercase">Security Deposit (₹)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="500" className="rounded-xl border-border bg-muted/20 text-lg h-12" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Beds & Baths on one line */}
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="beds"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-bold text-xs uppercase">Beds</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="1" className="rounded-xl border-border bg-muted/20" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="baths"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-bold text-xs uppercase">Baths</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.5" className="rounded-xl border-border bg-muted/20" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Sq Feet & App Fee on one line */}
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="squareFeet"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-bold text-xs uppercase">Sq Feet</FormLabel>
                                                <FormControl>
                                                    <Input type="number" className="rounded-xl border-border bg-muted/20" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="applicationFee"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-bold text-xs uppercase">App Fee (₹)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="500" className="rounded-xl border-border bg-muted/20" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border">
                                        <div className="space-y-0.5">
                                            <Label className="font-bold">Pets Allowed</Label>
                                            <p className="text-xs text-muted-foreground">Are pets permitted in this property?</p>
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="isPetsAllowed"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border">
                                        <div className="space-y-0.5">
                                            <Label className="font-bold">Parking Included</Label>
                                            <p className="text-xs text-muted-foreground">Is dedicated parking available?</p>
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="isParkingIncluded"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Photo Upload */}
                        <div className="space-y-6 pt-4">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Property Photos</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {/* Existing Photos */}
                                    {existingPhotos.map((url, index) => (
                                        <div key={`existing-${index}`} className="relative aspect-square rounded-xl overflow-hidden group border border-border">
                                            <Image
                                                src={url}
                                                alt={`existing ${index}`}
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingPhoto(index)}
                                                    className="p-2 bg-destructive text-white rounded-full hover:scale-110 transition-transform"
                                                    title="Remove existing photo"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded uppercase font-bold">Current</div>
                                        </div>
                                    ))}

                                    {/* New Photos */}
                                    {selectedFiles.map((file, index) => {
                                        const previewUrl = URL.createObjectURL(file);
                                        return (
                                            <div key={`new-${index}`} className="relative aspect-square rounded-xl overflow-hidden group border-2 border-[#1acec8]">
                                                <Image
                                                    src={previewUrl}
                                                    alt={`preview ${index}`}
                                                    fill
                                                    className="object-cover"
                                                    onLoad={() => URL.revokeObjectURL(previewUrl)}
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="p-2 bg-destructive text-white rounded-full hover:scale-110 transition-transform"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="absolute bottom-1 left-1 bg-[#1acec8] text-white text-[8px] px-1.5 py-0.5 rounded uppercase font-bold">New</div>
                                            </div>
                                        );
                                    })}

                                    <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted/20 transition-colors group">
                                        <div className="p-3 bg-muted rounded-full mb-2 group-hover:bg-[#1acec8]/10 group-hover:text-[#1acec8] transition-colors">
                                            <Upload className="w-6 h-6 text-muted-foreground group-hover:text-[#1acec8]" />
                                        </div>
                                        <span className="text-xs font-bold text-muted-foreground italic">Add Photos</span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>
                                <p className="text-xs text-muted-foreground italic">Tip: You can select multiple images to upload at once.</p>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-6 pt-4">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Location</h3>

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">Street Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 123 Main St" className="rounded-xl border-border bg-muted/20" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">City</FormLabel>
                                            <FormControl>
                                                <Input className="rounded-xl border-border bg-muted/20" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="state"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">State</FormLabel>
                                            <FormControl>
                                                <Input className="rounded-xl border-border bg-muted/20" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="postalCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Zip Code</FormLabel>
                                            <FormControl>
                                                <Input className="rounded-xl border-border bg-muted/20" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Country</FormLabel>
                                            <FormControl>
                                                <Input className="rounded-xl border-border bg-muted/20" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-8 pb-4">
                            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold uppercase tracking-wider px-8 h-12 hover:bg-muted/50 transition-colors">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isCreating || isUpdating}
                                className="bg-[#1acec8] hover:bg-[#14b2ad] text-white font-black uppercase tracking-widest px-10 h-12 rounded-xl shadow-[0_4px_15px_rgba(26,206,200,0.3)] transition-all active:scale-[0.98] flex items-center gap-2"
                            >
                                {isCreating || isUpdating ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span>SAVING...</span>
                                    </>
                                ) : (
                                    <>{property ? "Update Property" : "Save Property"}</>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default PropertyModal;
