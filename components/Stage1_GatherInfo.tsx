
import React, { useState, useEffect } from 'react';
import type { FindData, UserProfile, BatchProcessingItem } from '../types';
import { Button } from './common/Button';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from './common/Card';
import { profileService } from '../services/profileService';

const parseKeywords = (value: any): string[] => {
  if (Array.isArray(value)) {
    return value
      .map(v => (v == null ? '' : String(v)))
      .filter(v => v.trim().length > 0);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0);
  }
  return [];
};

interface Stage1GatherInfoProps {
  onComplete: (jobId: string, selectedProfiles?: BatchProcessingItem[]) => void;
  data: FindData['stage1'];
  updateData: (data: Partial<FindData['stage1']>) => void;
  jobId: string | null;
  setJobId: (jobId: string) => void;
  selectedProfiles?: BatchProcessingItem[];
}

const Stage1GatherInfo: React.FC<Stage1GatherInfoProps> = ({ onComplete, data, updateData }) => {
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [existingProfiles, setExistingProfiles] = useState<UserProfile[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(data.selectedEntityIds || []));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setIsLoading(true);
        const profiles = await profileService.getUserProfiles();
        setExistingProfiles(profiles);
        
        // Si no hay selección previa, por defecto seleccionamos todos
        if (!data.selectedEntityIds || data.selectedEntityIds.length === 0) {
            const allIds = new Set(profiles.map(p => p.id));
            setSelectedIds(allIds);
            updateData({ selectedEntityIds: Array.from(allIds) });
        }
      } catch (e) { 
        console.error(e); 
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchProfiles();
  }, []);

  const handleToggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
        next.delete(id);
    } else {
        next.add(id);
    }
    setSelectedIds(next);
    updateData({ selectedEntityIds: Array.from(next) });
  };

  const handleToggleAll = () => {
    if (selectedIds.size === existingProfiles.length) {
        setSelectedIds(new Set());
        updateData({ selectedEntityIds: [] });
    } else {
        const allIds = new Set(existingProfiles.map(p => p.id));
        setSelectedIds(allIds);
        updateData({ selectedEntityIds: Array.from(allIds) });
    }
  };

  const handleStartSearch = () => {
    if (selectedIds.size === 0) {
      showToast("Selecciona al menos una entidad.", "warning");
      return;
    }
    const selectedProfilesData = existingProfiles.filter(p => selectedIds.has(p.id));
    const batchItems: BatchProcessingItem[] = selectedProfilesData.map(profile => ({
      id: profile.id,
      profile: profile,
      status: 'waiting',
      progress: 0,
      keywords_es: profile.palabras_clave_es || '',
      keywords_en: profile.palabras_clave_en || '',
      logs: { business_summary: '', keywords: { core: [], horizontal: [], action: [] }, validations: [] }
    }));
    onComplete(`batch_${Date.now()}`, batchItems);
    showToast("Iniciando auditoría masiva...", "success");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-toast-in pb-24">
      {/* Header Informativo */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
          <span className="material-symbols-outlined text-primary text-sm">groups</span>
          <span className="text-xs font-black uppercase tracking-widest text-primary font-poppins">Cartera de Clientes Sincronizada</span>
        </div>
        <h2 className="text-5xl font-black text-foreground uppercase tracking-tighter leading-none font-poppins">Selección de Entidades</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium italic font-roboto">Revisa el ADN de búsqueda de cada cliente antes de auditar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Sidebar de Resumen */}
        <div className="lg:col-span-3 space-y-6 sticky top-24">
          <Card className="p-8 bg-card shadow-2xl rounded-3xl border-t-8 border-t-primary">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6 font-poppins">Resumen de Selección</h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-border pb-4">
                <span className="text-sm font-bold text-muted-foreground uppercase font-poppins">Seleccionados</span>
                <span className="text-4xl font-black text-primary leading-none font-poppins">{selectedIds.size}</span>
              </div>
              <div className="flex justify-between items-end border-b border-border pb-4">
                <span className="text-sm font-bold text-muted-foreground uppercase font-poppins">En Cartera</span>
                <span className="text-2xl font-black text-muted-foreground/50 leading-none font-poppins">{existingProfiles.length}</span>
              </div>
            </div>

            <div className="pt-8 space-y-4">
              <Button 
                variant="ghost"
                onClick={handleToggleAll}
                className="w-full h-12 rounded-xl text-primary font-black uppercase text-[10px] tracking-widest border-2 border-primary/10 hover:bg-primary/5"
              >
                {selectedIds.size === existingProfiles.length ? 'Desmarcar Todos' : 'Seleccionar Todos'}
              </Button>

              <Button 
                onClick={handleStartSearch} 
                className="w-full h-16 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.03]"
                disabled={selectedIds.size === 0 || isLoading}
                size="lg"
              >
                Auditar Ahora
                <span className="material-symbols-outlined ml-2">analytics</span>
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4 font-bold uppercase tracking-widest italic font-roboto">* Se utilizará el ADN de búsqueda que ves en las tarjetas.</p>
            </div>
          </Card>
        </div>

        {/* Lista de Perfiles */}
        <div className="lg:col-span-9 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 opacity-20">
              <span className="material-symbols-outlined animate-spin text-6xl text-primary">sync</span>
              <p className="mt-4 font-black uppercase tracking-widest text-foreground font-poppins">Accediendo a la base de datos...</p>
            </div>
          ) : existingProfiles.map(p => (
            <div 
              key={p.id} 
              onClick={() => handleToggleSelection(p.id)} 
              className={`relative overflow-hidden group p-8 rounded-3xl transition-all cursor-pointer flex flex-col gap-6 shadow-md hover:shadow-lg ${
                selectedIds.has(p.id) 
                ? 'bg-card ring-2 ring-primary shadow-2xl scale-[1.01]' 
                : 'bg-muted/20 opacity-60 hover:opacity-100 hover:bg-card'
              }`}
            >
              <div className="flex items-start gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${selectedIds.has(p.id) ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground shadow-sm'}`}>
                  <span className="material-symbols-outlined text-3xl">
                    {selectedIds.has(p.id) ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className={`font-black text-2xl uppercase tracking-tighter truncate font-poppins ${selectedIds.has(p.id) ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {p.company_name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-primary/10 text-primary text-xs font-black uppercase px-3 py-1 rounded-lg tracking-widest font-poppins">
                      {p.sector_principal || 'Sector General'}
                    </span>
                    <span className="text-xs font-black uppercase px-3 py-1 bg-muted rounded-full text-muted-foreground/60 font-poppins">ID: {p.id?.split('-')[0] || 'N/A'}</span>
                    <span className="text-muted-foreground/30 text-sm">|</span>
                    <p className="text-sm text-muted-foreground font-medium italic truncate font-roboto">{p.website}</p>
                  </div>
                  <p className="text-base text-muted-foreground line-clamp-2 leading-relaxed font-medium mb-2 font-roboto">
                    {p.description || 'Sin descripción técnica disponible.'}
                  </p>
                </div>
              </div>

              {/* VISUALIZACIÓN DE KEYWORDS ES/EN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className={`p-5 rounded-3xl transition-colors shadow-sm ${selectedIds.has(p.id) ? 'bg-muted/30' : 'bg-muted/10'}`}>
                  <h5 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2 font-poppins">
                    <span className="w-2 h-2 rounded-full bg-tertiary shadow-sm"></span> ADN NACIONAL (ES)
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {parseKeywords(p.palabras_clave_es).map((kw, i) => (
                      <span key={i} className="bg-background border border-border px-3 py-1 rounded-xl text-xs font-bold text-foreground shadow-sm hover:border-primary/30 transition-colors font-poppins">
                        {kw}
                      </span>
                    ))}
                    {parseKeywords(p.palabras_clave_es).length === 0 && (
                      <span className="text-xs text-muted-foreground italic font-roboto">No hay keywords ES</span>
                    )}
                  </div>
                </div>

                <div className={`p-5 rounded-3xl transition-colors shadow-sm ${selectedIds.has(p.id) ? 'bg-muted/30' : 'bg-muted/10'}`}>
                  <h5 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2 font-poppins">
                    <span className="w-2 h-2 rounded-full bg-primary shadow-sm"></span> TECHNICAL DNA (EN)
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {parseKeywords(p.palabras_clave_en).map((kw, i) => (
                      <span key={i} className="bg-background border border-border px-3 py-1 rounded-xl text-xs font-bold text-foreground shadow-sm italic hover:border-primary/30 transition-colors font-poppins">
                        {kw}
                      </span>
                    ))}
                    {parseKeywords(p.palabras_clave_en).length === 0 && (
                      <span className="text-xs text-muted-foreground italic font-roboto">No hay keywords EN</span>
                    )}
                  </div>
                </div>
              </div>

              {selectedIds.has(p.id) && (
                <div className="absolute top-0 right-0 p-0">
                  <div className="flex items-center gap-2 bg-primary text-primary-foreground text-[10px] font-black uppercase px-6 py-2 rounded-bl-3xl tracking-widest shadow-xl font-poppins">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    Auditando
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Stage1GatherInfo;
