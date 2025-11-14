"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignedIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
// --- Removed Users and MapPin icons ---
import { Brain, ScanFace } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Define the navigation links (Removed extra links) ---
const navLinks = [{ href: "/", label: "Scan & Recognize", icon: ScanFace }];

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between p-4 px-6 border-b border-gray-200 bg-white shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-6">
        {/* Logo/Title */}
        <Link href="/" className="flex items-center gap-2">
          <Brain className="size-7 text-indigo-600" />
          <span className="text-2xl font-bold text-indigo-600 hidden sm:block">
            NeuroLink
          </span>
        </Link>

        {/* Navigation Links */}
        {/* --- Removed the 'hidden md:flex' wrapper --- */}
        <div className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant={pathname === link.href ? "secondary" : "ghost"}
              asChild
            >
              <Link href={link.href}>
                <link.icon className="size-4 mr-2" />
                {link.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {/* User Button */}
      <div className="flex items-center">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </nav>
  );
};
