'use client';

import { Printer } from 'lucide-react';

export function ExportButton({ tripName }: { tripName: string }) {
  const handlePrint = () => {
    // In a real implementation, you might use html2pdf.js here
    // For now, we use standard browser print which we style via CSS
    window.print();
  };

  return (
    <button 
      onClick={handlePrint}
      className="flex items-center px-4 py-2 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md text-amber-500 rounded-lg font-medium transition-colors border border-slate-700 shadow-lg print:hidden"
    >
      <Printer className="w-4 h-4 mr-2" />
      Export PDF
    </button>
  );
}
