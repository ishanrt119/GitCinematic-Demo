import React, { useState } from 'react';
import { Folder, File, ChevronRight, ChevronDown, Search } from 'lucide-react';
import { cn } from '../lib/utils';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  children?: FileNode[];
}

interface DirectoryExplorerProps {
  files: string[];
  onFileSelect: (path: string) => void;
  selectedPath?: string;
}

export function DirectoryExplorer({ files, onFileSelect, selectedPath }: DirectoryExplorerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ '': true });
  const [search, setSearch] = useState('');

  // Build tree from flat list of paths
  const buildTree = (paths: string[]): FileNode => {
    const root: FileNode = { name: 'root', path: '', type: 'dir', children: [] };
    
    paths.forEach(path => {
      const parts = path.split('/');
      let current = root;
      
      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        const currentPath = parts.slice(0, index + 1).join('/');
        
        let child = current.children?.find(c => c.name === part);
        if (!child) {
          child = {
            name: part,
            path: currentPath,
            type: isLast ? 'file' : 'dir',
            children: isLast ? undefined : []
          };
          current.children?.push(child);
        }
        current = child;
      });
    });

    // Sort: dirs first, then alphabetically
    const sortTree = (node: FileNode) => {
      if (node.children) {
        node.children.sort((a, b) => {
          if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
        node.children.forEach(sortTree);
      }
    };
    sortTree(root);
    return root;
  };

  const tree = buildTree(files.filter(f => f.toLowerCase().includes(search.toLowerCase())));

  const toggleExpand = (path: string) => {
    setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const renderNode = (node: FileNode, depth: number = 0) => {
    if (node.name === 'root') {
      return node.children?.map(child => renderNode(child, depth));
    }

    const isExpanded = expanded[node.path];
    const isSelected = selectedPath === node.path;

    return (
      <div key={node.path} className="select-none">
        <div
          onClick={() => node.type === 'dir' ? toggleExpand(node.path) : onFileSelect(node.path)}
          className={cn(
            "flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors group",
            isSelected ? "bg-emerald-500/10 text-emerald-400" : "hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {node.type === 'dir' ? (
            <>
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <Folder className={cn("w-4 h-4", isExpanded ? "text-emerald-500" : "text-zinc-500")} />
            </>
          ) : (
            <>
              <div className="w-4" />
              <File className={cn("w-4 h-4", isSelected ? "text-emerald-400" : "text-zinc-500")} />
            </>
          )}
          <span className="text-sm truncate">{node.name}</span>
          {node.type === 'file' && (
            <span className="ml-auto text-[10px] opacity-0 group-hover:opacity-50 uppercase tracking-tighter">
              {node.name.split('.').pop()}
            </span>
          )}
        </div>
        
        {node.type === 'dir' && isExpanded && node.children && (
          <div className="mt-0.5">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-zinc-900">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {renderNode(tree)}
      </div>
    </div>
  );
}
