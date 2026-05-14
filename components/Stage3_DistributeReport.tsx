
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { FindData } from '../types';
import { Button } from './common/Button';
import { generatePdfFromJson } from '../utils/pdfGenerator';
import { useToast } from '../contexts/ToastContext';
import { jsPDF } from 'jspdf';
import PdfPreviewer from './common/PdfPreviewer';

interface Stage3DistributeReportProps {
  onSave: () => void;
  onNavigateToDashboard: () => void;
  findData: FindData;
}

const Stage3DistributeReport: React.FC<Stage3DistributeReportProps> = ({ onNavigateToDashboard, findData }) => {
  const { showToast } = useToast();
  const [selectedEntityIdx, setSelectedEntityIdx] = useState(0);
  const [activePdf, setActivePdf] = useState<jsPDF | null>(null);
  
  // PDF Controls State
  const [pdfScale, setPdfScale] = useState(1.0);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfTotalPages, setPdfTotalPages] = useState(0);
  
  const entities = useMemo(() => {
    let rawEntities = [];
    if (findData?.batchResults && findData.batchResults.length > 0) {
        rawEntities = findData.batchResults;
    } else {
        rawEntities = [{ entityName: findData?.stage1?.companyName || 'Cliente', reports: findData?.stage2?.result?.convocatorias || [] }];
    }
    
    return rawEntities.map(entity => ({
        ...entity,
        // Filtramos menores al 15% y ordenamos de mayor a menor compatibilidad
        reports: [...(entity.reports || [])]
            .filter((r: any) => (r.overallScore || 0) > 15)
            .sort((a: any, b: any) => (b.overallScore || 0) - (a.overallScore || 0))
    }));
  }, [findData]);

  const activeEntity = entities[selectedEntityIdx];

  useEffect(() => {
    if (activeEntity && activeEntity.reports?.length > 0) {
        try {
            const doc = generatePdfFromJson({ empresa_analizada: activeEntity.entityName || 'N/A', convocatorias: activeEntity.reports }, findData.templateConfig);
            setActivePdf(doc);
            setPdfPage(1);
        } catch (e) { console.error("Error preview:", e); }
    }
  }, [activeEntity, findData.templateConfig]);

  if (!activeEntity) return null;

  const handleZoomIn = () => setPdfScale(prev => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setPdfScale(prev => Math.max(prev - 0.25, 0.5));
  
  const handlePrevPdfPage = () => setPdfPage(prev => Math.max(1, prev - 1));
  const handleNextPdfPage = () => setPdfPage(prev => Math.min(pdfTotalPages, prev + 1));

  return (
      <div className="fullscreen-panel fixed inset-0 lg:left-72 z-[80] flex flex-col lg:flex-row overflow-hidden animate-fade-in">
          {/* COLUMNA IZQUIERDA: Lista de Entidades */}
          <div className="w-full lg:w-80 bg-card border-r border-border flex flex-col h-[30vh] lg:h-full shadow-2xl relative z-20">
              <div className="h-24 px-6 border-b border-border flex-shrink-0 bg-muted/10 flex flex-col justify-center">
                 <h3 className="font-black text-xl uppercase tracking-tighter text-foreground">Editor Dossiers</h3>
                 <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Seleccionar Entidad</p>
              </div>

              <div className="flex-grow overflow-y-auto p-4 custom-scrollbar bg-background">
                  <div className="space-y-2">
                    {entities.map((entity, idx) => (
                        <button key={idx} onClick={() => setSelectedEntityIdx(idx)} className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 group ${selectedEntityIdx === idx ? 'bg-primary/5 border-primary shadow-sm' : 'bg-transparent border-transparent hover:bg-muted/50 hover:border-border'}`}>
                            <div className="flex justify-between items-center">
                                <h4 className={`font-bold text-sm uppercase truncate ${selectedEntityIdx === idx ? 'text-primary' : 'text-foreground'}`}>{entity?.entityName}</h4>
                                {selectedEntityIdx === idx && <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium group-hover:text-foreground/70">{entity?.reports?.length || 0} Oportunidades</p>
                        </button>
                    ))}
                  </div>
              </div>
          </div>

          {/* COLUMNA DERECHA: Vista de Informe PDF */}
          <div className="flex-grow h-[70vh] lg:h-full bg-black/20 flex flex-col relative overflow-hidden backdrop-blur-sm">
              
              {/* --- HEADER SUPERIOR MEJORADO --- */}
              <div className="w-full min-h-24 bg-[#1A1A1A] text-white px-6 py-4 flex flex-col xl:flex-row items-center justify-between gap-4 z-30 shadow-lg flex-shrink-0 border-b border-white/5">
                  <div className="min-w-0 text-center xl:text-left flex-shrink-0">
                      <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1">Editor Dossiers</h3>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Revisión Final de Formato</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 justify-center xl:justify-end">
                      
                      {/* Indicador PDF */}
                      <div className="hidden sm:flex bg-black/40 p-1 rounded-xl border border-white/10">
                          <div className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase bg-[#B84E9D] text-white shadow-md flex items-center gap-2">
                              <span className="material-symbols-outlined text-lg">picture_as_pdf</span> Vista Impresión
                          </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-2">
                          <Button 
                              size="sm"
                              onClick={() => { activePdf?.save(`Dossier_${activeEntity.entityName}.pdf`); showToast("Dossier descargado", "success"); }} 
                              className="bg-gradient-to-r from-secondary-500 to-primary-500 text-white hover:brightness-110 border-0 shadow-lg font-bold px-4 h-9"
                          >
                              <span className="material-symbols-outlined mr-2 text-base leading-none">download</span> PDF
                          </Button>
                          <Button 
                              size="sm" 
                              variant="secondary" 
                              onClick={onNavigateToDashboard} 
                              className="bg-white/10 text-white hover:bg-white/20 border border-white/10 shadow-lg px-4 h-9"
                          >
                              <span className="material-symbols-outlined mr-2">dashboard</span> Gestión
                          </Button>
                      </div>

                      {/* Navegación PDF y Zoom */}
                      <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 bg-white/10 rounded-lg p-0.5 border border-white/10">
                              <button onClick={handlePrevPdfPage} disabled={pdfPage <= 1} className="p-1.5 hover:bg-white/10 rounded-md transition-colors disabled:opacity-30">
                                  <span className="material-symbols-outlined text-base">chevron_left</span>
                              </button>
                              <span className="text-[10px] font-bold w-12 text-center">{pdfPage} / {pdfTotalPages}</span>
                              <button onClick={handleNextPdfPage} disabled={pdfPage >= pdfTotalPages} className="p-1.5 hover:bg-white/10 rounded-md transition-colors disabled:opacity-30">
                                  <span className="material-symbols-outlined text-base">chevron_right</span>
                              </button>
                          </div>

                          <div className="flex items-center gap-1 bg-white/10 rounded-lg p-0.5 border border-white/10">
                              <button onClick={handleZoomOut} className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
                                  <span className="material-symbols-outlined text-base">remove</span>
                              </button>
                              <span className="text-[10px] font-bold w-10 text-center">{Math.round(pdfScale * 100)}%</span>
                              <button onClick={handleZoomIn} className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
                                  <span className="material-symbols-outlined text-base">add</span>
                              </button>
                          </div>
                      </div>
                  </div>
              </div>

              {/* CONTENIDO PRINCIPAL */}
              <div className="flex-grow w-full relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                  
                  <div className="absolute inset-0">
                      <div className="w-full h-full flex flex-col">
                          {activePdf ? 
                            <PdfPreviewer 
                                pdfDoc={activePdf} 
                                scale={pdfScale}
                                pageNumber={pdfPage}
                                onLoadSuccess={(pages) => setPdfTotalPages(pages)}
                            /> 
                            : (
                              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
                                  <span className="material-symbols-outlined text-5xl animate-pulse">picture_as_pdf</span>
                                  <p className="text-base font-medium uppercase tracking-widest">Generando vista previa...</p>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );
};

export default Stage3DistributeReport;
