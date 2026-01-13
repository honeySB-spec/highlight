import React, { useState } from 'react';
import { toast } from 'sonner';

interface ResultsProps {
    matchCount: number;
    downloadUrl: string;
}

export function Results({ matchCount, downloadUrl }: ResultsProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const fullDownloadUrl = downloadUrl.startsWith('http')
        ? downloadUrl
        : `${API_URL}${downloadUrl}`;

    // Extract filename from URL or default to 'highlighted.pdf'
    const fileName = fullDownloadUrl.split('/').pop() || 'highlighted.pdf';

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDownloading(true);

        try {
            const response = await fetch(fullDownloadUrl);
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Download started');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download file. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto mt-8 font-mono animate-in zoom-in-95 duration-500">
            <div className="border-2 border-black dark:border-white p-6 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white dark:bg-black">
                <div className="flex items-center gap-4">
                    <div className="text-xl font-bold select-none">
                        [SUCCESS]
                    </div>
                    <div>
                        <h3 className="text-lg font-bold uppercase">Processing Complete</h3>
                        <p className="text-sm">
                            Found [{matchCount}] occurrences.
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="min-w-[160px] px-4 py-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:opacity-50 uppercase font-bold text-sm tracking-wider"
                >
                    {isDownloading ? (
                        '[ DOWNLOADING... ]'
                    ) : (
                        '[ DOWNLOAD PDF ]'
                    )}
                </button>
            </div>
        </div>
    );
}
