import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  Loader2, 
  Sparkles, 
  Code2, 
  Info,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { RepoData, cn } from '../lib/utils';
import { chatWithRepo } from '../services/ai';
import Markdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface RepositoryAssistantProps {
  repoData: RepoData;
}

export function RepositoryAssistant({ repoData }: RepositoryAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm your Repository Assistant. I've analyzed **${repoData.repoName}** and I'm ready to help you understand the codebase. What would you like to know?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'beginner' | 'technical'>('technical');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 1. Get context from backend
      const contextRes = await fetch('/api/repo/chat-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          repoId: `${repoData.owner}/${repoData.repoName}`,
          question: input 
        }),
      });
      
      const context = await contextRes.json();
      
      // 2. Call Gemini
      const answer = await chatWithRepo(context, input, mode);

      const assistantMessage: Message = {
        role: 'assistant',
        content: answer,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I encountered an error while analyzing the repository. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([messages[0]]);
  };

  return (
    <div className="flex flex-col h-[700px] bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold">Repository Assistant</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Powered by Gemini AI</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
            <button 
              onClick={() => setMode('beginner')}
              className={cn(
                "px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                mode === 'beginner' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-400"
              )}
            >
              Beginner
            </button>
            <button 
              onClick={() => setMode('technical')}
              className={cn(
                "px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                mode === 'technical' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-400"
              )}
            >
              Technical
            </button>
          </div>
          
          <button 
            onClick={clearChat}
            className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.map((msg, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-4 max-w-[85%]",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-lg",
              msg.role === 'assistant' ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"
            )}>
              {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            
            <div className={cn(
              "space-y-2",
              msg.role === 'user' ? "text-right" : ""
            )}>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                msg.role === 'assistant' 
                  ? "bg-zinc-800/50 border border-zinc-800 text-zinc-200" 
                  : "bg-emerald-600 text-white"
              )}>
                <div className="markdown-body prose prose-invert prose-sm max-w-none">
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
              <span className="text-[10px] text-zinc-600 font-mono">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-1 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-800 flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              <span className="text-sm text-zinc-400 font-mono animate-pulse">Analyzing codebase...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-zinc-800 bg-zinc-900/30">
        <div className="relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about the repository..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-600"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:bg-zinc-800 text-white rounded-xl transition-all shadow-lg"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mr-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Suggestions:
          </span>
          {[
            "What does this project do?",
            "Explain the architecture",
            "What libraries are used?",
            "How to run this?"
          ].map((suggestion) => (
            <button 
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full text-[10px] text-zinc-400 transition-all"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
