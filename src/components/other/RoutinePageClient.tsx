"use client";

import { useState } from "react";
import { api } from "@convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function RemindersPageClient() {
  const { user } = useUser();
  const userId = user?.id;

  const routines = useQuery(
    api.routines.getRoutines,
    userId ? { userId } : "skip"
  );

  const addRoutine = useMutation(api.routines.addRoutine);
  const deleteRoutine = useMutation(api.routines.deleteRoutine);

  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");

  const handleAdd = async () => {
    if (!userId) return toast.error("Please sign in");

    if (!time) return toast.error("Select a time");
    if (!phone.startsWith("+")) return toast.error("Enter phone like +91xxxx");

    await addRoutine({ userId, time, message, phone });
    toast.success("Added Reminder!");

    setTime("");
    setMessage("");
    setPhone("");
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 p-4">
      <h1 className="text-2xl font-bold">WhatsApp Reminders</h1>

      <Card className="p-4 space-y-3">
        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <Input placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
        <Input placeholder="Phone (+91...)" value={phone} onChange={(e) => setPhone(e.target.value)} />

        <Button className="w-full" onClick={handleAdd}>
          Add Reminder
        </Button>
      </Card>

      <div className="space-y-3">
        {routines?.map((r) => (
          <Card key={r._id} className="p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">⏰ {r.time}</p>
              <p>{r.message}</p>
              <p className="text-sm text-gray-500">{r.phone}</p>
            </div>

            <Button
              variant="destructive"
              onClick={() => deleteRoutine({ id: r._id })}
            >
              Delete
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
