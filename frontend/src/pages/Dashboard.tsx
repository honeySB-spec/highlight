import { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/clerk-react";
import { UploadZone } from '../components/UploadZone';
import { AnalysisControls } from '../components/AnalysisControls';
import { Results } from '../components/Results';
import { PDFViewer } from '../components/PDFViewer';
import { BookOpen, Github, ArrowLeft } from 'lucide-react';
import { HighlightPanel } from '../components/HighlightPanel';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Link } from 'react-router-dom';

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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export function Dashboard() {
    const { getToken } = useAuth();
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
            const token = await getToken();
            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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
            const token = await getToken();
            const response = await fetch(`${API_URL}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
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

    const handleUpgrade = async () => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/create-checkout-session`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error("Failed to start checkout", data);
                alert("Failed to start checkout");
            }
        } catch (e) {
            console.error(e);
            alert("Error starting checkout");
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFD] text-gray-900 font-sans selection:bg-blue-100">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[128px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/40 rounded-full blur-[128px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">

                {/* Navigation / Header */}
                <div className="flex items-center justify-between mb-12">
                    <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>

                    <div className="flex items-center gap-4">
                        <SignedIn>
                            <button onClick={handleUpgrade} className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all text-sm hover:-translate-y-0.5">
                                Upgrade to Pro
                            </button>
                            <UserButton />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="px-4 py-2 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                    </div>
                </div>

                {/* Header */}
                <header className="mb-12 text-center space-y-4">
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">
                        Dashboard
                    </h1>
                    <p className="text-gray-500">
                        Upload and manage your documents
                    </p>
                </header>

                {/* Main Content */}
                <div className="space-y-8">
                    <SignedIn>
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
                                                    url={`${API_URL}${result.download_url}`}
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

                    </SignedIn>

                    <SignedOut>
                        <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800">Sign in to start analyzing PDFs</h2>
                            <SignInButton mode="modal">
                                <button className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                                    Get Started for Free
                                </button>
                            </SignInButton>
                        </div>
                    </SignedOut>
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
