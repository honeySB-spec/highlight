import { useState } from 'react';
import { UploadZone } from './components/UploadZone';
import { SearchControls } from './components/SearchControls';
import { Results } from './components/Results';
import { PDFViewer } from './components/PDFViewer';
import { BookOpen, Github } from 'lucide-react';

interface ProcessResult {
  matches: number;
  download_url: string;
}

function App() {
  const [filename, setFilename] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setResult(null); // Reset previous results

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

  const handleSearch = async () => {
    if (!filename || !searchTerm.trim()) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5001/highlight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename,
          search_term: searchTerm,
        }),
      });

      if (!response.ok) {
        throw new Error('Processing failed');
      }

      const data = await response.json();
      setResult({
        matches: data.matches,
        download_url: data.download_url
      });
    } catch (err) {
      console.error(err);
      setError('Failed to process PDF. Please try again.');
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

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">

        {/* Header */}
        <header className="mb-16 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-medium text-gray-600 mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-green-500" />
            V 1.0.0
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 animate-in fade-in slide-in-from-top-8 duration-700">
            PDF Smart Highlight
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-top-12 duration-700 delay-100">
            Instantly search and highlight keywords in your PDF documents. <br className="hidden md:block" />
            Secure, fast, and runs locally on your machine.
          </p>
        </header>

        {/* Main Content */}
        <div className="space-y-8">

          {/* Upload Section */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <UploadZone
              onFileSelect={handleFileSelect}
              isUploading={isUploading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-center animate-in shake">
              {error}
            </div>
          )}


          {/* Controls Section - Only show if file is uploaded */}
          {filename && (
            <>
              <SearchControls
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onSearch={handleSearch}
                isProcessing={isProcessing}
                disabled={isUploading || isProcessing}
              />

              {/* PDF Preview Section */}
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  {result ? 'Highlighted Result' : 'Document Preview'}
                </h3>
                <PDFViewer
                  url={result
                    ? `http://localhost:5001${result.download_url}`
                    : `http://localhost:5001/uploads/${filename}`
                  }
                />
              </div>

              {/* Results Section */}
              {result && (
                <Results
                  matchCount={result.matches}
                  downloadUrl={result.download_url}
                />
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
