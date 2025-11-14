import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base Styles (her UI style)
        "h-11 w-full px-4 rounded-xl bg-white/70 backdrop-blur-sm",
        "text-[#4c3024] placeholder:text-[#4c3024]/50",
        "border border-[#dabe72]/40 shadow-md",

        // State
        "focus:border-[#dabe72] focus:ring-2 focus:ring-[#dabe72]/40 outline-none",

        // Disabled
        "disabled:opacity-50 disabled:cursor-not-allowed",

        // Merge additional classes
        className
      )}
      {...props}
    />
  );
}

export { Input };
