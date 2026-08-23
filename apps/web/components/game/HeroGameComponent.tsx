"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

const SUITS = ["♠", "♥", "♦", "♣"];
const VALUES = ["A", "K", "Q", "J", "10", "9", "8"];

function FloatingCard({
  value,
  suit,
  style,
  delay,
  isRed,
  rotation,
}: {
  value: string;
  suit: string;
  style: React.CSSProperties;
  delay: number;
  isRed: boolean;
  rotation: number;
}) {
  return (
    <motion.div
      className="absolute w-[72px] h-[100px] rounded-lg border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm shadow-2xl"
      style={style}
      initial={{ opacity: 0, y: 60, rotateY: 90 }}
      animate={{
        opacity: [0, 0.85, 0.85, 0],
        y: [60, 0, -30, -80],
        rotateY: [90, 0, -15, -30],
        rotateZ: [0, rotation],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        repeatDelay: 3,
        ease: "easeInOut",
      }}
    >
      <div className="absolute inset-0 rounded-lg bg-[#0f0f18] border border-white/[0.08] flex flex-col items-center justify-center overflow-hidden">
        {/* Card back pattern */}
        <div className="absolute inset-1 border border-yellow-500/20 rounded" />
        <div className={`text-2xl font-black ${isRed ? "text-red-500" : "text-white"}`}>{suit}</div>
        <div className={`text-xs font-bold absolute top-1 left-1.5 ${isRed ? "text-red-500" : "text-white"}`}>{value}</div>
        <div className={`text-xs font-bold absolute bottom-1 right-1.5 rotate-180 ${isRed ? "text-red-500" : "text-white"}`}>{value}</div>
      </div>
    </motion.div>
  );
}

const ORBITING_CARDS = [
  { angle: 0,   delay: 0 },
  { angle: 45,  delay: 0.6 },
  { angle: 90,  delay: 1.2 },
  { angle: 135, delay: 1.8 },
  { angle: 180, delay: 2.4 },
  { angle: 225, delay: 3.0 },
  { angle: 270, delay: 3.6 },
  { angle: 315, delay: 4.2 },
];

export function HeroGameComponent() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Random floating cards in background
  const floatingCards = Array.from({ length: 12 }).map((_, i) => {
    const suit = SUITS[i % 4];
    const value = VALUES[i % 7];
    const isRed = suit === "♥" || suit === "♦";
    const rotation = -20 + (i * 11) % 40;
    return {
      suit,
      value,
      isRed,
      rotation,
      style: {
        left: `${10 + (i * 7.5) % 85}%`,
        top: `${15 + (i * 13) % 70}%`,
      } as React.CSSProperties,
      delay: i * 0.8,
    };
  });

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      
      {/* ── Ambient Glows ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-700/10 rounded-full blur-[100px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ── Floating Background Cards ── */}
      {floatingCards.map((card, i) => (
        <FloatingCard key={i} {...card} />
      ))}

      {/* ── Central Orbiting Table ── */}
      <div className="relative w-[340px] h-[340px] flex items-center justify-center">
        
        {/* Outer ring glow */}
        <motion.div
          className="absolute inset-0 rounded-full border border-yellow-500/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-4 rounded-full border border-emerald-500/10"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />

        {/* Orbiting ZK-proof cards */}
        {ORBITING_CARDS.map(({ angle, delay }, i) => {
          const rad = (angle * Math.PI) / 180;
          const radius = 140;
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;
          const suit = SUITS[i % 4];
          const isRed = suit === "♥" || suit === "♦";
          return (
            <motion.div
              key={i}
              className="absolute w-10 h-14 rounded-md bg-[#0f0f18] border border-white/10 flex items-center justify-center shadow-lg"
              style={{ left: `calc(50% + ${x}px - 20px)`, top: `calc(50% + ${y}px - 28px)` }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: delay }}
              whileHover={{ scale: 1.2, zIndex: 20 }}
            >
              <div className="absolute inset-0.5 border border-yellow-500/20 rounded" />
              <span className={`text-lg font-black ${isRed ? "text-red-500" : "text-white"}`}>{suit}</span>
            </motion.div>
          );
        })}

        {/* Central poker table */}
        <motion.div
          className="relative w-48 h-48 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900 to-emerald-950 border-4 border-[#2A1610] shadow-[0_0_60px_rgba(0,0,0,0.8),inset_0_0_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center z-10"
          animate={{ boxShadow: ["0 0 40px rgba(212,175,55,0.1)", "0 0 80px rgba(212,175,55,0.2)", "0 0 40px rgba(212,175,55,0.1)"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Felt inner ring */}
          <div className="absolute inset-4 rounded-full border border-emerald-600/30" />
          <div className="flex flex-col items-center gap-1 z-10">
            <span className="text-[10px] text-yellow-500/60 uppercase tracking-[0.2em] font-mono">Shadow</span>
            <span className="text-2xl font-black text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">ARENA</span>
            <span className="text-[10px] text-yellow-500/60 uppercase tracking-[0.2em] font-mono">ZK Gaming</span>
          </div>
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-yellow-500/20"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </div>

      {/* ── ZK Proof Ticker ── */}
      <div className="absolute bottom-6 left-0 right-0 overflow-hidden">
        <motion.div
          className="flex gap-6 w-max"
          animate={{ x: [0, -600] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(4)].flatMap(() => [
            "ZK Proof Verified ✓",
            "Move Committed On-Chain ✓",
            "Payout Released Trustlessly ✓",
            "Private Witness Hidden ✓",
            "Midnight Network Confirmed ✓",
          ]).map((text, i) => (
            <span key={i} className="text-[10px] font-mono text-emerald-500/40 whitespace-nowrap border border-emerald-500/10 px-3 py-1 rounded-full">
              {text}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
