"use client";

import Header from "@/components/Header";
import LoadingState from "@/components/LoadingState";
import { useRouter } from "next/navigation";
import {
    useGetAuthUserQuery,
    useGetCurrentResidencesQuery,
    useCreateCheckoutSessionMutation,
} from "@/state/api";
import {
    Calendar,
    CreditCard,
    Download,
    FileText,
    MapPin,
    User,
    Info,
    CreditCard as CardIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

const Residences = () => {
    const router = useRouter();
    const { data: authUser } = useGetAuthUserQuery("tenant");
    const {
        data: currentResidences,
        isLoading,
        error,
    } = useGetCurrentResidencesQuery(authUser?.clerkId || "", {
        skip: !authUser?.clerkId,
    });

    const [createCheckoutSession] = useCreateCheckoutSessionMutation();

    if (isLoading) return <LoadingState />;
    if (error) return <div className="p-10 text-destructive">Error loading current residences</div>;

    const handlePayment = async (paymentId: number) => {
        try {
            const result = await createCheckoutSession({ paymentId }).unwrap();
            if (result.url) {
                window.location.href = result.url;
            }
        } catch (err) {
            console.error("Failed to create checkout session:", err);
        }
    };

    if (!currentResidences || currentResidences.length === 0) {
        return (
            <div className="dashboard-container">
                <Header
                    title="Current Residences"
                    subtitle="View and manage your current living spaces"
                />
                <div className="flex flex-col items-center justify-center p-20 bg-card rounded-xl border border-dashed text-muted-foreground">
                    <Info className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-xl font-medium">You don&apos;t have any active residences</p>
                    <p className="mt-2 text-sm text-center max-w-md">Once your rental applications are approved and leases are signed, your active homes will appear here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container space-y-10 mb-20">
            <Header
                title="Current Residences"
                subtitle="View and manage your current living spaces"
            />

            {currentResidences.map((property) => {
                const activeLease = property.leases?.[0]; // Backend is already filtering for active lease
                const nextPayment = activeLease?.payments?.find(p => p.paymentStatus === "Pending");

                return (
                    <div key={property.id} className="space-y-8 animate-in fade-in duration-700">
                        {/* 1. Lease Summary Card */}
                        <Card className="overflow-hidden border-none shadow-premium transition-all">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    {/* Image Section */}
                                    <div className="w-full md:w-1/3 h-64 md:h-auto overflow-hidden relative group">
                                        <img
                                            src={property.photoUrls?.[0] || "/api/placeholder/400/300"}
                                            alt={property.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-green-500/90 text-white border-none px-3 py-1 font-semibold backdrop-blur-sm">
                                                Active Lease
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="flex-1 p-8 flex flex-col justify-between space-y-6">
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-bold tracking-tight text-foreground">
                                                {property.name}
                                            </h2>
                                            <div className="flex items-center text-muted-foreground">
                                                <MapPin className="w-4 h-4 mr-2" />
                                                <span>{property.location.city}, {property.location.state}, {property.location.country}</span>
                                            </div>
                                            <div className="mt-4 flex items-baseline">
                                                <span className="text-2xl font-bold text-blue-600">₹{property.pricePerMonth.toLocaleString()}</span>
                                                <span className="text-muted-foreground ml-1">/ month</span>
                                            </div>
                                        </div>

                                        {/* Lease Info Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-y border-border/50">
                                            <div className="space-y-1">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start Date</p>
                                                <div className="flex items-center font-medium">
                                                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                                    {activeLease ? format(new Date(activeLease.startDate), "MM/dd/yyyy") : "N/A"}
                                                </div>
                                            </div>
                                            <div className="space-y-1 sm:border-x border-border/50 sm:px-6">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">End Date</p>
                                                <div className="flex items-center font-medium">
                                                    <Calendar className="w-4 h-4 mr-2 text-red-500" />
                                                    {activeLease ? format(new Date(activeLease.endDate), "MM/dd/yyyy") : "N/A"}
                                                </div>
                                            </div>
                                            <div className="space-y-1 sm:pl-6">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Next Payment</p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center font-medium">
                                                        <CreditCard className="w-4 h-4 mr-2 text-green-500" />
                                                        {nextPayment ? format(new Date(nextPayment.dueDate), "MM/dd/yyyy") : "N/A"}
                                                    </div>
                                                    {nextPayment && (
                                                        <Button
                                                            variant="link"
                                                            className="h-auto p-0 text-blue-600 font-bold text-xs"
                                                            onClick={() => handlePayment(nextPayment.id)}
                                                        >
                                                            Pay Now
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end space-x-4 pt-2">
                                            <Button variant="outline" className="h-11 px-6 font-medium group transition-colors">
                                                <User className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-blue-500" />
                                                Contact Manager
                                            </Button>
                                            <Button
                                                className="h-11 px-6 font-medium bg-foreground text-background hover:bg-foreground/90 transition-all"
                                                onClick={() => router.push(`/tenant/residences/${property.id}/lease`)}
                                            >
                                                <FileText className="w-4 h-4 mr-2" />
                                                Lease Agreement
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* 2. Payment Method Section */}
                            <Card className="border border-border/50 shadow-sm overflow-hidden">
                                <CardHeader className="bg-muted/30 pb-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle className="text-xl">Payment Method</CardTitle>
                                            <CardDescription>Change how you pay for your lease</CardDescription>
                                        </div>
                                        <CardIcon className="w-6 h-6 text-muted-foreground opacity-50" />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between p-5 border border-border/60 rounded-xl bg-background shadow-inner-sm">
                                        <div className="flex items-center space-x-5">
                                            <div className="w-16 h-10 bg-blue-700 rounded-md flex items-center justify-center text-white font-bold tracking-widest text-xs shadow-md">
                                                VISA
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <p className="font-semibold text-foreground">Visa ending in 2024</p>
                                                    <Badge variant="secondary" className="text-[10px] py-0 h-4 bg-muted text-muted-foreground border-none">Default</Badge>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:space-x-4 text-xs text-muted-foreground">
                                                    <span>Expiry: 26/06/2026</span>
                                                    <span className="hidden sm:inline opacity-50">•</span>
                                                    <span>billing@rentora.com</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-9 font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                                            Edit
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 3. Billing History Section */}
                            <Card className="border border-border/50 shadow-sm overflow-hidden">
                                <CardHeader className="bg-muted/30 pb-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle className="text-xl font-bold">Billing History</CardTitle>
                                            <CardDescription>Download your previous receipts</CardDescription>
                                        </div>
                                        <Button variant="outline" size="sm" className="h-9 px-4 font-medium border-border/60 group">
                                            <Download className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-blue-500" />
                                            Download All
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-muted/10">
                                                <TableRow className="hover:bg-transparent border-border/50">
                                                    <TableHead className="font-semibold px-6 py-4 uppercase text-[10px] tracking-wider">Invoice</TableHead>
                                                    <TableHead className="font-semibold px-6 py-4 uppercase text-[10px] tracking-wider text-center">Status</TableHead>
                                                    <TableHead className="font-semibold px-6 py-4 uppercase text-[10px] tracking-wider text-right">Amount</TableHead>
                                                    <TableHead className="font-semibold px-6 py-4 uppercase text-[10px] tracking-wider text-center">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {activeLease?.payments?.slice(0, 3).map((payment) => (
                                                    <TableRow key={payment.id} className="hover:bg-muted/5 transition-colors border-border/50 group">
                                                        <TableCell className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">Invoice #{payment.id}</span>
                                                                <span className="text-xs text-muted-foreground">{format(new Date(payment.dueDate), "MMM yyyy")}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-6 py-4 text-center">
                                                            <Badge className={`
                                                                ${payment.paymentStatus === "Paid" ? "bg-green-100/80 text-green-700 hover:bg-green-100" :
                                                                    payment.paymentStatus === "Pending" ? "bg-yellow-100/80 text-yellow-700 hover:bg-yellow-100" :
                                                                        "bg-red-100/80 text-red-700 hover:bg-red-100"}
                                                                border-none px-2.5 py-0.5 text-[11px] font-bold tracking-tight shadow-sm
                                                            `}>
                                                                {payment.paymentStatus}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="px-6 py-4 text-right font-medium text-foreground">
                                                            ₹{payment.amountPaid.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="px-6 py-4 text-center">
                                                            {payment.paymentStatus === "Pending" ? (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 px-3 text-[10px] font-bold bg-blue-600 text-white hover:bg-blue-700 border-none shadow-sm transition-all"
                                                                    onClick={() => handlePayment(payment.id)}
                                                                >
                                                                    Pay Now
                                                                </Button>
                                                            ) : (
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-accent/10 hover:text-blue-600 transition-colors">
                                                                    <Download className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {(!activeLease?.payments || activeLease.payments.length === 0) && (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center py-10 text-muted-foreground h-40 italic">
                                                            No billing history available yet.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Residences;