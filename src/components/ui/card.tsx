import * as React from "react";
import { cn } from "@/lib/utils";

// Root Card
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-white/60 backdrop-blur-sm border border-[#dabe72]/40 rounded-2xl shadow-xl p-6 flex flex-col gap-4",
        className
      )}
      {...props}
    />
  );
}

// Header
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  );
}

// Title
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("text-xl font-semibold text-[#4c3024]", className)}
      {...props}
    />
  );
}

// Description
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-[#4c3024]/70 text-sm", className)}
      {...props}
    />
  );
}

// Action
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("ml-auto", className)}
      {...props}
    />
  );
}

// Content
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("text-[#4c3024]/90", className)}
      {...props}
    />
  );
}

// Footer
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("mt-2 flex items-center justify-end gap-2", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
