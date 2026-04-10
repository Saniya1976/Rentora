"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

const PaymentSuccess = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");

    return (
        <div className="dashboard-container flex flex-col items-center justify-center min-h-[70vh] space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-bounce">
                <CheckCircle className="w-12 h-12" />
            </div>
            <Header
                title="Payment Successful!"
                subtitle={sessionId ? `Transcation ID: ${sessionId.slice(0, 20)}...` : "Your payment has been processed successfully."}
            />
            <div className="max-w-md text-center text-muted-foreground">
                Thank you for your payment. Your lease information has been updated. You can now view your updated billing history in the residences dashboard.
            </div>
            <div className="flex space-x-4">
                <Button onClick={() => router.push("/tenant/residences")}>
                    Back to Residences
                </Button>
            </div>
        </div>
    );
};

export default PaymentSuccess;
