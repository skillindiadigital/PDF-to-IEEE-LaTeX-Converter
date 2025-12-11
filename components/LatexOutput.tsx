import React, { useState } from 'react';
import { PaperResult } from '../types';

interface LatexOutputProps {
  results: PaperResult[];
}

const LatexOutput: React.FC<LatexOutputProps> = ({ results }) => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-indigo-600">
          <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" />
          <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
        </svg>
        Converted Papers ({results.filter(r => r.status === 'success').length}/{results.length})
      </h2>

      <div className="space-y-6">
        {results.map((result) => (
          <PaperCard key={result.id} result={result} />
        ))}
      </div>
    </div>
  );
};

const PaperCard: React.FC<{ result: PaperResult }> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result.latex) return;
    try {
      await navigator.clipboard.writeText(result.latex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const isProcessing = result.status === 'processing';
  const isPending = result.status === 'pending';
  const isError = result.status === 'error';
  const isSuccess = result.status === 'success';

  return (
    <div className={`
      relative rounded-xl overflow-hidden border transition-all duration-300
      ${isPending ? 'bg-slate-50 border-slate-200 opacity-75' : ''}
      ${isProcessing ? 'bg-white border-indigo-300 ring-4 ring-indigo-50/50 shadow-lg' : ''}
      ${isSuccess ? 'bg-white border-slate-200 shadow-md hover:shadow-lg' : ''}
      ${isError ? 'bg-red-50 border-red-200' : ''}
    `}>
      {/* Header Section */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`
            flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0
            ${isSuccess ? 'bg-green-100 text-green-700' : ''}
            ${isProcessing ? 'bg-indigo-100 text-indigo-700 animate-pulse' : ''}
            ${isPending ? 'bg-slate-200 text-slate-500' : ''}
            ${isError ? 'bg-red-100 text-red-700' : ''}
          `}>
            {result.metadata.index}
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Paper Title</h3>
            <p className="font-semibold text-slate-900 leading-tight">
              {result.metadata.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           {isProcessing && (
              <span className="flex items-center gap-2 text-indigo-600 text-sm font-medium">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
           )}
           {isError && (
              <span className="text-red-600 text-sm font-medium bg-red-100 px-2 py-1 rounded">
                Extraction Failed
              </span>
           )}
           {isSuccess && (
            <button
              onClick={handleCopy}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 border shrink-0
                ${copied 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'
                }
              `}
            >
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                    <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                  </svg>
                  Copy LaTeX
                </>
              )}
            </button>
           )}
        </div>
      </div>

      {/* Content Section */}
      {(isSuccess || isError) && (
        <div className="relative group bg-slate-900 border-t border-slate-700">
           {isSuccess ? (
             <textarea
               readOnly
               value={result.latex || ''}
               className="w-full h-48 p-4 bg-slate-900 text-slate-50 font-mono text-xs sm:text-sm focus:outline-none resize-none"
               spellCheck={false}
             />
           ) : (
             <div className="p-4 text-red-400 text-sm font-mono">
                Error: {result.error || "Unable to extract content."}
             </div>
           )}
        </div>
      )}
      
      {isPending && (
         <div className="h-2 bg-slate-100 w-full" />
      )}
    </div>
  );
}

export default LatexOutput;