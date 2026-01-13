import { useState } from 'react';
import { UploadZone } from './components/UploadZone';
import { AnalysisControls } from './components/AnalysisControls';
import { Results } from './components/Results';
import { PDFViewer } from './components/PDFViewer';
import { BookOpen, Github } from 'lucide-react';
import { HighlightPanel } from './components/HighlightPanel';
import { ProgressBar } from './components/ui/ProgressBar';

interface Highlight {
  phrase: string;
  details: string;
  page: number;
}

interface ProcessResult {
  matches: number;
  download_url: string;
  highlights: Highlight[];
}

function App() {
  const [filename, setFilename] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [progress, setProgress] = useState<{ current: number; total: number; message: string } | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setResult(null);
    setProgress(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5001/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setFilename(data.filename);
    } catch (err) {
      console.error(err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!filename) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);
    setProgress({ current: 0, total: 100, message: 'Starting...' });

    try {
      const response = await fetch('http://localhost:5001/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Process all complete lines
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const data = JSON.parse(line);

            if (data.type === 'progress') {
              setProgress({
                current: data.current,
                total: data.total,
                message: data.message
              });
            } else if (data.type === 'complete') {
              setResult(data.data);
              setProgress(null); // Clear progress when done
            } else if (data.type === 'error') {
              throw new Error(data.message);
            }
          } catch (e) {
            console.error('Error parsing stream data:', e);
          }
        }
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to analyze PDF. Please ensure the backend is running and API key is set.');
      setProgress(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFD] text-gray-900 font-sans selection:bg-blue-100">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[128px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/40 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-20">

        {/* Header */}
        <header className="mb-16 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-medium text-gray-600 mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-green-500" />
            V 2.0.0 (Gemini AI)
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 animate-in fade-in slide-in-from-top-8 duration-700">
            Smart PDF Highlight
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-top-12 duration-700 delay-100">
            Automatically extract and highlight key insights using AI. <br className="hidden md:block" />
            Powered by Google Gemini.
          </p>
        </header>

        {/* Main Content */}
        <div className="space-y-8">

          {/* Upload Section */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 max-w-2xl mx-auto">
            <UploadZone
              onFileSelect={handleFileSelect}
              isUploading={isUploading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-center animate-in shake max-w-2xl mx-auto">
              {error}
            </div>
          )}


          {/* Controls Section - Only show if file is uploaded */}
          {filename && (
            <>
              <div className="max-w-2xl mx-auto">
                <AnalysisControls
                  onAnalyze={handleAnalyze}
                  isProcessing={isProcessing}
                  disabled={isUploading || isProcessing}
                />
                {progress && (
                  <ProgressBar
                    progress={progress.total > 0 ? (progress.current / progress.total) * 100 : 0}
                    message={progress.message}
                    className="mt-4"
                  />
                )}
              </div>

              {/* Application Layout: PDF + Panel */}
              {result && (
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">

                  {/* Left Column: PDF Viewer */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center justify-between">
                      <span>Highlighted Document</span>
                      <span className="text-sm font-normal text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">Analysis Complete</span>
                    </h3>
                    <div className="h-[600px] bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                      <PDFViewer
                        url={`http://localhost:5001${result.download_url}`}
                      />
                    </div>
                  </div>

                  {/* Right Column: Highlights Panel */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">
                      Analysis Results
                    </h3>
                    <div className="h-[600px]">
                      <HighlightPanel highlights={result.highlights} />
                    </div>
                  </div>

                </div>
              )}

              {/* Legacy Results Section (Optional - kept for download button) */}
              {result && (
                <div className="max-w-2xl mx-auto mt-8">
                  <Results
                    matchCount={result.matches}
                    downloadUrl={result.download_url}
                  />
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer */}
        <footer className="mt-32 text-center text-gray-400 text-sm flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 hover:text-gray-600 transition-colors cursor-pointer">
            <BookOpen className="w-4 h-4" />
            <span>Documentation</span>
          </div>
          <div className="flex items-center gap-2 hover:text-gray-600 transition-colors cursor-pointer">
            <Github className="w-4 h-4" />
            <span>Source Code</span>
          </div>
        </footer>

      </div>
    </div>
  );
}

export default App;
