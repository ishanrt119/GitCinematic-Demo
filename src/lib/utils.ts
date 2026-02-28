import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Commit {
  sha: string;
  author: string;
  date: string;
  message: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface RepoData {
  repoName: string;
  owner: string;
  totalCommits: number;
  contributors: { name: string; count: number }[];
  commits: Commit[];
  metrics: {
    churnRate: number;
    refactorCount: number;
    bugFixes: number;
  };
}
