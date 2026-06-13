import { useEffect, useState } from "react";
import { SaantiLogo } from "@/components/brand/SaantiLogo";
import { cn } from "@/lib/utils";

type SplashScreenProps = {
  onComplete: () => void;
};

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setExiting(true), 1400);
    const doneTimer = window.setTimeout(() => onComplete(), 2100);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div
      role="status"
      aria-label="Loading Saanti"
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-700 ease-out",
        exiting && "pointer-events-none opacity-0",
      )}
    >
      <SaantiLogo
        size="xl"
        className={cn(!exiting && "animate-in fade-in zoom-in-95 duration-700")}
      />
      <p
        className={cn(
          "mt-4 text-xl font-semibold tracking-tight text-foreground",
          !exiting &&
            "animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150",
        )}
      >
        Saanti
      </p>
    </div>
  );
}
