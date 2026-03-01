import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface Issue {
  type: 'error' | 'warning' | 'info';
  line: number;
  description: string;
}

interface CodeViewerProps {
  repoId: string;
  path: string;
  onClose?: () => void;
}

export function CodeViewer({ repoId, path, onClose }: CodeViewerProps) {
  const [content, setContent] = useState<string>('');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/repo/file?repoId=${repoId}&path=${encodeURIComponent(path)}`);
        const data = await res.json();
        setContent(data.content);
        setIssues(data.issues || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, [repoId, path]);

  const getLanguage = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx': return 'javascript';
      case 'ts':
      case 'tsx': return 'typescript';
      case 'py': return 'python';
      case 'go': return 'go';
      case 'java': return 'java';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'md': return 'markdown';
      default: return 'text';
    }
  };

  return (
    <div className="flex h-full bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden relative">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-12 border-b border-zinc-900 flex items-center justify-between px-4 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2 truncate">
            <span className="text-xs font-mono text-zinc-500">{path.split('/').slice(0, -1).join('/')}/</span>
            <span className="text-sm font-bold text-zinc-100">{path.split('/').pop()}</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-zinc-900 rounded-lg transition-colors">
              <X className="w-4 h-4 text-zinc-500" />
            </button>
          )}
        </div>

        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/50 z-20">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Editor
              height="100%"
              language={getLanguage(path)}
              theme="vs-dark"
              value={content}
              options={{
                readOnly: true,
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                scrollbar: {
                  vertical: 'visible',
                  horizontal: 'visible',
                },
                padding: { top: 16, bottom: 16 },
                automaticLayout: true,
              }}
              beforeMount={(monaco) => {
                monaco.editor.defineTheme('git-insight-dark', {
                  base: 'vs-dark',
                  inherit: true,
                  rules: [],
                  colors: {
                    'editor.background': '#09090b',
                  }
                });
              }}
              onMount={(editor, monaco) => {
                monaco.editor.setTheme('git-insight-dark');
              }}
            />
          )}
        </div>
      </div>

      {/* Issues Sidebar */}
      <div className="w-80 border-l border-zinc-900 flex flex-col bg-zinc-950/50 backdrop-blur-sm">
        <div className="h-12 border-b border-zinc-900 flex items-center px-4">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Detected Issues</span>
          <span className="ml-auto bg-zinc-900 text-zinc-400 text-[10px] px-1.5 py-0.5 rounded-full border border-zinc-800">
            {issues.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-30">
              <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center">
                <Info className="w-6 h-6" />
              </div>
              <p className="text-xs">No issues detected in this file.</p>
            </div>
          ) : (
            issues.map((issue, i) => (
              <div 
                key={i} 
                className={cn(
                  "p-3 rounded-lg border text-xs space-y-1 transition-all hover:scale-[1.02]",
                  issue.type === 'error' ? "bg-red-500/5 border-red-500/20 text-red-400" :
                  issue.type === 'warning' ? "bg-orange-500/5 border-orange-500/20 text-orange-400" :
                  "bg-blue-500/5 border-blue-500/20 text-blue-400"
                )}
              >
                <div className="flex items-center gap-2 font-bold uppercase tracking-tighter">
                  {issue.type === 'error' ? <AlertCircle className="w-3 h-3" /> :
                   issue.type === 'warning' ? <AlertTriangle className="w-3 h-3" /> :
                   <Info className="w-3 h-3" />}
                  <span>{issue.type}</span>
                  <span className="ml-auto opacity-50">Line {issue.line}</span>
                </div>
                <p className="leading-relaxed opacity-90">{issue.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
