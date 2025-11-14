"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function NumberTap() {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const [shuffled, setShuffled] = useState(() => shuffle(numbers.slice()));
  const [next, setNext] = useState(1);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState<string | null>(null);

  function shuffle(arr: number[]) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function reset() {
    setShuffled(shuffle(numbers.slice()));
    setNext(1);
    setStartTime(null);
    setElapsed(null);
  }

  function press(n: number) {
    if (n !== next) return;

    if (next === 1) setStartTime(performance.now());

    if (next === 9) {
      const end = performance.now();
      setElapsed(((end - (startTime || end)) / 1000).toFixed(2));
    }

    setNext((prev) => prev + 1);
  }

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white/50 backdrop-blur-sm rounded-xl border-2 border-[#dabe72]/30 p-6 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-[#4c3024] flex items-center gap-2">
          <Zap className="h-5 w-5 text-[#7c4141]" />
          Number Tap
        </h3>

        <div className="text-sm text-[#4c3024]/70">
          {next > 9 ? "Done" : `Next: ${next}`}
        </div>
      </div>

      <p className="text-sm text-[#4c3024]/70 mb-4">
        Tap numbers 1 → 9 in order. This strengthens attention & processing speed.
      </p>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {shuffled.map((n) => (
          <button
            key={n}
            onClick={() => press(n)}
            className={`h-14 rounded-lg border-2 text-xl transition-all ${
              n < next
                ? "bg-[#7c4141] text-white border-[#7c4141]"
                : "bg-white text-[#4c3024] border-[#e6d9a7]"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-2 items-center">
        <Button onClick={reset}>Reset</Button>

        <Button variant="outline" onClick={() => setShuffled(shuffle(numbers.slice()))}>
          Shuffle
        </Button>

        <div className="ml-auto text-sm text-[#4c3024]/70">
          {elapsed ? `Time: ${elapsed}s` : ""}
        </div>
      </div>
    </motion.div>
  );
}
