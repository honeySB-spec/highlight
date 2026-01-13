
interface PDFViewerProps {
    url: string;
}

export function PDFViewer({ url }: PDFViewerProps) {
    return (
        <div className="w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            <iframe
                src={url}
                className="w-full h-full"
                title="PDF Preview"
            />
        </div>
    );
}
