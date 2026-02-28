export type MetricType = 'commits' | 'contributors' | 'churn' | 'refactors';

export interface MetricInsight {
  status: string;
  color: string;
  explanation: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
}

export function getMetricInsight(type: MetricType, value: number): MetricInsight {
  switch (type) {
    case 'commits':
      if (value < 20) {
        return {
          status: 'Early Stage Project',
          color: 'blue',
          explanation: 'Project is in early development phase.',
          textColor: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
        };
      } else if (value <= 100) {
        return {
          status: 'Active Development',
          color: 'green',
          explanation: 'Repository shows steady development activity.',
          textColor: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/20',
        };
      } else {
        return {
          status: 'Mature Project',
          color: 'purple',
          explanation: 'Project has significant development history.',
          textColor: 'text-purple-400',
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/20',
        };
      }

    case 'contributors':
      if (value === 1) {
        return {
          status: 'Solo Project',
          color: 'blue',
          explanation: 'Maintained by a single developer.',
          textColor: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
        };
      } else if (value <= 5) {
        return {
          status: 'Small Team',
          color: 'green',
          explanation: 'Collaborative development with a small team.',
          textColor: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/20',
        };
      } else {
        return {
          status: 'Active Community',
          color: 'purple',
          explanation: 'Project has strong collaborative activity.',
          textColor: 'text-purple-400',
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/20',
        };
      }

    case 'churn':
      if (value < 10) {
        return {
          status: 'Stable Codebase',
          color: 'green',
          explanation: 'Minimal code changes. System is stable.',
          textColor: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/20',
        };
      } else if (value <= 25) {
        return {
          status: 'Moderate Changes',
          color: 'yellow',
          explanation: 'Codebase is evolving but stable.',
          textColor: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20',
        };
      } else if (value <= 40) {
        return {
          status: 'High Activity',
          color: 'orange',
          explanation: 'Frequent modifications detected.',
          textColor: 'text-orange-400',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/20',
        };
      } else {
        return {
          status: 'High Volatility',
          color: 'red',
          explanation: 'Heavy rewrites may indicate instability.',
          textColor: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
        };
      }

    case 'refactors':
      if (value === 0) {
        return {
          status: 'No Structural Improvements',
          color: 'gray',
          explanation: 'No major architecture improvements detected.',
          textColor: 'text-zinc-400',
          bgColor: 'bg-zinc-500/10',
          borderColor: 'border-zinc-500/20',
        };
      } else if (value <= 3) {
        return {
          status: 'Improving Architecture',
          color: 'green',
          explanation: 'Some structural refinements detected.',
          textColor: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/20',
        };
      } else {
        return {
          status: 'Active Optimization',
          color: 'blue',
          explanation: 'System is actively being optimized.',
          textColor: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
        };
      }

    default:
      return {
        status: 'Unknown',
        color: 'gray',
        explanation: 'No data available.',
        textColor: 'text-zinc-400',
        bgColor: 'bg-zinc-500/10',
        borderColor: 'border-zinc-500/20',
      };
  }
}
