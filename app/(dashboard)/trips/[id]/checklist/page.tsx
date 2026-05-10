'use client';

import { useAIChecklist } from '@/hooks/useAI';
import { PageTransition } from '@/components/shared/PageTransition';
import { CheckSquare, Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function ChecklistPage({ params }: { params: { id: string } }) {
  const { mutate: generateList, data, isPending } = useAIChecklist();
  const [items, setItems] = useState<any[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = () => {
    setHasGenerated(true);
    generateList(params.id, {
      onSuccess: (res) => {
        setItems(res.data || []);
      }
    });
  };

  const toggleItem = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, packed: !item.packed } : item));
  };

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-syne font-bold text-slate-100 flex items-center">
              <CheckSquare className="w-8 h-8 mr-3 text-amber-500" />
              Packing List
            </h1>
            <p className="text-slate-400 mt-1">Don&apos;t forget the essentials</p>
          </div>
        </div>

        {!hasGenerated ? (
          <div className="glass-card p-12 text-center border-dashed rounded-2xl">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">Smart Packing List</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Our AI can analyze your destinations, planned activities, and local weather forecasts to generate a custom packing list.
            </p>
            <button 
              onClick={handleGenerate}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl font-bold transition-colors shadow-lg shadow-amber-500/20"
            >
              Generate AI Checklist
            </button>
          </div>
        ) : isPending ? (
          <div className="flex flex-col items-center justify-center p-20 glass-card rounded-2xl">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-4" />
            <p className="text-slate-400">Analyzing weather patterns and itinerary...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {['documents', 'clothing', 'electronics', 'toiletries', 'misc'].map(category => {
              const catItems = items.filter(i => i.category === category);
              if (catItems.length === 0) return null;
              
              return (
                <div key={category} className="glass-card p-6 rounded-2xl border-slate-800">
                  <h3 className="text-lg font-bold text-amber-500 capitalize mb-4 border-b border-slate-800 pb-2">{category}</h3>
                  <div className="space-y-3">
                    {catItems.map((item: any) => (
                      <div key={item.id} className="flex items-start">
                        <input 
                          type="checkbox" 
                          checked={item.packed} 
                          onChange={() => toggleItem(item.id)}
                          className="mt-1 w-4 h-4 rounded border-slate-600 text-amber-500 focus:ring-amber-500 bg-slate-800"
                        />
                        <div className="ml-3">
                          <div className={`font-medium ${item.packed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            {item.quantity > 1 ? `${item.quantity}x ` : ''}{item.label}
                            {item.essential && <span className="ml-2 text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">Essential</span>}
                          </div>
                          {item.weatherReason && (
                            <div className="text-xs text-blue-400 mt-0.5">{item.weatherReason}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
