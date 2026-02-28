import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { RepoNarrative } from '../services/ai';
import { cn } from '../lib/utils';

interface CinematicOverlayProps {
  narrative: RepoNarrative;
  onClose: () => void;
}

export function CinematicOverlay({ narrative, onClose }: CinematicOverlayProps) {
  const [step, setStep] = useState(-1); // -1 is intro

  const nextStep = () => {
    if (step < narrative.majorEvents.length - 1) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (step > -1) {
      setStep(prev => prev - 1);
    }
  };

  const currentEvent = step === -1 ? null : narrative.majorEvents[step];

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Close Button */}
      <div className="absolute top-8 right-8 z-50">
        <button 
          onClick={onClose}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors group"
        >
          <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-40">
        <button
          onClick={prevStep}
          disabled={step === -1}
          className={cn(
            "p-4 bg-white/5 hover:bg-white/10 rounded-full transition-all pointer-events-auto disabled:opacity-0 disabled:pointer-events-none",
            "border border-white/10 backdrop-blur-sm"
          )}
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>
        <button
          onClick={nextStep}
          disabled={step === narrative.majorEvents.length - 1}
          className={cn(
            "p-4 bg-white/5 hover:bg-white/10 rounded-full transition-all pointer-events-auto disabled:opacity-0 disabled:pointer-events-none",
            "border border-white/10 backdrop-blur-sm"
          )}
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {step === -1 ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-3xl text-center space-y-8 relative z-10"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-widest"
            >
              The Repository Story
            </motion.div>
            <h1 className="text-3xl md:text-5xl font-serif italic text-white leading-tight">
              {narrative.introduction.split('.')[0]}.
            </h1>
            <p className="text-lg text-zinc-400 font-light leading-relaxed max-w-2xl mx-auto">
              {narrative.summary}
            </p>
            <button
              onClick={() => setStep(0)}
              className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-all shadow-xl shadow-white/5"
            >
              Begin Journey
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-emerald-500">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-mono uppercase tracking-widest">{currentEvent?.date}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                {currentEvent?.title}
              </h2>
              <p className="text-lg text-zinc-400 leading-relaxed">
                {currentEvent?.description}
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                  currentEvent?.impact === 'high' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                  currentEvent?.impact === 'medium' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                  "bg-blue-500/10 border-blue-500/20 text-blue-400"
                )}>
                  {currentEvent?.impact} Impact Event
                </div>
              </div>
            </div>

            <div className="relative aspect-square bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="w-32 h-32 text-emerald-500/20 animate-pulse" />
              </div>
              <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  ANALYZING CODEBASE STATE...
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="absolute bottom-12 inset-x-12 h-1 bg-zinc-900 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${((step + 1) / narrative.majorEvents.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}
