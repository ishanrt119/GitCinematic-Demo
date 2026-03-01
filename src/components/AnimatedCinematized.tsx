import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const STYLES = [
  { name: 'Cinematized.', className: 'text-emerald-500 italic' },
  { name: 'Cinematized.', className: 'text-emerald-400 font-serif font-bold' },
  { name: 'Cinematized.', className: 'text-emerald-300 font-mono tracking-widest' },
  { name: 'Cinematized.', className: 'text-emerald-600 underline decoration-emerald-500/50' },
  { name: 'Cinematized.', className: 'text-white bg-emerald-600 px-2 rounded-lg' },
];

export function AnimatedCinematized() {
  const [styleIndex, setStyleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const currentStyle = STYLES[styleIndex];
    const fullText = currentStyle.name;

    const handleTyping = () => {
      if (!isDeleting) {
        // Typing
        setDisplayText(fullText.substring(0, displayText.length + 1));
        setTypingSpeed(150);

        if (displayText === fullText) {
          // Finished typing, wait before deleting
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        // Deleting
        setDisplayText(fullText.substring(0, displayText.length - 1));
        setTypingSpeed(75);

        if (displayText === '') {
          setIsDeleting(false);
          setStyleIndex((prev) => (prev + 1) % STYLES.length);
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, styleIndex, typingSpeed]);

  return (
    <span className="inline-grid grid-cols-1 grid-rows-1 text-left align-bottom">
      {/* Invisible placeholder to reserve maximum space for the longest style */}
      <span className="invisible pointer-events-none select-none col-start-1 row-start-1 whitespace-nowrap">
        <span className={cn(STYLES[1].className)}>Cinematized.</span>
      </span>
      
      <span className="col-start-1 row-start-1 inline-flex items-center">
        <span className={cn("transition-all duration-300", STYLES[styleIndex].className)}>
          {displayText}
        </span>
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
          className="w-[3px] h-[1em] bg-emerald-500 ml-1 inline-block align-middle"
        />
      </span>
    </span>
  );
}
