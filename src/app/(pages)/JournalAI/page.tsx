"use client";

import React, { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Button } from "@/components/ui/button";

// Helper for date
const todayString = () => new Date().toISOString().slice(0, 10);

export default function VoiceAssistantPage() {
  const { user } = useUser();

  /* -------------------------------------------------------------------------- */
  /*                               Convex Functions                             */
  /* -------------------------------------------------------------------------- */

  const addVoiceLog = useMutation(api.logs.addVoiceLog);
  const archiveTodayLogs = useMutation(api.logs.archiveTodayLogs);

  const today = todayString();

  const todayLogs = useQuery(
    api.logs.getTodayLogs,
    user ? { userId: user.id } : "skip"
  );

  /* -------------------------------------------------------------------------- */
  /*                               Speech Recording                             */
  /* -------------------------------------------------------------------------- */

  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  function startListening() {
    const Recognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!Recognition) {
      alert(
        "Speech recognition not supported. Use Chrome on localhost or HTTPS."
      );
      return;
    }

    const rec = new Recognition();
    recognitionRef.current = rec;

    rec.lang = "en-IN";
    rec.continuous = true;
    rec.interimResults = false;

    rec.onresult = async (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;

      console.log("🎤 Heard:", transcript);

      await addVoiceLog({
        userId: user?.id!,
        text: transcript,
      });
    };

    rec.start();
    setListening(true);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  /* -------------------------------------------------------------------------- */
  /*                        Auto Archive Logs at Midnight                        */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!user) return;

    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() -
      now.getTime();

    const timer = setTimeout(async () => {
      console.log("🌙 Midnight reached — archiving logs...");
      await archiveTodayLogs({ userId: user.id });
    }, msUntilMidnight);

    return () => clearTimeout(timer);
  }, [user]);

  /* -------------------------------------------------------------------------- */
  /*                                Manual Archive                              */
  /* -------------------------------------------------------------------------- */

  async function handleManualArchive() {
    if (!user) return;

    await archiveTodayLogs({ userId: user.id });

    alert("Today's logs have been archived.");
  }

  return (
    <div className="p-10 space-y-10 w-full max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-center">Voice Activity Log</h1>

      {/* -------------------- Controls -------------------- */}
      <div className="flex gap-4 justify-center">
        {!listening ? (
          <Button onClick={startListening}>🎤 Start Recording</Button>
        ) : (
          <Button variant="destructive" onClick={stopListening}>
            ⏹ Stop
          </Button>
        )}

        <Button variant="secondary" onClick={handleManualArchive}>
          📦 Archive Today
        </Button>

        <a href="/PastLogs">
          <Button variant="outline">📚 View Past Logs</Button>
        </a>
      </div>

      {/* -------------------- Today's Logs -------------------- */}
      <div className="bg-neutral-100 dark:bg-neutral-900 p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-3">Today's Logs ({today})</h2>

        {todayLogs?.length ? (
          todayLogs.map((log) => (
            <p key={log._id} className="text-sm opacity-80">
              • {log.text}
            </p>
          ))
        ) : (
          <p className="text-muted-foreground">No logs today yet.</p>
        )}
      </div>
    </div>
  );
}
