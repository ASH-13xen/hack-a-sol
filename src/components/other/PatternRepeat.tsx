"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";

export default function PatternRepeat() {
  const pads = [
    { id: 0, color: "bg-red-400", label: "Red" },
    { id: 1, color: "bg-green-400", label: "Green" },
    { id: 2, color: "bg-yellow-300", label: "Yellow" },
    { id: 3, color: "bg-blue-300", label: "Blue" },
  ];

  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [playingSeq, setPlayingSeq] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    reset();
  }, []);

  function reset() {
    setSequence([]);
    setPlayerIndex(0);
    setMessage("");
  }

  function nextRound() {
    const next = [...sequence, Math.floor(Math.random() * 4)];
    setSequence(next);
    setPlayerIndex(0);
    playSequence(next);
  }

  async function playSequence(seq: number[]) {
    setPlayingSeq(true);
    setMessage("Watch the pattern...");

    for (let i = 0; i < seq.length; i++) {
      flashPad(seq[i]);
      await sleep(500);
    }

    setPlayingSeq(false);
    setMessage("Your turn!");
  }

  function flashPad(id: number) {
    const el = document.getElementById(`simon-pad-${id}`);
    if (!el) return;

    el.classList.add("ring-4", "ring-white");
    setTimeout(() => {
      el.classList.remove("ring-4", "ring-white");
    }, 300);
  }

  function pressPad(id: number) {
    if (playingSeq) return;

    if (sequence.length === 0) {
      setMessage("Press Start first!");
      return;
    }

    flashPad(id);

    if (id === sequence[playerIndex]) {
      const nextIdx = playerIndex + 1;
      setPlayerIndex(nextIdx);

      if (nextIdx === sequence.length) {
        setMessage("Good! Next round...");
        setTimeout(() => nextRound(), 600);
      }

    } else {
      setMessage("Wrong! Restarting...");
      reset();
      setTimeout(() => nextRound(), 900);
    }
  }

  return (
    <div className="bg-[#eba85c]/10 backdrop-blur-sm rounded-xl border-2 border-[#eba85c]/30 p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-[#4c3024] flex items-center gap-2">
          <Smile className="h-5 w-5 text-[#7c4141]" />
          Pattern Repeat
        </h3>
        <div className="text-sm text-[#4c3024]/70">
          {sequence.length} steps
        </div>
      </div>

      <p className="text-sm text-[#4c3024]/70 mb-3">
        Repeat the color pattern. Great for memory & focus!
      </p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {pads.map((p) => (
          <button
            key={p.id}
            id={`simon-pad-${p.id}`}
            onClick={() => pressPad(p.id)}
            className={`h-20 rounded-lg border-2 flex items-center justify-center text-white text-lg ${p.color}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={() => { reset(); nextRound(); }}>
          Start
        </Button>

        <Button variant="outline" onClick={reset}>
          Reset
        </Button>

        <div className="ml-auto text-sm text-[#4c3024]/70">
          {message}
        </div>
      </div>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
