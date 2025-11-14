"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Music, Pause, Play } from "lucide-react";

export default function AmbientSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.15);

  // --- Start Ambient Noise ---
  const startAmbient = () => {
    if (isPlaying) return;

    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    // Master gain
    const master = ctx.createGain();
    master.gain.value = volume;
    gainRef.current = master;

    // 3 soft oscillators
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();

    osc1.type = "sine";
    osc2.type = "sine";
    osc3.type = "sine";

    osc1.frequency.value = 220;
    osc2.frequency.value = 330;
    osc3.frequency.value = 261.63;

    osc2.detune.value = 10;
    osc3.detune.value = -8;

    // Gentle noise
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.2;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 1000;

    noise.connect(noiseFilter);

    const mix = ctx.createGain();
    mix.gain.value = 0.5;

    osc1.connect(mix);
    osc2.connect(mix);
    osc3.connect(mix);
    noiseFilter.connect(mix);

    mix.connect(master);
    master.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc3.start();
    noise.start();

    setIsPlaying(true);
  };

  // --- Stop Ambient ---
  const stopAmbient = () => {
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {}
    }

    audioCtxRef.current = null;
    gainRef.current = null;
    setIsPlaying(false);
  };

  // Adjust volume on slider change
  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = volume;
    }
  }, [volume]);

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-xl border-2 border-[#dabe72]/40 p-6 shadow-sm">
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-[#4c3024] flex items-center gap-2">
          <Music className="h-6 w-6 text-[#7c4141]" /> Ambient Sound
        </h3>
        <span className="text-sm text-[#4c3024]/70">
          {isPlaying ? "Playing" : "Stopped"}
        </span>
      </div>

      <p className="text-sm text-[#4c3024]/70 mb-4">
        Gentle background ambience to relax the mind.
      </p>

      {/* Volume & Play controls */}
      <div className="flex items-center gap-4 mt-3">
        <input
          type="range"
          value={volume}
          min={0}
          max={0.4}
          step={0.01}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-40"
        />

        {!isPlaying ? (
          <Button onClick={startAmbient} className="flex items-center gap-2">
            <Play className="h-4 w-4" /> Play
          </Button>
        ) : (
          <Button
            onClick={stopAmbient}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Pause className="h-4 w-4" /> Stop
          </Button>
        )}
      </div>
    </div>
  );
}
