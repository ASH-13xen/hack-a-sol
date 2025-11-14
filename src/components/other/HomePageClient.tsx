"use client";

import ScanPersonForm from "@/components/other/ScanPersonForm";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton } from "@clerk/nextjs";

export default function HomePageClient() {
  return (
    // Increase padding and ensure full width layout for the two-column form
    <div className="p-4 sm:p-8 flex flex-col items-center justify-center min-h-[80vh] w-full">
      <Authenticated>
        {/* The ScanPersonForm is now the main content when authenticated */}
        <ScanPersonForm />
      </Authenticated>

      <Unauthenticated>
        <div className="flex flex-col items-center gap-4 p-12 bg-white rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-3xl font-extrabold text-indigo-700">
            NeuroLink Companion
          </h2>
          <p className="text-gray-600 text-center">
            Please sign in to start building the memory database for Alzheimers
            care.
          </p>
          <SignInButton mode="modal">
            <button className="p-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
              Sign In to Begin
            </button>
          </SignInButton>
        </div>
      </Unauthenticated>
    </div>
  );
}
