import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';
import { identifyImportantQuotes } from './gemini';
import { TextItemMap } from '../types';

// Configure worker. 
// Note: In a real production build, you might want to bundle the worker.
// Using CDN for runtime compatibility in this specific environment.
// IMPORTANT: Use esm.sh to match the main library import source and ensure consistent module behavior
// This resolves "Failed to fetch dynamically imported module" errors often seen with unpkg in this context
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface ProgressCallback {
  (step: string, progress: number): void;
}

export const processPdf = async (file: File, onProgress: ProgressCallback): Promise<Uint8Array> => {
  // 1. Load PDF with PDF.js to extract text coordinates
  const arrayBuffer = await file.arrayBuffer();
  
  // Create a copy of the buffer for pdf-lib since pdfjs might detach it or modify access patterns
  const arrayBufferForPdfLib = arrayBuffer.slice(0);

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  // 2. Load PDF with pdf-lib to modify it
  const pdfLibDoc = await PDFDocument.load(arrayBufferForPdfLib);

  onProgress('extracting', 10);

  // Process page by page
  for (let i = 1; i <= numPages; i++) {
    onProgress('analyzing', 10 + Math.floor((i / numPages) * 80));
    
    // A. Extract Text & Map Coordinates
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    
    // We build a concatenated string of the page to send to Gemini
    // And a map to trace back characters to their PDF coordinates
    let fullPageText = '';
    const textMap: TextItemMap[] = [];

    // Filter and map items
    for (const item of textContent.items) {
      if ('str' in item) {
        const str = item.str;
        // Skip empty whitespace items that often clutter layout
        if (str.trim().length === 0) {
            fullPageText += str; // Keep spacing for natural reading
            continue;
        }

        const startIdx = fullPageText.length;
        fullPageText += str;
        const endIdx = fullPageText.length;

        textMap.push({
          str: str,
          transform: item.transform, // [scaleX, skewY, skewX, scaleY, x, y]
          width: item.width,
          height: item.height || 0, // Sometimes height is implicit
          globalStartIndex: startIdx,
          globalEndIndex: endIdx
        });
      }
      fullPageText += ' '; 
    }

    // B. Get Important Highlights from Gemini
    const quotesToHighlight = await identifyImportantQuotes(fullPageText);

    // C. Draw Highlights
    if (quotesToHighlight.length > 0) {
      const pdfLibPage = pdfLibDoc.getPage(i - 1); // pdf-lib is 0-indexed
      
      // Helper to find text items that overlap with a text range
      const findItemsInRange = (start: number, end: number) => {
        return textMap.filter(item => 
          (item.globalStartIndex >= start && item.globalStartIndex < end) || // Starts inside
          (item.globalEndIndex > start && item.globalEndIndex <= end) ||     // Ends inside
          (item.globalStartIndex <= start && item.globalEndIndex >= end)     // Encompasses
        );
      };

      for (const quote of quotesToHighlight) {
        // Find all occurrences of the quote in the page
        let searchIndex = 0;
        while (true) {
          const foundIndex = fullPageText.indexOf(quote, searchIndex);
          if (foundIndex === -1) break;
          
          const endIndex = foundIndex + quote.length;
          const matchingItems = findItemsInRange(foundIndex, endIndex);

          // Draw a rectangle for each matching text item
          for (const item of matchingItems) {
            // Transform[4] is x, Transform[5] is y (bottom-left of text baseline)
            // Transform[3] is roughly font size (vertical scale)
            const x = item.transform[4];
            const y = item.transform[5];
            const w = item.width;
            const h = item.transform[3]; // Approx height

            // Draw yellow highlight
            pdfLibPage.drawRectangle({
              x: x,
              y: y - (h * 0.2), // Adjust slightly for descenders
              width: w,
              height: h * 1.4,  // Make highlight taller than just the font
              color: rgb(1, 1, 0),
              opacity: 0.4,
            });
          }

          searchIndex = foundIndex + 1;
        }
      }
    }
  }

  onProgress('complete', 100);
  const pdfBytes = await pdfLibDoc.save();
  return pdfBytes;
};