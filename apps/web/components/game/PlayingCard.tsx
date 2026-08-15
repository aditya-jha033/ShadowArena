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
  return (
    <motion.div
      whileHover={onClick ? { y: -10 } : {}}
      animate={{ y: isSelected ? -20 : 0 }}
      onClick={onClick}
      className={cn(
        "relative w-24 h-36 rounded-xl border-2 shadow-lg flex items-center justify-center select-none transition-shadow",
        onClick && "cursor-pointer hover:shadow-primary/20",
        isSelected ? "border-primary shadow-primary/30" : "border-border/50",
        isHidden ? (skin || "bg-primary/10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 to-transparent") : "bg-card",
        className
      )}
    >
      {!isHidden && value !== undefined && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
          <span className="text-4xl font-bold font-mono text-foreground">{value}</span>
          <div className="absolute top-2 left-2 text-sm font-bold opacity-50">{value}</div>
          <div className="absolute bottom-2 right-2 text-sm font-bold opacity-50 rotate-180">{value}</div>
        </div>
      )}
      {isHidden && (
        <div className="absolute inset-2 border border-primary/20 rounded-lg flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary/30 opacity-50" />
        </div>
      )}
    </motion.div>
  );
}
