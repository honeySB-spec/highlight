import { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/clerk-react";
import { UploadZone } from '../components/UploadZone';
import { AnalysisControls } from '../components/AnalysisControls';
import { Results } from '../components/Results';
import { PDFViewer } from '../components/PDFViewer';
import { HighlightPanel } from '../components/HighlightPanel';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ModeToggle } from '../components/mode-toggle';
import { aiAnalyzer } from '../services/ai';
import type { InitProgressReport } from '@mlc-ai/web-llm';

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

export function AppPage() {
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

        try {
            // Step 1: Initialize AI Engine
            setProgress({ current: 0, total: 100, message: 'Initializing AI Model (this may download ~2GB first time)...' });

            await aiAnalyzer.initialize((report: InitProgressReport) => {
                const percent = Math.round(report.progress * 100);
                setProgress({
                    current: percent,
                    total: 100,
                    message: report.text
                });
            });

            // Step 2: Extract Text from Backend
            setProgress({ current: 0, total: 100, message: 'Extracting text from document...' });

            const token = await getToken();
            const response = await fetch(`${API_URL}/extract-text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ filename }),
            });

            if (!response.ok) throw new Error('Text extraction failed');

            const data = await response.json();
            const pages = data.pages; // Expecting [{page: 1, text: "..."}, ...]

            if (!pages || pages.length === 0) {
                throw new Error('No text found in document');
            }

            // Step 3: Analyze each page locally
            const totalPages = pages.length;
            const allHighlights: Highlight[] = [];

            for (let i = 0; i < totalPages; i++) {
                const pageData = pages[i];
                setProgress({
                    current: i + 1,
                    total: totalPages,
                    message: `Analyzing page ${i + 1} of ${totalPages}...`
                });

                const highlights = await aiAnalyzer.analyzeText(pageData.text);

                // Add page number to highlights
                const pageHighlights = highlights.map(h => ({
                    ...h,
                    page: pageData.page
                }));

                allHighlights.push(...pageHighlights);
            }

            // Complete
            setResult({
                matches: allHighlights.length,
                download_url: `/download/analyzed_${filename}`, // Note: This file won't exist yet on backend effectively, 
                // client-side highlighting on PDF not implemented yet in this flow.
                // For now, we show the results in the panel.
                highlights: allHighlights
            });

            setProgress(null);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Analysis failed.');
            setProgress(null);
        } finally {
            setIsProcessing(false);
        }
    };

    // Removed handleUpgrade function as minimal theme might not emphasize upgrades immediately or styling needs update
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
        <div className="min-h-screen bg-background text-foreground font-mono selection:bg-primary selection:text-primary-foreground">
            <div className="fixed inset-0 z-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">

                {/* Navigation / Header */}
                <div className="flex items-center justify-between mb-12 border-b border-border pb-4">
                    <div className="text-sm md:text-base font-bold tracking-tighter">
                        SMARTHIGHLIGHT_V2.0
                    </div>

                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        <SignedIn>
                            <button onClick={handleUpgrade} className="px-3 py-1 bg-background border border-yellow-600 text-yellow-500 hover:bg-yellow-600 hover:text-background transition-colors text-xs font-bold uppercase tracking-wider">
                                [ PRO_ACCESS ]
                            </button>
                            <div className="filter grayscale hover:grayscale-0 transition-all">
                                <UserButton />
                            </div>
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="px-4 py-2 border border-muted-foreground/30 text-muted-foreground hover:border-foreground hover:text-foreground transition-colors uppercase text-sm">
                                    [ AUTHENTICATE ]
                                </button>
                            </SignInButton>
                        </SignedOut>
                    </div>
                </div>

                {/* Header */}
                <header className="mb-12 space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground uppercase">
                        // System_Core
                    </h1>
                    <p className="text-muted-foreground text-sm uppercase tracking-wide">
                        Ready for input...
                    </p>
                </header>

                {/* Main Content */}
                <div className="space-y-8">
                    <SignedIn>
                        {/* Upload Section */}
                        <div className="max-w-3xl mx-auto border border-border p-1 bg-background">
                            <UploadZone
                                onFileSelect={handleFileSelect}
                                isUploading={isUploading}
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 border border-destructive bg-destructive/10 text-destructive font-bold uppercase tracking-wide text-center max-w-2xl mx-auto">
                                [ ERROR: {error} ]
                            </div>
                        )}


                        {/* Controls Section - Only show if file is uploaded */}
                        {filename && (
                            <>
                                <div className="max-w-3xl mx-auto">
                                    <div className="border border-border p-4 bg-background">
                                        <AnalysisControls
                                            onAnalyze={handleAnalyze}
                                            isProcessing={isProcessing}
                                            disabled={isUploading || isProcessing}
                                        />
                                        {progress && (
                                            <div className="mt-4">
                                                <div className="flex justify-between text-xs text-gray-500 mb-1 uppercase">
                                                    <span>Progress</span>
                                                    <span>{(progress.total > 0 ? (progress.current / progress.total) * 100 : 0).toFixed(0)}%</span>
                                                </div>
                                                <ProgressBar
                                                    progress={progress.total > 0 ? (progress.current / progress.total) * 100 : 0}
                                                    message={progress.message}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Application Layout: PDF + Panel */}
                                {result && (
                                    <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">

                                        {/* Left Column: PDF Viewer */}
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex justify-between">
                                                <span>[ SOURCE_DOCUMENT ]</span>
                                                <span className="text-green-500">[ PROCESSED ]</span>
                                            </h3>
                                            <div className="h-[600px] bg-muted border border-border overflow-hidden">
                                                <PDFViewer
                                                    url={`${API_URL}${result.download_url}`}
                                                />
                                            </div>
                                        </div>

                                        {/* Right Column: Highlights Panel */}
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                                [ EXTRACTION_RESULTS ]
                                            </h3>
                                            <div className="h-[600px] border border-border bg-background">
                                                <HighlightPanel highlights={result.highlights} />
                                            </div>
                                        </div>

                                    </div>
                                )}

                                {/* Legacy Results Section (Optional - kept for download button) */}
                                {result && (
                                    <div className="max-w-2xl mx-auto mt-8 border-t border-gray-800 pt-8">
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
                        <div className="text-center py-20 border border-border border-dashed">
                            <h2 className="text-xl font-bold mb-6 text-foreground uppercase tracking-wider">Authentication Required</h2>
                            ;

                            <SignInButton mode="modal">
                                <button className="px-8 py-4 bg-foreground text-background font-bold uppercase hover:bg-muted-foreground transition-all">
                                    [ INITIALIZE_SESSION ]
                                </button>
                            </SignInButton>
                        </div>
                    </SignedOut>
                </div>

                {/* Footer */}
                <footer className="mt-32 text-center text-muted-foreground text-xs uppercase tracking-widest flex items-center justify-center gap-6 border-t border-border pt-8">
                    <div className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer">
                        <span>[ DOCS ]</span>
                    </div>
                    <div className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer">
                        <span>[ SOURCE ]</span>
                    </div>
                </footer>

            </div>
        </div>
    );
}
