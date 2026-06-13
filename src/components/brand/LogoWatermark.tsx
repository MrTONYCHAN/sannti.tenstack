import logo from "@/assets/logo.jpg";
import { cn } from "@/lib/utils";

const SIZES = {
  hero: "w-[min(92vw,42rem)]",
  panel: "w-[min(80vw,28rem)]",
  sidebar: "w-[min(90%,12rem)]",
} as const;

type LogoWatermarkProps = {
  size?: keyof typeof SIZES;
  className?: string;
};

export function LogoWatermark({
  size = "panel",
  className,
}: LogoWatermarkProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center",
        className,
      )}
    >
      <img
        src={logo}
        alt=""
        width={480}
        height={480}
        className={cn(
          "max-w-none opacity-[0.08] mix-blend-multiply dark:opacity-[0.05] dark:mix-blend-screen",
          SIZES[size],
        )}
      />
    </div>
  );
}
