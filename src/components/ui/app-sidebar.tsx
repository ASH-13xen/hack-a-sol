"use client";

import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar-new";
import { UserButton } from "@clerk/nextjs";
import { Home, User, Phone, Heart, Map, Settings } from "lucide-react";
import Link from "next/link";

const items = [
  { label: "Home", href: "/", icon: <Home className="text-[#4c3024]" /> },
  { label: "People", href: "/KnownPeople", icon: <User className="text-[#4c3024]" /> },
  { label: "Contact Caretaker", href: "/ContactCaretaker", icon: <Phone className="text-[#4c3024]" /> },
  { label: "Feel Good", href: "/FeelGood", icon: <Heart className="text-[#4c3024]" /> },
  { label: "Map to Home", href: "/MapToHome", icon: <Map className="text-[#4c3024]" /> },
  { label: "Routine", href: "/Routine", icon: <User className="text-[#4c3024]" /> },
  { label: "To-Do", href: "/To_Do", icon: <User className="text-[#4c3024]" /> },
  { label: "Settings", href: "/settings", icon: <Settings className="text-[#4c3024]" /> },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarBody className="flex flex-col justify-between">
        <div className="flex flex-col gap-3 mt-6">
          {items.map((item) => (
            <SidebarLink key={item.href} link={item} />
          ))}
          <UserButton />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
