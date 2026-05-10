export function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-4 overflow-hidden relative w-full h-64">
      <div className="absolute inset-0 bg-slate-800/50 animate-shimmer bg-gradient-to-r from-slate-800/0 via-slate-700/50 to-slate-800/0" style={{ backgroundSize: '1000px 100%' }} />
      <div className="relative z-10 flex flex-col h-full space-y-4">
        <div className="w-full h-32 bg-slate-700/50 rounded-xl" />
        <div className="w-3/4 h-6 bg-slate-700/50 rounded-md" />
        <div className="w-1/2 h-4 bg-slate-700/50 rounded-md mt-auto" />
      </div>
    </div>
  );
}
