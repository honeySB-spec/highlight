import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { StatusCard } from './components/StatusCard';
import { ProcessingStatus, HighlightedFile } from './types';
import { processPdf } from './services/pdfProcessor';
import { BookOpen, Download, RefreshCw, ChevronRight, GraduationCap, Eye, Sparkles } from 'lucide-react';

export default function App() {
  const [status, setStatus] = useState<ProcessingStatus>({ step: 'idle', message: '' });
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [result, setResult] = useState<HighlightedFile | null>(null);

  // Clean up original URL
  useEffect(() => {
    return () => {
      if (originalUrl) {
        URL.revokeObjectURL(originalUrl);
      }
    };
  }, [originalUrl]);

  // Clean up result URL
  useEffect(() => {
    return () => {
      if (result?.url) {
        URL.revokeObjectURL(result.url);
      }
    };
  }, [result]);

  const handleFileSelect = async (file: File) => {
    setCurrentFile(file);
    
    // Create immediate preview
    const objectUrl = URL.createObjectURL(file);
    setOriginalUrl(objectUrl);
    
    setResult(null);
    setStatus({ 
      step: 'extracting', 
      message: 'Initializing PDF engine...', 
      progress: 0 
    });

    try {
      const highlightedPdfBytes = await processPdf(file, (step, progress) => {
        let message = '';
        if (step === 'extracting') message = 'Reading text and layout from PDF...';
        if (step === 'analyzing') message = 'Gemini is finding important concepts...';
        if (step === 'highlighting') message = 'Marking important sections...';
        if (step === 'complete') message = 'Analysis complete. You can view or download your highlighted notes below.';
        
        setStatus({
          step: step as any,
          message,
          progress
        });
      });

      // Create a Blob from the bytes
      const blob = new Blob([highlightedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setResult({
        originalName: file.name,
        url,
        timestamp: Date.now()
      });

      setStatus({
        step: 'complete',
        message: 'Analysis complete. You can view or download your highlighted notes below.',
        progress: 100
      });

    } catch (error) {
      console.error(error);
      setStatus({
        step: 'error',
        message: 'Failed to process the PDF.',
        errorDetails: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };

  const handleReset = () => {
    setResult(null);
    setOriginalUrl(null);
    setCurrentFile(null);
    setStatus({ step: 'idle', message: '' });
  };

  const activeUrl = result?.url || originalUrl;
  const isProcessing = status.step !== 'idle' && status.step !== 'complete' && status.step !== 'error';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">SmartNotes</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-sm font-medium text-slate-500">
              Powered by Gemini
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
          
          {/* Left Panel: Controls */}
          <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pb-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Study Smarter, <br />
                <span className="text-indigo-600">Not Harder.</span>
              </h1>
              <p className="text-slate-600">
                Upload your lecture notes or textbook chapters. SmartNotes uses AI to automatically identify and highlight the most important concepts for you.
              </p>
            </div>

            <FileUpload 
              onFileSelect={handleFileSelect} 
              disabled={isProcessing} 
            />

            <StatusCard status={status} />

            {result && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                 <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                   <h3 className="font-semibold text-slate-900 mb-2">Result Ready</h3>
                   <p className="text-sm text-slate-500 mb-4 break-all">
                     {result.originalName}
                   </p>
                   <div className="flex flex-col gap-2">
                     <a 
                       href={result.url} 
                       download={`highlighted-${result.originalName}`}
                       className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm shadow-indigo-200"
                     >
                       <Download className="w-4 h-4" />
                       Download PDF
                     </a>
                     <button
                       onClick={handleReset}
                       className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
                     >
                       <RefreshCw className="w-4 h-4" />
                       Process Another
                     </button>
                   </div>
                 </div>
              </div>
            )}
            
            {/* Guide Steps */}
            {status.step === 'idle' && (
              <div className="mt-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">How it works</h3>
                <div className="space-y-4">
                   {[
                     { title: 'Upload PDF', desc: 'Drag and drop your study material.' },
                     { title: 'AI Analysis', desc: 'Gemini reads and understands the content.' },
                     { title: 'Auto-Highlight', desc: 'Key sentences are marked visually.' },
                     { title: 'Review', desc: 'Download your optimized study guide.' }
                   ].map((step, idx) => (
                     <div key={idx} className="flex items-start gap-3">
                       <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                         {idx + 1}
                       </div>
                       <div>
                         <p className="text-sm font-medium text-slate-900">{step.title}</p>
                         <p className="text-xs text-slate-500">{step.desc}</p>
                       </div>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Preview */}
          <div className="lg:col-span-8 bg-slate-200 rounded-2xl border border-slate-300 overflow-hidden flex flex-col shadow-inner relative">
            {activeUrl ? (
              <div className="w-full h-full relative group">
                <iframe 
                  key={activeUrl}
                  src={`${activeUrl}#toolbar=0&navpanes=0`} 
                  className="w-full h-full"
                  title="PDF Preview"
                  type="application/pdf"
                />
                
                {/* Overlay Badge */}
                <div className="absolute top-4 right-4 pointer-events-none">
                  {result ? (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500 text-white text-xs font-semibold shadow-md animate-in fade-in zoom-in duration-300">
                      <Sparkles className="w-3.5 h-3.5" />
                      Highlighted & Ready
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 backdrop-blur-sm text-white text-xs font-semibold shadow-md">
                      <Eye className="w-3.5 h-3.5" />
                      {isProcessing ? 'Processing Original...' : 'Original Document'}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8">
                  <BookOpen className="w-20 h-20 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Document Preview</p>
                  <p className="text-sm opacity-75 max-w-sm text-center mt-2">
                    Upload a PDF to see the preview here.
                  </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}