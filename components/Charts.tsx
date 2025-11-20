import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { AssessmentResult, Severity, RiskCategory } from '../types';

interface ChartsProps {
  result: AssessmentResult;
}

const SEVERITY_COLORS = {
  [Severity.LOW]: '#10b981',     // emerald-500
  [Severity.MEDIUM]: '#eab308',  // yellow-500
  [Severity.HIGH]: '#f97316',    // orange-500
  [Severity.CRITICAL]: '#ef4444' // red-500
};

export const CategoryChart: React.FC<ChartsProps> = ({ result }) => {
  // Aggregate data by category
  const categoryCount = result.risks.reduce((acc, risk) => {
    acc[risk.category] = (acc[risk.category] || 0) + 1;
    return acc;
  }, {} as Record<RiskCategory, number>);

  const data = Object.entries(categoryCount).map(([name, count]) => ({
    name: name.replace('_', ' '),
    count: Number(count)
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SeverityDonut: React.FC<ChartsProps> = ({ result }) => {
  // Prepare data for severity distribution
  const severityCount = result.risks.reduce((acc, risk) => {
    acc[risk.severity] = (acc[risk.severity] || 0) + 1;
    return acc;
  }, {} as Record<Severity, number>);

  const data = Object.entries(severityCount).map(([name, value]) => ({
    name,
    value
  }));
  
  // Sort by severity order for consistent display color logic if mapped by index, 
  // but we map by name below so order is less critical for color mapping.
  
  return (
    <div className="h-64 w-full flex items-end justify-center gap-2">
      {/* Simple Custom Bar Chart for Severity Distribution since Recharts Pie can be tricky with labels in small spaces */}
       <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
          <YAxis hide />
          <Tooltip 
            cursor={{fill: 'transparent'}}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name as Severity]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};