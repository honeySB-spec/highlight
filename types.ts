export interface ProcessingStatus {
  step: 'idle' | 'extracting' | 'analyzing' | 'highlighting' | 'complete' | 'error';
  message: string;
  progress?: number; // 0-100
  errorDetails?: string;
}

export interface HighlightedFile {
  originalName: string;
  url: string;
  timestamp: number;
}

// Internal type for PDF text mapping
export interface TextItemMap {
  str: string;
  transform: number[]; // [scaleX, skewY, skewX, scaleY, x, y]
  width: number;
  height: number;
  globalStartIndex: number; // Index in the concatenated page string
  globalEndIndex: number;
}