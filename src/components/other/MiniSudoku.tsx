"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function MiniSudoku() {
  const presets = [
    {
      name: "Easy",
      grid: [
        [1, 0, 0, 4],
        [0, 0, 2, 0],
        [4, 0, 0, 1],
        [0, 3, 0, 0],
      ],
    },
    {
      name: "Medium",
      grid: [
        [0, 2, 0, 0],
        [0, 0, 3, 4],
        [4, 0, 0, 1],
        [0, 1, 0, 0],
      ],
    },
  ];

  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [grid, setGrid] = useState(() => structuredClone(presets[0].grid));
  const [message, setMessage] = useState("");

  useEffect(() => {
    setGrid(structuredClone(presets[puzzleIdx].grid));
    setMessage("");
  }, [puzzleIdx]);

  function setCell(r: number, c: number, v: number) {
    setGrid((g) => {
      const copy = g.map((row) => row.slice());
      copy[r][c] = v;
      return copy;
    });
  }

  function checkValid() {
    const size = 4;
    const blockSize = 2;

    for (let r = 0; r < size; r++) {
      const seen = new Set();
      for (let c = 0; c < size; c++) {
        const v = grid[r][c];
        if (v === 0 || seen.has(v)) return false;
        seen.add(v);
      }
    }

    for (let c = 0; c < size; c++) {
      const seen = new Set();
      for (let r = 0; r < size; r++) {
        const v = grid[r][c];
        if (v === 0 || seen.has(v)) return false;
        seen.add(v);
      }
    }

    for (let br = 0; br < blockSize; br++) {
      for (let bc = 0; bc < blockSize; bc++) {
        const seen = new Set();
        for (let r = 0; r < blockSize; r++) {
          for (let c = 0; c < blockSize; c++) {
            const v = grid[br * blockSize + r][bc * blockSize + c];
            if (v === 0 || seen.has(v)) return false;
            seen.add(v);
          }
        }
      }
    }

    return true;
  }

  function reset() {
    setGrid(structuredClone(presets[puzzleIdx].grid));
    setMessage("");
  }

  function checkSolution() {
    if (checkValid()) {
      setMessage("Looks good! ✔️");
    } else {
      setMessage("Not correct yet ❌");
    }
  }

  return (
    <div className="bg-[#eba85c]/10 backdrop-blur-sm rounded-xl border-2 border-[#eba85c]/30 p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-[#4c3024] flex items-center gap-2">
          <Search className="h-5 w-5 text-[#7c4141]" />
          Mini Sudoku (4×4)
        </h3>

        <div className="flex items-center gap-2">
          <select
            value={puzzleIdx}
            onChange={(e) => setPuzzleIdx(parseInt(e.target.value))}
            className="px-2 py-1 rounded-md border"
          >
            {presets.map((p, i) => (
              <option value={i} key={i}>
                {p.name}
              </option>
            ))}
          </select>

          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>
      </div>

      <p className="text-sm text-[#4c3024]/70 mb-4">
        Fill digits 1–4 so each row, column, and 2×2 block has all numbers.
      </p>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {grid.map((row, rIdx) =>
          row.map((cell, cIdx) => {
            const fixed = presets[puzzleIdx].grid[rIdx][cIdx] !== 0;

            return (
              <input
                key={`${rIdx}-${cIdx}`}
                value={cell === 0 ? "" : cell}
                disabled={fixed}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (![0, 1, 2, 3, 4].includes(val)) return;
                  setCell(rIdx, cIdx, val);
                }}
                className={`h-12 text-center rounded-md border ${
                  fixed ? "bg-[#f3ecd6]" : "bg-white"
                }`}
                inputMode="numeric"
              />
            );
          })
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={checkSolution}>Check</Button>
        <div className="text-sm text-[#4c3024]/70 ml-auto">{message}</div>
      </div>
    </div>
  );
}
