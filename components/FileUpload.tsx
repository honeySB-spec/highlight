import React, { useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type === 'application/pdf') {
          onFileSelect(file);
        } else {
          alert('Please upload a PDF file.');
        }
      }
    },
    [onFileSelect, disabled]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`relative w-full border-2 border-dashed rounded-xl p-10 transition-all duration-200 ease-in-out
        ${disabled 
          ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60' 
          : 'border-indigo-200 bg-indigo-50/50 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer'
        }
      `}
    >
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className={`p-4 rounded-full ${disabled ? 'bg-slate-100' : 'bg-indigo-100'}`}>
          <Upload className={`w-8 h-8 ${disabled ? 'text-slate-400' : 'text-indigo-600'}`} />
        </div>
        <div>
          <h3 className={`text-lg font-semibold ${disabled ? 'text-slate-400' : 'text-indigo-900'}`}>
            Upload your notes
          </h3>
          <p className={`text-sm mt-1 ${disabled ? 'text-slate-400' : 'text-indigo-600/80'}`}>
            Drag & drop or click to browse
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <FileText className="w-4 h-4" />
          <span>PDF files only (max 10MB)</span>
        </div>
      </div>
    </div>
  );
};