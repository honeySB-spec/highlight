import { useState } from 'react';
import { ChevronDown, ChevronRight, AlertCircle, Info } from 'lucide-react';

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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-gray-500">No specific highlights found.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full max-h-[600px]">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    Key Insights ({highlights.length})
                </h3>
            </div>

            <div className="overflow-y-auto flex-1 p-2 space-y-2">
                {highlights.map((item, index) => (
                    <div
                        key={index}
                        className={`
              rounded-lg border transition-all duration-200 cursor-pointer
              ${expandedIndex === index
                                ? 'bg-blue-50 border-blue-200 shadow-sm'
                                : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
                            }
            `}
                        onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    >
                        <div className="p-3 flex items-start gap-3">
                            <div className="mt-1 flex-shrink-0 text-gray-400">
                                {expandedIndex === index ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${expandedIndex === index ? 'text-blue-900' : 'text-gray-700'}`}>
                                    "{item.phrase}"
                                </p>
                                <span className="text-xs text-gray-400 mt-1 block">Page {item.page}</span>
                            </div>
                        </div>

                        {expandedIndex === index && (
                            <div className="px-3 pb-3 ml-7 animate-in slide-in-from-top-2 duration-200">
                                <div className="text-sm text-gray-600 bg-white/60 p-3 rounded-md border border-blue-100">
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
