"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";

export default function PastLogsPage() {
  const { user } = useUser();

  // --- Fetch all dates for this user ---
  const dates = useQuery(
    api.logs.getAllDates,
    user ? { userId: user.id } : "skip"
  );

  // Selected date logs
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const logsForDate = useQuery(
    api.logs.getLogsForDate,
    selectedDate && user ? { userId: user.id, date: selectedDate } : "skip"
  );

  return (
    <div className="p-10 space-y-10 w-full max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-center">Past Voice Logs</h1>

      {/* -------------------- Date List -------------------- */}
      <div className="bg-neutral-100 dark:bg-neutral-900 p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-3">Available Dates</h2>

        {!dates ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : dates.length === 0 ? (
          <p className="text-muted-foreground">No past logs found.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {dates.map((date: any) => (
              <Button
                key={date.date}
                variant={selectedDate === date.date ? "secondary" : "outline"}
                onClick={() => setSelectedDate(date.date)}
                className="justify-start"
              >
                📅 {date.date}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* -------------------- Logs for selected date -------------------- */}
      {selectedDate && (
        <div className="bg-neutral-100 dark:bg-neutral-900 p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-3">
            Logs for {selectedDate}
          </h2>

          {!logsForDate ? (
            <p className="text-muted-foreground">Loading logs...</p>
          ) : logsForDate.length === 0 ? (
            <p className="text-muted-foreground">No logs for this date.</p>
          ) : (
            logsForDate.map((log: any) => (
              <p key={log._id} className="text-sm opacity-80">
                • {log.text}
              </p>
            ))
          )}
        </div>
      )}
    </div>
  );
}
