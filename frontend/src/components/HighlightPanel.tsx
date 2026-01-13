import { useState } from 'react';
import { ChevronDown, ChevronRight, AlertCircle, Terminal } from 'lucide-react';

interface Highlight {
    phrase: string;
    details: string;
    page: number;
}

interface HighlightPanelProps {
    highlights: Highlight[];
}

export function HighlightPanel({ highlights }: HighlightPanelProps) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    if (!highlights || highlights.length === 0) {
        return (
            <div className="bg-card border border-border p-8 text-center font-mono">
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground uppercase tracking-wider text-xs">No extractable data found.</p>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border flex flex-col h-full max-h-[600px] font-mono">
            <div className="p-4 border-b border-border bg-card sticky top-0 z-10">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-foreground" />
                    EXTRACTED_INSIGHTS [{highlights.length}]
                </h3>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar">
                {highlights.map((item, index) => (
                    <div
                        key={index}
                        className={`
                            border-b border-border group transition-colors cursor-pointer
                            ${expandedIndex === index
                                ? 'bg-muted text-foreground'
                                : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            }
                        `}
                        onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    >
                        <div className="p-4 flex items-start gap-3">
                            <div className="mt-0.5 flex-shrink-0">
                                {expandedIndex === index ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                                <p className={`text-sm leading-relaxed ${expandedIndex === index ? 'font-bold' : 'font-normal'}`}>
                                    "{item.phrase}"
                                </p>
                                <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-60">
                                    <span>[ PAGE_REF: {item.page} ]</span>
                                </div>
                            </div>
                        </div>

                        {expandedIndex === index && (
                            <div className="px-11 pb-6 animate-in slide-in-from-top-1 duration-150">
                                <div className="text-xs leading-relaxed border-l-2 border-foreground pl-4">
                                    <span className="font-bold uppercase tracking-wide block mb-1">Analysis:</span>
                                    {item.details}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
