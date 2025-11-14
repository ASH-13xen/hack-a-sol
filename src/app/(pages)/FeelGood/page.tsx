import MemoryMatch from "@/components/other/MemoryMatch";
import MiniSudoku from "@/components/other/MiniSudoku";
import NumberTap from "@/components/other/NumberTap";
import PatternRepeat from "@/components/other/PatternRepeat";
import AmbientSound from "@/components/other/AmbientSound";


export default function FeelGoodPage() {
  return (
    <div className="p-6 md:p-10 w-full">
      {/* HEADER ... keep your existing header here */}

      {/* GRID LAYOUT (same as your friend used) */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT SIDE — TAKES 2 COLUMNS */}
        <div className="lg:col-span-2 space-y-6">
          <MemoryMatch />   
          <MiniSudoku />
          {/* Mini Sudoku also goes here later */}
        </div>

        {/* RIGHT SIDE — TAKES 1 COLUMN */}
        <div className="space-y-6">
          <AmbientSound />
          <NumberTap />    
          <PatternRepeat />
          
          {/* Pattern Repeat game also goes here later */}
        </div>
      </div>
    </div>
  );
}
