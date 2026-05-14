
import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { Button } from './Button';

interface PdfPreviewerProps {
  pdfDoc: jsPDF | null;
  scale?: number; // Prop para controlar el zoom externamente
  pageNumber?: number; // Prop para controlar la página externamente
  onLoadSuccess?: (totalPages: number) => void; // Callback al cargar el PDF
}

const PdfPreviewer: React.FC<PdfPreviewerProps> = ({ pdfDoc, scale, pageNumber, onLoadSuccess }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  
  const [pdfProxy, setPdfProxy] = useState<PDFDocumentProxy | null>(null);
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use external props if provided, otherwise internal state
  const zoomLevel = scale !== undefined ? scale : 1.0; // Default internal zoom could be state, but simplifying for managed mode
  const currentPage = pageNumber !== undefined ? pageNumber : internalCurrentPage;

  // Load PDF
  useEffect(() => {
    const loadPdf = async () => {
      if (!pdfDoc) {
        setPdfProxy(null);
        setTotalPages(0);
        setInternalCurrentPage(1);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const pdfData = pdfDoc.output('arraybuffer');
        const pdfjsLib = (window as any).pdfjsLib; 
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const loadedPdf = await loadingTask.promise;
        
        setPdfProxy(loadedPdf);
        setTotalPages(loadedPdf.numPages);
        if (onLoadSuccess) {
            onLoadSuccess(loadedPdf.numPages);
        }
        
        // Reset internal page only if not controlled externally or just as a safe default
        if (pageNumber === undefined) setInternalCurrentPage(1);

      } catch (e) {
        console.error("Error loading PDF:", e);
        setError("Error al cargar la previsualización.");
      } finally {
        setIsLoading(false);
      }
    };
    loadPdf();
  }, [pdfDoc]); // Remove scale/pageNumber from dependency to avoid reload loop, just render loop below

  // Render Page
  useEffect(() => {
    if (!pdfProxy || !canvasRef.current || !scrollContainerRef.current) return;

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }
    
    const renderPage = async () => {
        try {
            // Validate page number
            const safePage = Math.max(1, Math.min(currentPage, totalPages));
            const page = await pdfProxy.getPage(safePage);
            
            const container = scrollContainerRef.current;
            if (!container) return;

            const containerWidth = container.clientWidth - 60; 
            const containerHeight = container.clientHeight - 60;
            
            const unscaledViewport = page.getViewport({ scale: 1 });
            const scaleX = containerWidth / unscaledViewport.width;
            const scaleY = containerHeight / unscaledViewport.height;
            
            const baseScale = Math.min(scaleX, scaleY); 
            const finalScale = baseScale * zoomLevel;
            const outputScale = window.devicePixelRatio || 1;

            const viewport = page.getViewport({ scale: finalScale });

            const canvas = canvasRef.current;
            const context = canvas?.getContext('2d');
            
            if (context && canvas) {
                canvas.width = Math.floor(viewport.width * outputScale);
                canvas.height = Math.floor(viewport.height * outputScale);
                
                canvas.style.width = `${Math.floor(viewport.width)}px`;
                canvas.style.height = `${Math.floor(viewport.height)}px`;

                const transform = outputScale !== 1 
                  ? [outputScale, 0, 0, outputScale, 0, 0] 
                  : undefined;

                const renderContext = {
                    canvasContext: context,
                    transform: transform,
                    viewport: viewport,
                };
                
                const task = page.render(renderContext as any);
                renderTaskRef.current = task;
                await task.promise;
                renderTaskRef.current = null;
            }
        } catch (e: any) {
            if (e.name !== 'RenderingCancelledException') {
                console.error(`Error rendering page ${currentPage}:`, e);
            }
        }
    };

    const handleResize = () => {
        if (zoomLevel === 1.0) renderPage();
    };
    window.addEventListener('resize', handleResize);

    renderPage();
    
    return () => {
        window.removeEventListener('resize', handleResize);
        if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
            renderTaskRef.current = null;
        }
    };
  }, [pdfProxy, currentPage, zoomLevel, totalPages]); 
  
  // Internal handlers
  const handlePrevPage = () => setInternalCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setInternalCurrentPage(prev => Math.min(prev + 1, totalPages));
  
  // Simple internal zoom if needed (though now mostly controlled externally)
  const [internalZoom, setInternalZoom] = useState(1.0);
  const handleZoomIn = () => setInternalZoom(prev => Math.min(prev + 0.25, 3.0)); 
  const handleZoomOut = () => setInternalZoom(prev => Math.max(prev - 0.25, 0.5)); 
  const handleResetZoom = () => setInternalZoom(1.0);

  if (isLoading) return <div className="flex h-full items-center justify-center text-muted-foreground"><span className="material-symbols-outlined animate-spin mr-2">sync</span> Generando vista previa...</div>;
  if (error) return <div className="flex h-full items-center justify-center text-destructive">{error}</div>;
  if (!pdfDoc || !pdfProxy) return <div className="flex h-full items-center justify-center text-muted-foreground">No hay documento disponible.</div>;

  return (
    <div className="relative w-full h-full bg-neutral-900/10 dark:bg-neutral-900/40 overflow-hidden group" ref={containerRef}>
        
        <div className="absolute inset-0 overflow-auto custom-scrollbar flex items-start justify-center p-12" ref={scrollContainerRef}>
             <canvas ref={canvasRef} className="shadow-2xl bg-card transition-transform duration-200 ease-out origin-top" />
        </div>

        {/* Mostrar controles internos SOLO si no se controlan externamente */}
        {(scale === undefined && pageNumber === undefined) && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md text-neutral-50 px-4 py-2 rounded-2xl shadow-2xl z-50 transition-all opacity-0 group-hover:opacity-100 hover:opacity-100 border border-neutral-50/10">
                <div className="flex items-center gap-2 border-r border-neutral-50/20 pr-4 mr-2">
                    <button onClick={handlePrevPage} disabled={currentPage <= 1} className="p-1 hover:text-primary disabled:opacity-30 transition-colors" title="Página Anterior">
                        <span className="material-symbols-outlined text-xl">chevron_left</span>
                    </button>
                    <span className="text-xs font-bold font-mono min-w-[40px] text-center">{currentPage}/{totalPages}</span>
                    <button onClick={handleNextPage} disabled={currentPage >= totalPages} className="p-1 hover:text-primary disabled:opacity-30 transition-colors" title="Página Siguiente">
                        <span className="material-symbols-outlined text-xl">chevron_right</span>
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleZoomOut} className="p-1 hover:text-primary transition-colors" title="Alejar">
                        <span className="material-symbols-outlined text-xl">remove</span>
                    </button>
                    <button onClick={handleResetZoom} className="text-xs font-bold px-2 py-1 rounded hover:bg-neutral-50/10 transition-colors min-w-[50px]" title="Ajustar a pantalla">
                        {Math.round(zoomLevel * 100)}%
                    </button>
                    <button onClick={handleZoomIn} className="p-1 hover:text-primary transition-colors" title="Acercar">
                        <span className="material-symbols-outlined text-xl">add</span>
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default PdfPreviewer;
