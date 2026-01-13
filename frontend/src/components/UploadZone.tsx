import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Card, CardContent } from '@/components/ui/card';

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
        <Card
            className={cn(
                "relative cursor-pointer overflow-hidden transition-all duration-300 ease-in-out border-2 border-dashed",
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                fileName ? "border-green-500/50 bg-green-50/30" : ""
            )}
            onClick={triggerFileInput}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <CardContent className="h-64 flex flex-col items-center justify-center p-8">
                <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    accept="application/pdf"
                    onChange={handleFileInput}
                />

                <div className="flex flex-col items-center gap-4 text-center z-10 transition-transform duration-300">
                    <div className={cn(
                        "p-4 rounded-full transition-all duration-500",
                        fileName ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary"
                    )}>
                        {isUploading ? (
                            <Loader2 className="w-8 h-8 animate-spin" />
                        ) : fileName ? (
                            <CheckCircle className="w-8 h-8" />
                        ) : (
                            <Upload className="w-8 h-8" />
                        )}
                    </div>

                    <div className="space-y-1">
                        <h3 className={cn(
                            "text-lg font-semibold transition-colors duration-300",
                            fileName ? "text-green-700" : "text-foreground"
                        )}>
                            {isUploading ? "Uploading..." : fileName ? "PDF Uploaded" : "Upload your PDF"}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                            {fileName
                                ? fileName
                                : "Drag & drop or click to browse. Only PDF files are supported."}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
