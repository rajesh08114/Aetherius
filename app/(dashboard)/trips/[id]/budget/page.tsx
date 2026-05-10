'use client';

import { useBudget } from '@/hooks/useBudget';
import { useAIOptimize } from '@/hooks/useAI';
import { PageTransition } from '@/components/shared/PageTransition';
import { motion } from 'framer-motion';
import { Loader2, TrendingDown, DollarSign, Wallet, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function BudgetPage({ params }: { params: { id: string } }) {
  const { data: budget, isLoading } = useBudget(params.id);
  const { mutate: optimize, data: optData, isPending } = useAIOptimize();
  const [showAI, setShowAI] = useState(false);

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-amber-500 w-8 h-8" /></div>;
  if (!budget) return <div>No budget data</div>;

  const handleOptimize = () => {
    setShowAI(true);
    optimize(params.id);
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-syne font-bold text-slate-100 flex items-center">
              <Wallet className="w-8 h-8 mr-3 text-amber-500" />
              Budget Tracker
            </h1>
            <p className="text-slate-400 mt-1">Monitor costs and find savings</p>
          </div>
          <button 
            onClick={handleOptimize}
            disabled={isPending || showAI}
            className="flex items-center px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 rounded-lg font-bold shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <TrendingDown className="w-4 h-4 mr-2" />}
            AI Optimize
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border-slate-800">
            <h3 className="text-sm font-medium text-slate-400 mb-1">Total Estimated</h3>
            <div className="text-3xl font-syne font-bold text-slate-100">{budget.currency} {budget.totalEstimated}</div>
          </div>
          <div className="glass-card p-6 rounded-2xl border-slate-800">
            <h3 className="text-sm font-medium text-slate-400 mb-1">Budget Limit</h3>
            <div className="text-3xl font-syne font-bold text-slate-100">{budget.currency} {budget.budgetLimit || 'N/A'}</div>
          </div>
          <div className="glass-card p-6 rounded-2xl border-slate-800">
            <h3 className="text-sm font-medium text-slate-400 mb-1">Status</h3>
            <div className="text-3xl font-syne font-bold text-amber-500">{Math.round(budget.percentUsed)}% Used</div>
          </div>
        </div>

        {/* AI Suggestions Box */}
        {showAI && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-amber-500 mb-4">
              <SparklesIcon className="w-5 h-5" />
              <h3 className="font-bold text-lg">AI Savings Opportunities</h3>
            </div>
            
            {isPending ? (
              <div className="flex items-center text-amber-500/70"><Loader2 className="animate-spin w-4 h-4 mr-2" /> Analyzing itinerary...</div>
            ) : optData?.data ? (
              <div className="space-y-4">
                <div className="text-green-400 font-medium">Potential Savings: {budget.currency} {optData.data.totalPotentialSaving}</div>
                <div className="space-y-2">
                  {optData.data.savings.map((s: any, i: number) => (
                    <div key={i} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <div className="font-medium text-slate-200">{s.item} → {s.suggestedAlternative}</div>
                        <div className="text-xs text-slate-400 mt-1 capitalize">Difficulty: {s.difficulty}</div>
                      </div>
                      <div className="text-green-400 font-bold">-{budget.currency} {s.estimatedSaving}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg text-sm text-slate-300 border-l-2 border-amber-500">
                  <span className="font-bold">Pro Tip: </span> {optData.data.topTip}
                </div>
              </div>
            ) : null}
          </motion.div>
        )}

      </div>
    </PageTransition>
  );
}

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);
