"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

/* -------------------------------------------------------
   CONTEXT SETUP
------------------------------------------------------- */

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

/* -------------------------------------------------------
   PROVIDER
------------------------------------------------------- */

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

/* -------------------------------------------------------
   DESKTOP SIDEBAR
------------------------------------------------------- */

export const SidebarBody = (
  props: React.ComponentProps<typeof motion.div>
) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();

  return (
    <motion.div
      className={cn(
        "h-full px-3 py-4 hidden md:flex md:flex-col bg-neutral-100 dark:bg-neutral-800 w-[260px] flex-shrink-0 shadow-md",
        className
      )}
      animate={{
        width: animate ? (open ? "260px" : "58px") : "260px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/* -------------------------------------------------------
   MOBILE SIDEBAR
------------------------------------------------------- */

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();

  return (
    <>
      <div
        className={cn(
          "h-10 px-4 py-2 flex flex-row md:hidden items-center justify-between bg-neutral-100 dark:bg-neutral-800 w-full"
        )}
        {...props}
      >
        <Menu
          className="text-neutral-800 dark:text-neutral-200 cursor-pointer h-5 w-5"
          onClick={() => setOpen(!open)}
        />

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={cn(
                "fixed h-full w-full inset-0 bg-white dark:bg-neutral-900 p-10 z-[100] flex flex-col justify-between",
                className
              )}
            >
              <X
                className="absolute right-10 top-10 z-50 text-neutral-800 dark:text-neutral-200 cursor-pointer h-6 w-6"
                onClick={() => setOpen(!open)}
              />

              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

/* -------------------------------------------------------
   NEUROLINK BRAND LOGO (fixed)
------------------------------------------------------- */

export const NeuroLinkLogo = () => {
  const { open, animate } = useSidebar();

  return (
    <Link
      href="/"
      className="flex items-center gap-2 px-2 py-1 mt-2"
    >
      {/* Icon box */}
<div className="h-7 w-7 min-w-7 min-h-7 bg-[#7c4141] rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md">
  N
</div>


      {/* Text animation */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{
          opacity: open ? 1 : 0,
          display: open ? "inline-block" : "none",
        }}
        transition={{ duration: 0.15 }}
        className="font-medium text-[#4c3024] text-base whitespace-pre"
      >
        NeuroLink
      </motion.span>
    </Link>
  );
};

/* -------------------------------------------------------
   SIDEBAR LINK
------------------------------------------------------- */

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
  props?: any;
}) => {
  const { open, animate } = useSidebar();

  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors",
        className
      )}
      {...props}
    >
      {/* Smaller icon */}
      <span className="h-4 w-4 text-neutral-700 dark:text-neutral-200 flex items-center justify-center">
        {link.icon}
      </span>

      {/* Label */}
      <motion.span
        animate={{
          opacity: open ? 1 : 0,
          display: open ? "inline-block" : "none",
        }}
        className="text-neutral-700 dark:text-neutral-200 text-xs transition-all whitespace-pre"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};
