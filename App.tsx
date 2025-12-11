import React, { useState } from 'react';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import LatexOutput from './components/LatexOutput';
import { analyzePdfPapers, extractPaperAbstract } from './services/geminiService';
import { AppState, PaperResult } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [results, setResults] = useState<PaperResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Use a ref-like pattern for file to access it in the loop without closure issues, 
  // but since we are not using useEffect for the loop (doing it in the handler), 
  // we can pass 'file' directly.

  const handleFileSelect = async (file: File) => {
    setErrorMessage(null);
    setResults([]);
    
    try {
      // Step 1: Analysis
      setAppState(AppState.ANALYZING);
      
      const papers = await analyzePdfPapers(file);
      
      // Initialize results with pending state
      const initialResults: PaperResult[] = papers.map(p => ({
        id: crypto.randomUUID(),
        metadata: p,
        latex: null,
        status: 'pending'
      }));
      
      setResults(initialResults);
      setAppState(AppState.PROCESSING);

      // Step 2: Sequential Processing
      // We process one by one to avoid timeouts and manage rate limits better
      const updatedResults = [...initialResults];

      for (let i = 0; i < updatedResults.length; i++) {
        const resultItem = updatedResults[i];
        
        // Update status to processing for current item
        resultItem.status = 'processing';
        setResults([...updatedResults]); // Trigger re-render
        
        try {
          const latex = await extractPaperAbstract(file, resultItem.metadata);
          
          if (latex.includes("ERROR: Unable to read PDF content")) {
             resultItem.status = 'error';
             resultItem.error = "Content unreadable";
          } else {
             resultItem.status = 'success';
             resultItem.latex = latex;
          }
        } catch (err: any) {
          resultItem.status = 'error';
          resultItem.error = err.message;
        }

        // Update state after processing this item
        updatedResults[i] = { ...resultItem };
        setResults([...updatedResults]);
      }

      setAppState(AppState.FINISHED);

    } catch (error: any) {
      setAppState(AppState.ERROR);
      setErrorMessage(error.message || "Something went wrong during conversion.");
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setResults([]);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Header />

        <main className="flex flex-col items-center">
          {appState === AppState.IDLE && (
            <div className="w-full animate-in fade-in duration-500">
               <FileUploader onFileSelect={handleFileSelect} disabled={false} />
            </div>
          )}

          {appState === AppState.ANALYZING && (
            <div className="flex flex-col items-center justify-center p-12 animate-in fade-in duration-300">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-800">Analyzing PDF Structure...</h3>
              <p className="mt-2 text-slate-500">Identifying papers in the uploaded file.</p>
            </div>
          )}

          {appState === AppState.ERROR && (
            <div className="w-full max-w-xl mx-auto p-6 bg-red-50 border border-red-200 rounded-xl text-center animate-in fade-in duration-300">
               <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                  </svg>
               </div>
               <h3 className="text-lg font-bold text-red-800 mb-2">Analysis Failed</h3>
               <p className="text-red-600 mb-6">{errorMessage}</p>
               <button 
                onClick={handleReset}
                className="px-6 py-2 bg-white border border-red-200 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors shadow-sm"
               >
                 Try Another File
               </button>
            </div>
          )}

          {(appState === AppState.PROCESSING || appState === AppState.FINISHED) && (
            <div className="w-full flex flex-col items-center">
              <LatexOutput results={results} />
              
              {appState === AppState.FINISHED && (
                <button 
                  onClick={handleReset}
                  className="mt-12 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                   Convert Another PDF
                </button>
              )}
              
              {appState === AppState.PROCESSING && (
                <div className="mt-8 flex items-center gap-2 text-slate-500">
                   <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
                   <span className="text-sm">Processing next paper...</span>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;