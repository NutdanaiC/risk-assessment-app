import React from 'react';
import { Severity } from '../types';

interface SeverityBadgeProps {
  level: Severity;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ level, className = '' }) => {
  const styles = {
    [Severity.LOW]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [Severity.MEDIUM]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    [Severity.HIGH]: 'bg-orange-100 text-orange-700 border-orange-200',
    [Severity.CRITICAL]: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[level]} ${className}`}>
      {level}
    </span>
  );
};