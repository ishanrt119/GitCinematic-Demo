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
  files?: string[];
  readme?: string;
  packageJson?: any;
  preview?: ProjectPreviewData;
}

export interface ProjectPreviewData {
  projectType: string;
  framework: string;
  entryPoint: string;
  projectPurpose: string;
  expectedOutput: string;
  howToRun: string;
  mainFeatures: string[];
}
