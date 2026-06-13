import logo from "@/assets/logo.jpg";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { className: "h-7 w-7", width: 28, height: 28 },
  md: { className: "h-9 w-9", width: 36, height: 36 },
  lg: { className: "h-10 w-10", width: 40, height: 40 },
  xl: { className: "h-24 w-24", width: 96, height: 96 },
} as const;

type SaantiLogoProps = {
  size?: keyof typeof SIZES;
  alt?: string;
  className?: string;
  blended?: boolean;
};

export function SaantiLogo({
  size = "md",
  alt = "Saanti logo",
  className,
  blended = true,
}: SaantiLogoProps) {
  const dimensions = SIZES[size];

  return (
    <img
      src={logo}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
      className={cn(
        dimensions.className,
        blended && "mix-blend-multiply dark:mix-blend-screen",
        className,
      )}
    />
  );
}
