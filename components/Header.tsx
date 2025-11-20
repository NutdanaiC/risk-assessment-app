import React from 'react';
import { ShieldAlert, Menu } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-orange-500" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">Sentinel AI</h1>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Risk Assessment Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-slate-800 transition-colors">
              <Menu className="h-6 w-6 text-slate-300" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};