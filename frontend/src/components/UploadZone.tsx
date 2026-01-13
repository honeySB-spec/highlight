import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils'; // Keep existing utility

interface UploadZoneProps {
    onFileSelect: (file: File) => void;
    isUploading: boolean;
}

export function UploadZone({ onFileSelect, isUploading }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/pdf') {
            handleFile(files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFile = (file: File) => {
        setFileName(file.name);
        onFileSelect(file);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div
            className={cn(
                "relative cursor-pointer overflow-hidden transition-all duration-200 border-2 border-dashed h-64 flex flex-col items-center justify-center p-8 bg-card hover:bg-muted/50 group",
                isDragging ? "border-primary bg-muted" : "border-border hover:border-primary",
                fileName ? "border-primary bg-card" : ""
            )}
            onClick={triggerFileInput}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                accept="application/pdf"
                onChange={handleFileInput}
            />

            <div className="flex flex-col items-center gap-6 text-center z-10 font-mono">
                <div className={cn(
                    "p-0 transition-transform duration-300",
                    isUploading ? "animate-spin" : ""
                )}>
                    {isUploading ? (
                        <Loader2 className="w-10 h-10 text-primary" />
                    ) : fileName ? (
                        <CheckCircle className="w-10 h-10 text-primary" />
                    ) : (
                        <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                </div>

                <div className="space-y-2 uppercase tracking-wide">
                    <h3 className={cn(
                        "text-lg font-bold transition-colors",
                        fileName ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}>
                        {isUploading ? ">> UPLOADING_DATA..." : fileName ? ">> FILE_ACQUIRED" : ">> INITIATE_UPLOAD"}
                    </h3>
                    <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/80">
                        {fileName
                            ? `[ ${fileName} ]`
                            : "[ DROP PDF HERE OR CLICK TO BROWSE ]"}
                    </p>
                </div>
            </div>

            {/* Corner Accents */}
            {!fileName && (
                <>
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-border group-hover:border-primary transition-colors"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-border group-hover:border-primary transition-colors"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-border group-hover:border-primary transition-colors"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-border group-hover:border-primary transition-colors"></div>
                </>
            )}
        </div>
    );
}
