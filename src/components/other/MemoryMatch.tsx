// src/components/feel-good/MemoryMatch.tsx
"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Gamepad } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * MemoryMatch component
 *  - 4x4 grid (8 pairs)
 *  - flip two cards, check match
 *  - moves counter
 *  - Restart and Auto Solve
 */

const DEFAULT_ICONS = ["🍎", "🍌", "🍇", "🥕", "🍪", "🍓", "🥝", "🍉"];

type Card = {
  id: string;
  v: string;
  matched: boolean;
};

export default function MemoryMatch({
  icons = DEFAULT_ICONS,
}: {
  icons?: string[]; // length should be 8 for 4x4
}) {
  const initialDeck = useMemo(() => makeDeck(icons), [icons]);
  const [deck, setDeck] = useState<Card[]>(initialDeck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [lock, setLock] = useState(false);
  const [moves, setMoves] = useState(0);

  function restart() {
    setDeck(makeDeck(icons));
    setFlipped([]);
    setLock(false);
    setMoves(0);
  }

  function autoSolve() {
    setDeck((d) => d.map((c) => ({ ...c, matched: true })));
    setFlipped([]);
    setLock(false);
  }

  function flipCard(idx: number) {
    if (lock) return;
    if (flipped.includes(idx) || deck[idx].matched) return;

    const next = [...flipped, idx];
    setFlipped(next);

    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      if (deck[a].v === deck[b].v) {
        // matched
        setDeck((d) => {
          const copy = [...d];
          copy[a] = { ...copy[a], matched: true };
          copy[b] = { ...copy[b], matched: true };
          return copy;
        });
        setFlipped([]);
      } else {
        setLock(true);
        setTimeout(() => {
          setFlipped([]);
          setLock(false);
        }, 700);
      }
    }
  }

  const won = deck.every((c) => c.matched);

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-[#dabe72]/30 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-[#4c3024] flex items-center gap-2">
          <Gamepad className="h-5 w-5 text-[#7c4141]" />
          Memory Match
        </h3>
        <div className="text-sm text-[#4c3024]/70">{moves} moves</div>
      </div>

      <p className="text-sm text-[#4c3024]/70 mb-4">
        Flip two cards. Remember where icons are — a great short-term memory
        exercise.
      </p>

      <div className="grid grid-cols-4 gap-3 mb-4">
        {deck.map((card, idx) => {
          const isFace = flipped.includes(idx) || card.matched;
          return (
            <button
              key={card.id}
              onClick={() => flipCard(idx)}
              className={`h-20 rounded-lg border-2 flex items-center justify-center text-2xl transition
                ${isFace ? "bg-[#7c4141] text-white border-[#7c4141]" : "bg-white border-[#e6d9a7]"}
                `}
              aria-pressed={isFace}
              disabled={card.matched}
            >
              {/* use simple fade/scale animation for reveal */}
              <AnimatePresence mode="wait">
                {isFace ? (
                  <motion.span
                    key={"face-" + card.id}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="select-none"
                  >
                    {card.v}
                  </motion.span>
                ) : (
                  <motion.span
                    key={"back-" + card.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-2xl select-none text-[#4c3024]/60"
                  >
                    ?
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Button onClick={restart}>Restart</Button>
        <Button variant="outline" onClick={autoSolve}>
          Auto Solve
        </Button>
        {won && <div className="ml-auto text-green-600 font-semibold">Well done — you solved it!</div>}
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function makeDeck(icons: string[]) {
  // Create pairs and shuffle
  const pairs = icons.slice(0, 8).flatMap((v, i) => [
    { id: `${i}-a`, v, matched: false },
    { id: `${i}-b`, v, matched: false },
  ]);
  return shuffleArray(pairs);
}

function shuffleArray<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
