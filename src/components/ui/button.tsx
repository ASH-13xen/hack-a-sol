"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all shadow-md " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eba85c]/60 disabled:pointer-events-none disabled:opacity-50 " +
    "active:scale-[0.97] hover:shadow-lg",
  {
    variants: {
      variant: {
        default:
          "bg-[#7c4141] text-white hover:bg-[#6a3737] border border-[#7c4141]",
        outline:
          "bg-white/70 border border-[#dabe72] text-[#4c3024] hover:bg-[#f2e8cc]",
        secondary:
          "bg-[#eba85c]/30 text-[#4c3024] border border-[#eba85c]/40 hover:bg-[#eba85c]/40",
        ghost: "hover:bg-[#f7f2e3] text-[#4c3024]",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 border border-red-600",
        link: "text-[#7c4141] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
