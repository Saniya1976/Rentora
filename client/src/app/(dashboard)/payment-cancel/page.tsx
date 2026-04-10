"use client";

import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

const PaymentCancel = () => {
    const router = useRouter();

    return (
        <div className="dashboard-container flex flex-col items-center justify-center min-h-[70vh] space-y-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <XCircle className="w-12 h-12" />
            </div>
            <Header
                title="Payment Cancelled"
                subtitle="Your transaction was not completed."
            />
            <div className="max-w-md text-center text-muted-foreground">
                It looks like you cancelled the payment process. No charges were made to your account. You can try paying again from your Residences dashboard when you are ready.
            </div>
            <div className="flex space-x-4">
                <Button variant="outline" onClick={() => router.push("/tenant/residences")}>
                    Back to Residences
                </Button>
            </div>
        </div>
    );
};

export default PaymentCancel;
