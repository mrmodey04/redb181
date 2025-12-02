export const HistorySkeleton = () => {
  return (
    <div className="mt-16 w-full">
        <div className="flex items-center justify-between mb-6">
            <div className="h-7 w-40 bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-5 w-24 bg-slate-800 rounded-lg animate-pulse" />
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
                <div 
                    key={i} 
                    className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden h-full animate-pulse flex flex-col"
                >
                    <div className="aspect-square bg-slate-700/50 w-full" />
                    <div className="p-3 space-y-2 flex-1">
                        <div className="h-4 bg-slate-700 rounded w-3/4" />
                        <div className="h-3 bg-slate-700/50 rounded w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};