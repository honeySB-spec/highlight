import React, { useState } from 'react';
import { Download, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface ResultsProps {
    matchCount: number;
    downloadUrl: string;
}

export function Results({ matchCount, downloadUrl }: ResultsProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const fullDownloadUrl = downloadUrl.startsWith('http')
        ? downloadUrl
        : `http://localhost:5001${downloadUrl}`;

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
        <Card className="w-full max-w-xl mx-auto mt-8 animate-in zoom-in-95 duration-500">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-full text-green-600 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Processing Complete!</h3>
                        <p className="text-muted-foreground">
                            Found <span className="font-bold text-foreground">{matchCount}</span> occurrences.
                        </p>
                    </div>
                </div>

                <Button
                    size="lg"
                    className="shadow-lg min-w-[160px]"
                    onClick={handleDownload}
                    disabled={isDownloading}
                >
                    {isDownloading ? (
                        <>
                            <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                            Downloading...
                        </>
                    ) : (
                        <>
                            <Download className="mr-2 w-5 h-5" />
                            Download PDF
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
