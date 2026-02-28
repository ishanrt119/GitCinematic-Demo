import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Play, 
  Box, 
  Layout, 
  Server, 
  FileText, 
  CheckCircle2, 
  Loader2,
  ExternalLink,
  Code2
} from 'lucide-react';
import { RepoData, cn } from '../lib/utils';

interface ProjectPreviewProps {
  repoData: RepoData;
}

export function ProjectPreview({ repoData }: ProjectPreviewProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  const preview = repoData.preview;

  if (!preview) return null;

  const handleSimulate = () => {
    setIsSimulating(true);
    setSimulationResult(null);
    
    // Simulate execution delay
    setTimeout(() => {
      setIsSimulating(false);
      
      // Generate mocked output based on type
      if (preview.projectType.includes("Node") || preview.framework === "React") {
        setSimulationResult("Compiled successfully. Local server running at http://localhost:3000\n\n[Vite] hot module replacement enabled\n[Vite] dev server running...");
      } else if (preview.projectType === "Static Website") {
        setSimulationResult("Opening index.html in browser...\nRendering components...\nPage loaded successfully.");
      } else if (preview.framework === "Express" || preview.projectType === "Python") {
        setSimulationResult("Server started on port 8000\nGET /api/health 200 OK\nGET /api/data 200 OK\nListening for requests...");
      } else {
        setSimulationResult("Execution complete.\nOutput: " + preview.expectedOutput);
      }
    }, 2000);
  };

  const getIcon = () => {
    if (preview.framework === "React" || preview.projectType === "Static Website") return <Layout className="w-5 h-5" />;
    if (preview.framework === "Express" || preview.projectType === "Python") return <Server className="w-5 h-5" />;
    return <Box className="w-5 h-5" />;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info & Features */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                  {getIcon()}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{preview.projectType}</h3>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">{preview.framework}</p>
                </div>
              </div>
              <div className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-[10px] font-mono text-zinc-400">
                {preview.entryPoint}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Project Purpose</h4>
                <p className="text-sm text-zinc-300 leading-relaxed">{preview.projectPurpose}</p>
              </div>
              
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Expected Output</h4>
                <p className="text-sm text-zinc-300 leading-relaxed">{preview.expectedOutput}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800/50">
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Main Features
              </h4>
              <ul className="space-y-3">
                {preview.mainFeatures.map((feature, i) => (
                  <li key={i} className="flex gap-3 text-sm text-zinc-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/30 mt-1.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              How to Run
            </h4>
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 font-mono text-xs text-emerald-500/80 leading-relaxed">
              {preview.howToRun}
            </div>
          </div>
        </div>

        {/* Right Column: Preview & Simulation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col h-full min-h-[500px]">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/30" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
                </div>
                <span className="text-xs font-mono text-zinc-500 ml-4">PREVIEW_MODE: SIMULATED</span>
              </div>
              <button 
                onClick={handleSimulate}
                disabled={isSimulating}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full text-xs font-bold transition-all shadow-lg shadow-emerald-900/20"
              >
                {isSimulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                {isSimulating ? 'SIMULATING...' : 'SIMULATE EXECUTION'}
              </button>
            </div>

            <div className="flex-1 p-8 flex flex-col items-center justify-center relative overflow-hidden">
              <AnimatePresence mode="wait">
                {isSimulating ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="flex flex-col items-center gap-4 text-center"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                      <Code2 className="w-6 h-6 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-zinc-400 font-mono text-sm animate-pulse">Building project environment...</p>
                  </motion.div>
                ) : simulationResult ? (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full flex flex-col gap-6"
                  >
                    <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 font-mono text-sm text-zinc-400 overflow-auto max-h-[300px] shadow-inner">
                      {simulationResult.split('\n').map((line, i) => (
                        <div key={i} className="mb-1">
                          <span className="text-emerald-500 mr-2">$</span>
                          {line}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex-1 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center p-8 bg-zinc-900/20">
                      {preview.framework === "React" || preview.projectType === "Static Website" ? (
                        <>
                          <Layout className="w-12 h-12 text-zinc-700 mb-4" />
                          <h5 className="font-bold text-zinc-400 mb-2">Visual Output Placeholder</h5>
                          <p className="text-sm text-zinc-500 max-w-xs">In a live environment, the rendered frontend would appear here.</p>
                        </>
                      ) : (
                        <>
                          <Server className="w-12 h-12 text-zinc-700 mb-4" />
                          <h5 className="font-bold text-zinc-400 mb-2">Backend Service Active</h5>
                          <p className="text-sm text-zinc-500 max-w-xs">The API is now listening for incoming connections on the simulated port.</p>
                        </>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center space-y-4"
                  >
                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-zinc-800">
                      <Play className="w-8 h-8 text-zinc-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-400">Ready to Execute</h4>
                      <p className="text-sm text-zinc-500 max-w-xs mx-auto">Click the button above to simulate how this project behaves in a real environment.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Background Decoration */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
