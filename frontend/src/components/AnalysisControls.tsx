
import { Sparkles, FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface AnalysisControlsProps {
    onAnalyze: () => void;
    isProcessing: boolean;
    disabled: boolean;
}

export function AnalysisControls({
    onAnalyze,
    isProcessing,
    disabled
}: AnalysisControlsProps) {

    return (
        <div className="w-full max-w-xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 text-center">
            <Label className="text-sm font-medium block mb-2 text-gray-600">
                Ready to analyze your document?
            </Label>

            <div className="flex justify-center">
                <Button
                    onClick={onAnalyze}
                    disabled={disabled || isProcessing}
                    size="lg"
                    className="flex items-center gap-2 min-w-[200px] h-12 text-base shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    {isProcessing ? (
                        <>
                            <FileSearch className="w-5 h-5 animate-pulse" />
                            Analyzing with Gemini...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            Analyze & Highlight
                        </>
                    )}
                </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
                Powered by Google Gemini AI
            </p>
        </div>
    );
}
