import { Sparkles, FileSearch } from 'lucide-react';

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
        <div className="w-full text-center font-mono">
            <div className="flex flex-col items-center gap-4">
                <button
                    onClick={onAnalyze}
                    disabled={disabled || isProcessing}
                    className={`
                        group relative flex items-center justify-center gap-3 w-full max-w-xs h-14 text-base font-bold uppercase tracking-wider
                        transition-all duration-200 border border-input
                        ${disabled || isProcessing
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        }
                    `}
                >
                    {isProcessing ? (
                        <>
                            <FileSearch className="w-5 h-5 animate-pulse" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            [ RUN_ANALYSIS ]
                        </>
                    )}
                </button>

                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    // AI MODEL: GEMINI PRO 2.0
                </p>
            </div>
        </div>
    );
}
