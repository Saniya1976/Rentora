import { Button } from "@/components/ui/button";
import { useGetAuthUserQuery } from "@/state/api";
import { Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import React from "react";

const ContactWidget = ({ onOpenModal }: ContactWidgetProps) => {
  const { user: clerkUser } = useUser();
  const clerkRoleHint = (
    (clerkUser?.publicMetadata?.userType as string) ||
    (clerkUser?.unsafeMetadata?.role as string)
  )?.toLowerCase();

  const { data: authUser } = useGetAuthUserQuery(clerkRoleHint);
  const router = useRouter();

  const handleButtonClick = () => {
    if (authUser) {
      onOpenModal();
    } else {
      router.push("/signin");
    }
  };

  return (
    <div className="bg-card text-card-foreground border border-border rounded-2xl p-7 h-fit min-w-[300px] shadow-sm transition-colors duration-300">
      {/* Contact Property */}
      <div className="flex items-center gap-5 mb-4 border border-border p-4 rounded-xl">
        <div className="flex items-center p-4 bg-primary rounded-full shadow-md">
          <Phone className="text-primary-foreground" size={15} />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Contact Property</p>
          <div className="text-lg font-bold">
            (424) 340-5574
          </div>
        </div>
      </div>
      <Button
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-6 rounded-xl transition-all shadow-md active:scale-95"
        onClick={handleButtonClick}
      >
        {authUser ? "Submit Application" : "Sign In to Apply"}
      </Button>

      <hr className="my-4 border-border" />
      <div className="text-sm text-muted-foreground space-y-2">
        <div className="flex justify-between">
          <span>Language:</span>
          <span className="font-semibold text-foreground">English, Hindi</span>
        </div>
        <div className="flex justify-between">
          <span>Hours:</span>
          <span className="font-semibold text-foreground italic">Mon - Sun (9am - 6pm)</span>
        </div>
      </div>
    </div>
  );
};

export default ContactWidget;