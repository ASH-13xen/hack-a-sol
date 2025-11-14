"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { motion, type Transition } from "motion/react";
import { Clock } from "lucide-react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Animation helpers
const getPathAnimate = (isChecked: boolean) => ({
  pathLength: isChecked ? 1 : 0,
  opacity: isChecked ? 1 : 0,
});

const getPathTransition = (isChecked: boolean): Transition => ({
  pathLength: { duration: 1, ease: "easeInOut" },
  opacity: {
    duration: 0.01,
    delay: isChecked ? 0 : 1,
  },
});

export default function TodoPage() {
  const { user } = useUser();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("12:00:00");

  // NEW STATE FOR DIALOG
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  // Convex calls
  const addTodo = useMutation(api.todos.addTodo);
  const toggleTodo = useMutation(api.todos.toggleTodo);
  const deleteTodo = useMutation(api.todos.deleteTodo);

  const todos = useQuery(
    api.todos.getTodos,
    user ? { userId: user.id } : "skip"
  );

  // FORM SUBMIT HANDLER
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return alert("Please sign in.");
    if (!date) return alert("Pick a date!");

    await addTodo({
      userId: user.id,
      title,
      date: date.toISOString().slice(0, 10),
      time,
    });

    setTitle("");
    setOpen(false);
  }

  return (
    <div className="w-full h-full flex flex-col gap-12 px-10 py-6 justify-center align-middle">
      {/* Page heading */}
      <h1 className="text-4xl font-bold text-center mb-4">
        Things you need to do
      </h1>

      {/* --- TWO BIG COLUMNS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-[95%] mx-auto">
        {/* ---------------- LEFT: TODO LIST ---------------- */}
        <div className="bg-neutral-100 dark:bg-neutral-900 rounded-3xl p-10 shadow-lg min-h-[600px]">
          <h2 className="text-2xl font-bold mb-6">Your To-Dos</h2>

          <div className="space-y-10">
            {todos?.map((item) => (
              <div key={item._id} className="space-y-4">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={(v) =>
                      toggleTodo({ id: item._id, completed: v === true })
                    }
                    className="scale-125"
                  />

                  {/* Label & animation */}
                  <div className="relative inline-block text-lg">
                    <span
                      className={
                        item.completed
                          ? "line-through opacity-50"
                          : "text-foreground"
                      }
                    >
                      {item.title}
                    </span>

                    <motion.svg
                      width="420"
                      height="36"
                      viewBox="0 0 420 36"
                      className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none z-20 w-full h-10"
                    >
                      <motion.path
                        d="M 10 16.91 s 79.8 -11.36 98.1 -11.34 c 22.2 0.02 -47.82 14.25 -33.39 22.02 c 12.61 6.77 124.18 -27.98 133.31 -17.28 c 7.52 8.38 -26.8 20.02 4.61 22.05 c 24.55 1.93 113.37 -20.36 113.37 -20.36"
                        vectorEffect="non-scaling-stroke"
                        strokeWidth={2}
                        strokeLinecap="round"
                        fill="none"
                        initial={false}
                        animate={getPathAnimate(item.completed)}
                        transition={getPathTransition(item.completed)}
                        className="stroke-neutral-900 dark:stroke-neutral-100"
                      />
                    </motion.svg>
                  </div>
                </div>

                <div className="border-t border-neutral-300 dark:border-neutral-700" />
              </div>
            ))}

            {todos?.length === 0 && (
              <p className="text-base text-muted-foreground">
                No tasks yet. Add one!
              </p>
            )}
          </div>
        </div>

        {/* ---------------- RIGHT: LARGE CALENDAR ---------------- */}
        <div className="rounded-3xl border border-border p-10 shadow-lg min-h-[600px] flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-6">Select Date</h2>

          <div className="w-full flex justify-center">
            <Calendar
              mode="single"
              className="bg-background p-8 rounded-2xl shadow-md w-full max-w-[480px]"
              selected={date}
              onSelect={setDate}
            />
          </div>
        </div>
      </div>

      {/* ---------------- BOTTOM: TIME + ADD TODO BUTTON ---------------- */}
      <div className="flex items-center gap-6 w-full max-w-[70%] mx-auto">
        <div className="flex flex-col w-full">
          <Label className="text-sm mb-1">Select Time</Label>
          <div className="relative">
            <Input
              type="time"
              step="1"
              className="ps-10 h-12 text-lg"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <Clock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80"
              size={22}
            />
          </div>
        </div>

        {/* DIALOG BUTTON */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 px-10 text-lg">Add Todo</Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add a New Todo</DialogTitle>
              <DialogDescription>
                Pick a title for your reminder.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Drink water at 5 PM"
                  required
                  className="mt-1"
                />
              </div>

              <Button type="submit" className="w-full">
                Save Todo
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
