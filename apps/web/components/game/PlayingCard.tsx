import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PlayingCardProps {
  value?: number;
  isHidden?: boolean;
  className?: string;
  onClick?: () => void;
  isSelected?: boolean;
  skin?: string;
}

export function PlayingCard({ value, isHidden = false, className, onClick, isSelected, skin }: PlayingCardProps) {
  // Determine suit color for front of card (alternating red/black for visual flavor)
  const isRed = value !== undefined && value % 2 !== 0;
  const suit = isRed ? "♥" : "♠";
  
  return (
    <motion.div
      whileHover={onClick && !isHidden ? { y: -15, scale: 1.05 } : {}}
      animate={{ y: isSelected ? -25 : 0 }}
      onClick={onClick}
      className={cn(
        "relative w-[100px] h-[140px] perspective-1000",
        onClick && "cursor-pointer",
        className
      )}
    >
      <motion.div
        className="w-full h-full relative preserve-3d transition-all duration-700 shadow-2xl"
        animate={{ rotateY: isHidden ? 180 : 0 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT OF CARD */}
        <div className={cn(
          "absolute inset-0 backface-hidden rounded-xl border border-gray-300 bg-white flex items-center justify-center overflow-hidden",
          isSelected && "ring-4 ring-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.5)]"
        )} style={{ backfaceVisibility: "hidden" }}>
          
          <div className="absolute top-2 left-2 flex flex-col items-center">
            <span className={cn("text-lg font-bold leading-none", isRed ? "text-red-600" : "text-black")}>{value}</span>
            <span className={cn("text-sm", isRed ? "text-red-600" : "text-black")}>{suit}</span>
          </div>
          
          <span className={cn("text-5xl font-black", isRed ? "text-red-600" : "text-black")}>{suit}</span>
          
          <div className="absolute bottom-2 right-2 flex flex-col items-center rotate-180">
            <span className={cn("text-lg font-bold leading-none", isRed ? "text-red-600" : "text-black")}>{value}</span>
            <span className={cn("text-sm", isRed ? "text-red-600" : "text-black")}>{suit}</span>
          </div>
        </div>

        {/* BACK OF CARD */}
        <div className={cn(
          "absolute inset-0 backface-hidden rounded-xl border-2 border-white bg-red-900",
          skin || "bg-[url('https://www.transparenttextures.com/patterns/argyle.png')]"
        )} style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <div className="absolute inset-2 border-2 border-yellow-500/50 rounded-lg flex items-center justify-center overflow-hidden bg-red-950/40">
             <div className="w-12 h-12 rounded-full border-2 border-yellow-500/30 flex items-center justify-center">
                <span className="text-yellow-500/30 font-serif font-bold text-lg">SA</span>
             </div>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}
