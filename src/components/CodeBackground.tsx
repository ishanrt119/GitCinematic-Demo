import React, { useEffect, useRef } from 'react';

export function CodeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const codeSnippets = [
      'analyze(repo)', 'git commit', 'npm install', 'GoogleGenAI', 'sentiment',
      'refactor', 'churn', 'metrics', 'cinematic', 'narrative', '010101',
      'const ai = ...', 'fetch(api)', 'motion.div', 'lucide-react', 'tailwind'
    ];

    const particles: { x: number; y: number; vx: number; vy: number; text: string; size: number; opacity: number }[] = [];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
        size: 10 + Math.random() * 4,
        opacity: 0.1 + Math.random() * 0.2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.font = '10px "JetBrains Mono", monospace';

      particles.forEach((p) => {
        ctx.fillStyle = `rgba(16, 185, 129, ${p.opacity})`; // emerald-500
        ctx.fillText(p.text, p.x, p.y);

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -100) p.x = width + 100;
        if (p.x > width + 100) p.x = -100;
        if (p.y < -50) p.y = height + 50;
        if (p.y > height + 50) p.y = -50;
      });

      requestAnimationFrame(draw);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    const animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-zinc-950">
      {/* Atmospheric Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[150px] animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[100px]" />

      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} 
      />

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%]" />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-40"
      />
    </div>
  );
}
