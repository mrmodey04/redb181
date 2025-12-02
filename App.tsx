import React, { useState, useEffect } from 'react';
import { generateSEO } from './services/geminiService';
import { Uploader } from './components/Uploader';
import { ResultCard } from './components/ResultCard';
import { ErrorBanner } from './components/ErrorBanner';
import { HistorySkeleton } from './components/HistorySkeleton';
import { SparklesIcon, TrashIcon, SearchIcon } from './components/Icons';
import { SEOResult, HistoryItem } from './types';

const App = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Current active session
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<SEOResult | null>(null);
  const [descriptionLength, setDescriptionLength] = useState<'short' | 'long'>('long');
  
  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Load history on mount
  useEffect(() => {
    const loadHistory = () => {
      try {
        const saved = localStorage.getItem('rb_seo_history');
        if (saved) {
          const parsed = JSON.parse(saved);
          // Data Migration: Ensure every item has a unique ID
          const sanitizedHistory = parsed.map((item: any) => ({
            ...item,
            id: item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2))
          }));
          setHistory(sanitizedHistory);
        }
      } catch (e) {
        console.error("Failed to load history:", e);
      } finally {
        setIsHistoryLoading(false);
      }
    };

    // Small timeout to prevent UI flickering on fast loads and allow skeleton to be seen
    setTimeout(loadHistory, 600);
  }, []);

  // Save history with quota protection, only if loaded
  useEffect(() => {
    if (isHistoryLoading) return;

    try {
      localStorage.setItem('rb_seo_history', JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save history (likely storage quota exceeded):", e);
      // Optional: Logic to trim history if quota exceeded could go here
    }
  }, [history, isHistoryLoading]);

  const handleImageUpload = async (base64: string, mimeType: string, previewUrl: string) => {
    setLoading(true);
    setError(null);
    setCurrentImage(previewUrl);
    setCurrentResult(null);

    try {
      const result = await generateSEO(base64, mimeType, descriptionLength);
      setCurrentResult(result);

      // Add to history with fallback ID generation
      const newItem: HistoryItem = {
        ...result,
        id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(),
        imageUrl: previewUrl,
        timestamp: Date.now(),
      };
      // Keep last 50 items
      setHistory(prev => [newItem, ...prev].slice(0, 50));

    } catch (err) {
      console.error(err);
      setError("Failed to generate SEO data. Please ensure the image is valid and try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setCurrentImage(item.imageUrl);
    setCurrentResult(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearHistory = () => {
      if(window.confirm('Are you sure you want to clear all history? This cannot be undone.')) {
          setHistory([]);
          localStorage.removeItem('rb_seo_history');
      }
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    
    if (window.confirm('Delete this image?')) {
        setHistory(prev => prev.filter(item => item.id !== id));
    }
  };

  const clearCurrentSession = () => {
    if (window.confirm('Delete the current image?')) {
        setCurrentImage(null);
        setCurrentResult(null);
    }
  };

  // Filter history based on search term
  const filteredHistory = history.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 pb-20 flex flex-col">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <SparklesIcon />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
              Redbubble SEO Gen 2025
            </h1>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Powered by Gemini 2.5
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Uploader & Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  1. Upload Design
                </h2>
                {/* Description Length Toggle */}
                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700" title="Description Length">
                  <button
                    onClick={() => setDescriptionLength('short')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      descriptionLength === 'short' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    Short
                  </button>
                  <button
                    onClick={() => setDescriptionLength('long')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      descriptionLength === 'long' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    Long
                  </button>
                </div>
              </div>

              <Uploader 
                onImageSelected={handleImageUpload} 
                isLoading={loading}
                onError={setError} 
              />
              
              {currentImage && (
                <div className="mt-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-400">Current Preview:</p>
                    <button 
                        type="button"
                        onClick={clearCurrentSession}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                        title="Delete current image"
                    >
                        <TrashIcon /> Delete Image
                    </button>
                  </div>
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center">
                    <img 
                      src={currentImage} 
                      alt="Preview" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
            
            {error && (
              <ErrorBanner 
                message={error} 
                onDismiss={() => setError(null)} 
              />
            )}
          </div>

          {/* RIGHT COLUMN: Results */}
          <div className="lg:col-span-7">
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 shadow-xl min-h-[500px]">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                2. SEO Results (English)
              </h2>
              
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4 py-20 opacity-60">
                  <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-400 animate-pulse">Analyzing visual elements...</p>
                  <p className="text-xs text-slate-500">Generating Tags & Title...</p>
                </div>
              ) : currentResult ? (
                <ResultCard result={currentResult} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 py-20">
                  <p>Upload an image to generate metadata.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* History Section */}
        {isHistoryLoading ? (
            <HistorySkeleton />
        ) : history.length > 0 && (
          <div className="mt-16 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h3 className="text-xl font-bold text-white">Recent Uploads</h3>
                
                <div className="flex items-center gap-4 flex-1 justify-end w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative w-full md:max-w-xs group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg leading-5 bg-slate-800 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 sm:text-sm transition-all"
                            placeholder="Search history..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button 
                        onClick={clearHistory}
                        className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors shrink-0 whitespace-nowrap px-3 py-2 rounded-lg hover:bg-red-500/10"
                    >
                        <TrashIcon /> <span className="hidden sm:inline">Clear History</span>
                    </button>
                </div>
            </div>
            
            {filteredHistory.length === 0 ? (
                 <div className="text-center py-12 text-slate-500 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                    <p>No results found for "{searchTerm}"</p>
                 </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredHistory.map((item) => (
                    <div 
                    key={item.id} 
                    className="group relative bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 transition-all"
                    >
                    {/* Delete Button (Updated: Higher z-index, explicit button type, removed opacity constraints on mobile for better usability) */}
                    <button
                        type="button"
                        onClick={(e) => deleteHistoryItem(e, item.id)}
                        className="absolute top-2 right-2 z-30 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                        title="Delete Image"
                        aria-label="Delete Image"
                    >
                        <TrashIcon /> 
                    </button>

                    {/* Clickable Card Content */}
                    <div 
                        onClick={() => loadFromHistory(item)}
                        className="cursor-pointer h-full w-full flex flex-col"
                    >
                        <div className="aspect-square bg-slate-900 p-2 flex items-center justify-center">
                            <img src={item.imageUrl} alt={item.title} className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="p-3">
                            <p className="text-sm font-medium text-slate-200 truncate" title={item.title}>
                            {item.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                            {new Date(item.timestamp).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            )}
          </div>
        )}
      </main>

      <footer className="w-full text-center py-6 border-t border-slate-800/50 mt-auto bg-slate-900/30">
        <p className="text-red-400 text-sm font-medium">
          Powered by poha181
        </p>
      </footer>
    </div>
  );
};

export default App;