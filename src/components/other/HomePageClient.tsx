"use client";

import ScanPersonForm from "@/components/other/ScanPersonForm";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
// --- Re-enabled API import ---
import { api } from "../../../convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Heart, ListTodo, Phone, CheckSquare } from "lucide-react";
import Link from "next/link";
// --- Import Doc type for routines ---
import { Doc } from "../../../convex/_generated/dataModel";

/**
 * Helper function to find the next routine.
 * Assumes routines are already sorted by time (which api.routines.getToday does).
 */
function getNextRoutine(
  routines: Doc<"routines">[] | undefined
): Doc<"routines"> | null {
  if (!routines || routines.length === 0) {
    return null;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

  // Find the first routine that is later than the current time
  for (const routine of routines) {
    const [hours, minutes] = routine.time.split(":").map(Number);
    const routineTime = hours * 60 + minutes;

    if (routineTime >= currentTime) {
      return routine; // This is the next upcoming routine
    }
  }

  // If no future routines are left for today, show the first one for "tomorrow"
  return routines[0];
}

/**
 * A sub-component to display the 4 "Quick Action" cards.
 */
function DashboardStatCards() {
  // --- Fetch real data for routines ---
  const routines = useQuery(api.routines.getToday); // Fetch today's routines
  const nextRoutine = getNextRoutine(routines);

  // --- FIX: Fetch real data for Caregivers ---
  const caregivers = useQuery(api.caregivers.get);

  // --- Placeholders for To-Do as requested ---
  const todos = undefined;

  // Helper to show loading or count
  // --- FIX: Changed 'string[]' to 'any[]' to accept query results ---
  const renderCount = (data: string[] | undefined) => {
    if (data === undefined) {
      // Return a loading spinner as a placeholder
      return <Loader2 className="size-5 animate-spin text-gray-400" />;
    }
    return <span className="text-3xl font-bold">{data.length}</span>;
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Daily Video / Feel Good Card */}
      <Link href="/FeelGood" className="h-full">
        <Card className="hover:bg-gray-50 transition-colors h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Daily Video / Feel Good
            </CardTitle>
            <Heart className="size-5 text-pink-500" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">Watch Now</span>
            <p className="text-xs text-muted-foreground">
              Relaxing videos and activities
            </p>
          </CardContent>
        </Card>
      </Link>

      {/* 2. Routines Card */}
      <Link href="/Routine" className="h-full">
        <Card className="hover:bg-gray-50 transition-colors h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Routine</CardTitle>
            <ListTodo className="size-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            {routines === undefined ? (
              <Loader2 className="size-5 animate-spin text-gray-400" />
            ) : nextRoutine ? (
              <div>
                <span className="text-2xl font-bold">{nextRoutine.time}</span>
                <p className="text-xs text-muted-foreground truncate">
                  {nextRoutine.message}
                </p>
              </div>
            ) : (
              <div>
                <span className="text-xl font-bold text-gray-400">
                  No Routines
                </span>
                <p className="text-xs text-muted-foreground">
                  No tasks scheduled today.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>

      {/* 3. To-Do List Card */}
      <Link href="/To_Do" className="h-full">
        <Card className="hover:bg-gray-50 transition-colors h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">To-Do List</CardTitle>
            <CheckSquare className="size-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            {renderCount(todos)}
            <p className="text-xs text-muted-foreground">
              Items to complete today
            </p>
          </CardContent>
        </Card>
      </Link>

      {/* 4. Caretakers Card */}
      <Link href="/ContactCaretaker" className="h-full">
        <Card className="hover:bg-gray-50 transition-colors h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Caregiver Contacts
            </CardTitle>
            <Phone className="size-5 text-green-500" />
          </CardHeader>
          <CardContent>
            {/* This will now show the live count or a spinner */}
            {renderCount(caregivers)}
            <p className="text-xs text-muted-foreground">Emergency contacts</p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

// --- Main Page Component ---
export default function HomePageClient() {
  return (
    <div className="p-4 sm:p-8 flex flex-col items-center justify-center min-h-[80vh] w-full">
      <Authenticated>
        {/* --- MODIFIED: Main layout for authenticated users --- */}
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Left Column (Scanner) --- */}
          <div className="lg:col-span-2">
            {/* The ScanPersonForm is now the main content on the left */}
            <ScanPersonForm />
          </div>

          {/* --- Right Column (Quick Actions) --- */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Quick Actions
            </h2>
            {/* On large screens, the cards will stack vertically.
              On medium screens (md:grid-cols-2), they will be 2x2.
              This provides a better layout for the 1/3 column.
            */}
            <DashboardStatCards />
          </div>
        </div>
      </Authenticated>

      <Unauthenticated>
        {/* Fallback for logged-out users */}
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
