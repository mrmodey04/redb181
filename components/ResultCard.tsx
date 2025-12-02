import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from './Icons';
import { SEOResult } from '../types';

interface ResultCardProps {
  result: SEOResult;
}

const CopyButton = ({ text, label }: { text: string; label: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-2 bg-slate-700/50 hover:bg-slate-600 rounded-lg transition-all border border-slate-600 group"
      title={`Copy ${label}`}
    >
      <div className="flex items-center gap-2">
        {copied ? (
          <>
            <span className="text-xs text-green-400 font-medium hidden sm:block">Copied!</span>
            <CheckIcon />
          </>
        ) : (
          <CopyIcon />
        )}
      </div>
    </button>
  );
};

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in-up">
      
      {/* Title Section */}
      <div className="relative group">
        <label className="block text-sm font-medium text-slate-400 mb-1">Title (English)</label>
        <div className="relative">
            <textarea
              readOnly
              rows={1}
              className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl p-4 pr-12 text-lg font-semibold focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none resize-none overflow-hidden"
              value={result.title}
            />
            <CopyButton text={result.title} label="Title" />
        </div>
      </div>

      {/* Tags Section */}
      <div className="relative group">
        <label className="block text-sm font-medium text-slate-400 mb-1">
          Tags (Comma Separated)
          <span className="ml-2 text-xs text-red-400/80 bg-red-400/10 px-2 py-0.5 rounded-full">High Priority</span>
        </label>
        <div className="relative">
            <textarea
              readOnly
              rows={3}
              className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-xl p-4 pr-12 text-sm leading-relaxed focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none resize-none"
              value={result.tags}
            />
             <CopyButton text={result.tags} label="Tags" />
        </div>
      </div>

      {/* Description Section */}
      <div className="relative group">
        <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
        <div className="relative">
            <textarea
              readOnly
              rows={4}
              className="w-full bg-slate-800 text-slate-300 border border-slate-700 rounded-xl p-4 pr-12 text-base focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none resize-none"
              value={result.description}
            />
             <CopyButton text={result.description} label="Description" />
        </div>
      </div>

    </div>
  );
};