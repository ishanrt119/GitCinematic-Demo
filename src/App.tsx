import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { RepoInput } from './components/RepoInput';
import { Charts } from './components/Charts';
import { CinematicOverlay } from './components/CinematicOverlay';
import { RepoData, Commit, cn } from './lib/utils';
import { generateRepoNarrative, generateProjectSummary, RepoNarrative } from './services/ai';
import { detectProjectType } from './lib/detector';
import { ProjectPreview } from './components/ProjectPreview';
import { RepositoryAssistant } from './components/RepositoryAssistant';
import { getMetricInsight, MetricType } from './lib/insights';
import { 
  GitCommit, 
  Users, 
  Activity, 
  AlertCircle, 
  Play, 
  ChevronRight,
  Terminal,
  FileCode,
  TrendingUp,
  ArrowLeft,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { CodeBackground } from './components/CodeBackground';
import { AnimatedCinematized } from './components/AnimatedCinematized';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [narrative, setNarrative] = useState<RepoNarrative | null>(null);
  const [isCinematicMode, setIsCinematicMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'analytics' | 'preview' | 'assistant'>('analytics');
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setActiveTab('analytics');
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      
      const detected = detectProjectType(result.data);
      const previewSummary = await generateProjectSummary(result.data);
      
      const enrichedData = {
        ...result.data,
        preview: {
          ...detected,
          ...previewSummary
        }
      };

      setRepoData(enrichedData);

      if (!result.narrative) {
        const story = await generateRepoNarrative(enrichedData);
        setNarrative(story);
        
        await fetch('/api/save-narrative', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            repoId: `${result.data.owner}/${result.data.repoName}`, 
            narrative: story 
          }),
        });
      } else {
        setNarrative(result.narrative);
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Failed to analyze repository. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setRepoData(null);
    setNarrative(null);
    setIsCinematicMode(false);
    setActiveTab('analytics');
    navigate('/');
  };

  // Redirect if no data on dashboard
  useEffect(() => {
    if (location.pathname === '/dashboard' && !repoData) {
      navigate('/');
    }
  }, [location.pathname, repoData, navigate]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <nav className="border-bottom border-zinc-900 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-zinc-950/50 sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold tracking-tight text-lg">GitInsight AI</span>
          </div>
          
          {repoData && location.pathname === '/dashboard' && (
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-emerald-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Analyze New Repository
            </button>
          )}
        </div>
        
        {repoData && location.pathname === '/dashboard' && (
          <button 
            onClick={() => setIsCinematicMode(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full text-sm font-medium transition-all"
          >
            <Play className="w-4 h-4 text-emerald-500" />
            Play Cinematic Story
          </button>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <Routes>
          <Route path="/" element={
            <div className="py-20 relative">
              <CodeBackground />
              <div className="text-center mb-12 space-y-4 relative z-10">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl md:text-7xl font-bold tracking-tighter"
                >
                  Your Code, <AnimatedCinematized />
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-zinc-400 text-lg max-w-2xl mx-auto"
                >
                  Transform raw Git history into a compelling narrative. Analyze churn, sentiment, and major events with AI.
                </motion.p>
              </div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10"
              >
                <RepoInput onAnalyze={handleAnalyze} isLoading={isLoading} />
              </motion.div>
            </div>
          } />
          
          <Route path="/dashboard" element={
            repoData ? (
              <div className="space-y-8 animate-in fade-in duration-700">
                {/* Tabs */}
                <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800 w-fit">
                  <button 
                    onClick={() => setActiveTab('analytics')}
                    className={cn(
                      "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                      activeTab === 'analytics' ? "bg-emerald-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    Analytics
                  </button>
                  <button 
                    onClick={() => setActiveTab('preview')}
                    className={cn(
                      "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                      activeTab === 'preview' ? "bg-emerald-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    Project Preview
                  </button>
                  <button 
                    onClick={() => setActiveTab('assistant')}
                    className={cn(
                      "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                      activeTab === 'assistant' ? "bg-emerald-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    Repository Assistant
                  </button>
                </div>

                {activeTab === 'analytics' ? (
                  <div className="space-y-8">
                    {/* Hero Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <StatCard 
                        icon={<GitCommit className="w-5 h-5 text-blue-500" />}
                        label="Total Commits"
                        value={repoData.totalCommits.toString()}
                        numericValue={repoData.totalCommits}
                        type="commits"
                      />
                      <StatCard 
                        icon={<Users className="w-5 h-5 text-purple-500" />}
                        label="Contributors"
                        value={repoData.contributors.length.toString()}
                        numericValue={repoData.contributors.length}
                        type="contributors"
                      />
                      <StatCard 
                        icon={<Activity className="w-5 h-5 text-emerald-500" />}
                        label="Churn Rate"
                        value={`${repoData.metrics.churnRate.toFixed(1)}%`}
                        numericValue={repoData.metrics.churnRate}
                        type="churn"
                      />
                      <StatCard 
                        icon={<AlertCircle className="w-5 h-5 text-amber-500" />}
                        label="Refactors"
                        value={repoData.metrics.refactorCount.toString()}
                        numericValue={repoData.metrics.refactorCount}
                        type="refactors"
                      />
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Narrative Panel */}
                      <div className="lg:col-span-1 space-y-6">
                        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl space-y-6">
                          <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">The Narrative</h2>
                            <div className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase rounded tracking-widest">AI Generated</div>
                          </div>
                          
                          {narrative ? (
                            <div className="space-y-6">
                              <p className="text-zinc-400 leading-relaxed italic font-serif text-lg">
                                "{narrative.introduction}"
                              </p>
                              
                              <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4" />
                                  Key Turning Points
                                </h3>
                                <ul className="space-y-3">
                                  {narrative.turningPoints.map((point, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-zinc-300">
                                      <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                      {point}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ) : (
                            <div className="h-40 flex items-center justify-center">
                              <div className="animate-pulse text-zinc-600">Generating story...</div>
                            </div>
                          )}
                        </div>

                        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl">
                          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                            <FileCode className="w-4 h-4" />
                            Major Challenges
                          </h3>
                          <div className="space-y-4">
                            {narrative?.challenges.map((challenge, i) => (
                              <div key={i} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-300">
                                {challenge}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Visualization Panel */}
                      <div className="lg:col-span-2 space-y-8">
                        <Charts commits={repoData.commits} contributors={repoData.contributors} />
                        
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
                          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                            <h3 className="font-bold">Recent Commit History</h3>
                            <span className="text-xs text-zinc-500 font-mono">LATEST 20 COMMITS</span>
                          </div>
                          <div className="divide-y divide-zinc-800">
                            {repoData.commits.slice(0, 10).map((commit) => (
                              <div key={commit.sha} className="p-4 hover:bg-zinc-800/50 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                  <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    commit.sentiment === 'positive' ? "bg-emerald-500" :
                                    commit.sentiment === 'negative' ? "bg-red-500" : "bg-zinc-600"
                                  )} />
                                  <div>
                                    <p className="text-sm font-medium text-zinc-200 line-clamp-1">{commit.message}</p>
                                    <p className="text-xs text-zinc-500">{commit.author} • {new Date(commit.date).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <code className="text-[10px] font-mono text-zinc-600 group-hover:text-zinc-400 transition-colors">
                                  {commit.sha.substring(0, 7)}
                                </code>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activeTab === 'preview' ? (
                  <ProjectPreview repoData={repoData} />
                ) : (
                  <RepositoryAssistant repoData={repoData} />
                )}
              </div>
            ) : null
          } />
        </Routes>
      </main>

      {/* Cinematic Overlay */}
      {isCinematicMode && narrative && (
        <CinematicOverlay 
          narrative={narrative} 
          onClose={() => setIsCinematicMode(false)} 
        />
      )}
    </div>
  );
}

function StatCard({ icon, label, value, numericValue, type }: { icon: React.ReactNode, label: string, value: string, numericValue: number, type: MetricType }) {
  const [showInfo, setShowInfo] = useState(false);
  const insight = getMetricInsight(type, numericValue);

  const explanations: Record<MetricType, string> = {
    commits: "The total number of times code was saved to the project. Think of it as 'saves' in a document.",
    contributors: "The number of unique people who have written code for this project.",
    churn: "How often code is being rewritten or deleted. High churn might mean a lot of changes or 're-doing' work.",
    refactors: "Cleaning up and improving the existing code without changing what it does. Like tidying up a room."
  };
  
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-4 flex flex-col justify-between relative group/card">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg">
            {icon}
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border",
              insight.bgColor,
              insight.borderColor,
              insight.textColor
            )}>
              {insight.status}
            </div>
            <button 
              onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}
              className="p-1 text-zinc-500 hover:text-emerald-500 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div>
          <p className="text-sm text-zinc-400 font-medium">
            {label}
          </p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
        </div>

        <AnimatePresence>
          {showInfo && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute top-14 right-6 left-6 z-20 p-4 bg-zinc-950 border border-emerald-500/20 rounded-xl shadow-2xl backdrop-blur-md"
            >
              <p className="text-xs text-zinc-300 leading-relaxed">
                {explanations[type]}
              </p>
              <div className="absolute -top-1.5 right-2 w-3 h-3 bg-zinc-950 border-t border-l border-emerald-500/20 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="text-[11px] text-zinc-500 leading-relaxed mt-2 border-t border-zinc-800/50 pt-3">
        {insight.explanation}
      </p>
    </div>
  );
}
