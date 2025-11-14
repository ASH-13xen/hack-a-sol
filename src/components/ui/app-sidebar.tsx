"use client";

import {
  Calendar,
  Heart,
  Home,
  Inbox,
  Map,
  Phone,
  Search,
  Settings,
  User,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// --- 1. Import Link for navigation and usePathname for active state ---
import Link from "next/link";
import { usePathname } from "next/navigation";

// --- 2. Update URLs to match your page routes ---
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "People",
    url: "/KnownPeople",
    icon: User,
  },
  {
    title: "Contact Caretaker",
    url: "/ContactCaretaker",
    icon: Phone,
  },
  {
    title: "Feel Good",
    url: "/FeelGood",
    icon: Heart,
  },

  {
    title: "Map to Home",
    url: "/MapToHome",
    icon: Map,
  },
  {
    title: "Routine",
    url: "/Routine",
    icon: User,
  },
  {
    title: "To-Do",
    url: "/To_Do",
    icon: User,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  // --- 3. Get the current page's path ---
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {/* --- 4. Set the variant based on active path --- */}
                  <SidebarMenuButton asChild>
                    {/* --- 5. Replace <a> with <Link> --- */}
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
