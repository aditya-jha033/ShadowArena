"use client";

import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useWalletStore } from "@/lib/midnight/wallet";

export function FeedbackModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { walletAddress } = useWalletStore();
  
  const [rating, setRating] = useState(0);
  const [whatBroke, setWhatBroke] = useState("");
  const [whatConfused, setWhatConfused] = useState("");
  const [suggestions, setSuggestions] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please provide an overall rating");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overallRating: rating,
          whatBroke,
          whatConfused,
          suggestions,
          walletAddress: walletAddress || null
        })
      });

      if (!res.ok) throw new Error("Failed to submit feedback");
      
      toast.success("Feedback submitted successfully. Thank you!");
      setOpen(false);
      setRating(0);
      setWhatBroke("");
      setWhatConfused("");
      setSuggestions("");
    } catch (error) {
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-black px-4 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105"
      >
        <MessageSquare className="w-5 h-5" />
        Feedback
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#070709] border border-yellow-500/20 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-4 border-b border-yellow-500/10">
              <h2 className="text-xl font-black text-yellow-400 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> Help us improve
              </h2>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="feedback-form" onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2">Overall Experience <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRating(num)}
                        className={`w-10 h-10 rounded-lg font-bold transition-colors ${rating === num ? 'bg-yellow-500 text-black' : 'bg-white/5 hover:bg-white/10'}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-white/80">Did anything break or bug out?</label>
                  <textarea 
                    value={whatBroke}
                    onChange={(e) => setWhatBroke(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-yellow-500/50 outline-none resize-none h-20"
                    placeholder="E.g., I couldn't join a match..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-white/80">Was anything confusing?</label>
                  <textarea 
                    value={whatConfused}
                    onChange={(e) => setWhatConfused(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-yellow-500/50 outline-none resize-none h-20"
                    placeholder="E.g., I didn't understand how the proofs work..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-white/80">General Suggestions</label>
                  <textarea 
                    value={suggestions}
                    onChange={(e) => setSuggestions(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-yellow-500/50 outline-none resize-none h-20"
                    placeholder="I'd love to see..."
                  />
                </div>
              </form>
            </div>

            <div className="p-4 bg-black/40 border-t border-yellow-500/10 flex justify-end">
              <Button 
                type="submit" 
                form="feedback-form" 
                disabled={loading}
                className="bg-yellow-500 text-black hover:bg-yellow-400 gap-2 font-bold"
              >
                {loading ? "Submitting..." : "Submit Feedback"}
                {!loading && <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
