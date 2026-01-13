import React from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SearchControlsProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onSearch: () => void;
    isProcessing: boolean;
    disabled: boolean;
}

export function SearchControls({
    searchTerm,
    setSearchTerm,
    onSearch,
    isProcessing,
    disabled
}: SearchControlsProps) {

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !disabled && !isProcessing) {
            onSearch();
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            <Label className="text-sm font-medium ml-1">
                What are you looking for?
            </Label>
            <div className="flex w-full items-center space-x-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={disabled}
                        className="pl-9"
                        placeholder="Enter keyword to search and highlight..."
                    />
                </div>
                <Button
                    onClick={onSearch}
                    disabled={disabled || !searchTerm.trim() || isProcessing}
                    className="flex items-center gap-2"
                >
                    {isProcessing ? (
                        <>Processing...</>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4" />
                            Highlight
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
