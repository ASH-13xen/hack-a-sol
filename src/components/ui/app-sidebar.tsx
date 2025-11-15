"use client";

import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  NeuroLinkLogo,
} from "@/components/ui/sidebar-new";
import { UserButton } from "@clerk/nextjs";

import { Home, User, Phone, Heart, Map, Settings, Mic } from "lucide-react";

const iconClass = "h-4 w-4 text-neutral-700 dark:text-neutral-200";

const items = [
  { label: "Home", href: "/", icon: <Home className={iconClass} /> },
  {
    label: "People",
    href: "/KnownPeople",
    icon: <User className={iconClass} />,
  },
  {
    label: "Contact Caretaker",
    href: "/ContactCaretaker",
    icon: <Phone className={iconClass} />,
  },
  {
    label: "Feel Good",
    href: "/FeelGood",
    icon: <Heart className={iconClass} />,
  },
  {
    label: "Map to Home",
    href: "/MapToHome",
    icon: <Map className={iconClass} />,
  },
  { label: "Routine", href: "/Routine", icon: <User className={iconClass} /> },
  { label: "To-Do", href: "/To_Do", icon: <User className={iconClass} /> },
  { label: "Mic", href: "/JournalAI", icon: <Mic className={iconClass} /> },

  {
    label: "Settings",
    href: "/settings",
    icon: <Settings className={iconClass} />,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarBody className="flex flex-col justify-start">
        {/* Brand */}
        <NeuroLinkLogo />

        {/* Menu List */}
        <div className="flex flex-col gap-1 mt-4">
          {items.map((item) => (
            <SidebarLink key={item.href} link={item} />
          ))}
        </div>
        <div className="p-1"></div>
      </SidebarBody>
    </Sidebar>
  );
}
