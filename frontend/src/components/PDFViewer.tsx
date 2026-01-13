import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    RotateCw,
    Download,
    PanelLeft,
    MoreVertical
} from 'lucide-react';

import 'react-pdf/dist/Page/TextLayer.css';

// Configure worker for Vite
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

interface PDFViewerProps {
    url: string;
}

export function PDFViewer({ url }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [rotation, setRotation] = useState(0);

    const sidebarRef = useRef<HTMLDivElement>(null);
    const activeThumbnailRef = useRef<HTMLDivElement>(null);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    // Scroll thumbnail into view when page changes
    useEffect(() => {
        if (activeThumbnailRef.current && sidebarRef.current) {
            const sidebar = sidebarRef.current;
            const thumbnail = activeThumbnailRef.current;

            const sidebarTop = sidebar.scrollTop;
            const sidebarBottom = sidebarTop + sidebar.clientHeight;
            const thumbnailTop = thumbnail.offsetTop;
            const thumbnailBottom = thumbnailTop + thumbnail.clientHeight;

            if (thumbnailTop < sidebarTop || thumbnailBottom > sidebarBottom) {
                thumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [pageNumber, isSidebarOpen]);

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 3.0));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);

    return (
        <div className="flex flex-col h-[800px] bg-[#323639] border border-gray-700 rounded-lg overflow-hidden shadow-2xl text-gray-100 font-sans">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#2A2D30] border-b border-gray-700 shadow-md z-20">
                {/* Left: Sidebar Toggle & Title */}
                <div className="flex items-center gap-4 w-1/4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={`p-2 rounded-md transition-colors ${isSidebarOpen ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                        title="Toggle Sidebar"
                    >
                        <PanelLeft className="w-5 h-5" />
                    </button>
                    <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-gray-300">
                        <span className="truncate max-w-[150px]">Document.pdf</span>
                    </div>
                </div>

                {/* Center: Pagination & Zoom */}
                <div className="flex items-center justify-center gap-4 flex-1">
                    {/* Pagination */}
                    <div className="flex items-center bg-[#1F2123] rounded-md px-1 py-0.5 border border-gray-600">
                        <button
                            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                            disabled={pageNumber <= 1}
                            className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="px-2 text-sm font-medium border-l border-r border-gray-700 mx-1 min-w-[3rem] text-center">
                            <span className="text-white">{pageNumber}</span>
                            <span className="text-gray-500 mx-1">/</span>
                            <span className="text-gray-400">{numPages || '--'}</span>
                        </div>
                        <button
                            onClick={() => setPageNumber(p => Math.min(numPages || p, p + 1))}
                            disabled={pageNumber >= (numPages || 1)}
                            className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="w-px h-6 bg-gray-600 mx-2" />

                    {/* Zoom */}
                    <div className="flex items-center bg-[#1F2123] rounded-md px-1 py-0.5 border border-gray-600">
                        <button
                            onClick={handleZoomOut}
                            className="p-1 text-gray-400 hover:text-white"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="px-2 text-xs font-medium text-gray-300 min-w-[3rem] text-center">
                            {Math.round(scale * 100)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            className="p-1 text-gray-400 hover:text-white"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Right: Tools */}
                <div className="flex items-center justify-end gap-2 w-1/4">
                    <button onClick={handleRotate} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors" title="Rotate">
                        <RotateCw className="w-5 h-5" />
                    </button>
                    <a href={url} download className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors" title="Download">
                        <Download className="w-5 h-5" />
                    </a>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors" title="More Actions">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden relative">

                {/* Document wrapper context - only load once */}
                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            Loading Document...
                        </div>
                    }
                    className="flex flex-1 overflow-hidden"
                >
                    {/* Sidebar: Thumbnails */}
                    {isSidebarOpen && (
                        <div
                            ref={sidebarRef}
                            className="w-[200px] sm:w-[240px] bg-[#2A2D30] border-r border-gray-800 flex-shrink-0 flex flex-col items-center overflow-y-auto py-4 gap-6 custom-scrollbar z-10"
                        >
                            {numPages && Array.from(new Array(numPages), (_, index) => {
                                const pageNum = index + 1;
                                const isActive = pageNumber === pageNum;
                                return (
                                    <div
                                        key={pageNum}
                                        ref={isActive ? activeThumbnailRef : null}
                                        onClick={() => setPageNumber(pageNum)}
                                        className="group cursor-pointer flex flex-col items-center gap-2"
                                    >
                                        <div className={`relative transition-all duration-200 ${isActive ? 'ring-2 ring-blue-500 shadow-lg scale-[1.02]' : 'hover:ring-1 hover:ring-gray-500/50 opacity-70 hover:opacity-100'}`}>
                                            <div className="bg-white pointer-events-none rounded-sm overflow-hidden">
                                                <Page
                                                    pageNumber={pageNum}
                                                    width={140}
                                                    renderTextLayer={false}
                                                    renderAnnotationLayer={false}
                                                    loading={<div className="w-[140px] h-[180px] bg-white/5 animate-pulse" />}
                                                />
                                            </div>

                                            {/* Page Number Overlay/Label */}
                                            <div className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium px-2 py-0.5 rounded ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                                {pageNum}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Main View */}
                    <div className="flex-1 bg-[#525659] relative overflow-auto flex justify-center p-8 custom-scrollbar">
                        <div className="relative shadow-2xl">
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                rotate={rotation}
                                className="shadow-2xl"
                                renderTextLayer={true}
                                renderAnnotationLayer={false}
                                loading={
                                    <div className="w-[600px] h-[800px] bg-white flex items-center justify-center text-gray-400">
                                        Loading Page...
                                    </div>
                                }
                            />
                        </div>
                    </div>
                </Document>
            </div>
        </div>
    );
}
