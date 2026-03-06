import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "icon";
  className?: string;
}

export function Logo({ variant = "full", className }: LogoProps) {
  if (variant === "icon") {
    return (
      <Image
        src="/logo-icon.svg"
        alt="CaptableBR"
        width={28}
        height={28}
        className={cn("rounded-lg", className)}
      />
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/logo-icon.svg"
        alt=""
        width={28}
        height={28}
        className="rounded-lg"
      />
      <Image
        src="/logo.svg"
        alt="CaptableBR"
        width={160}
        height={32}
        className="h-6 w-auto"
        priority
      />
    </div>
  );
}
