
import React, { useState, useEffect } from 'react';
import type { FindData } from '../types';
import { Button } from './common/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from './common/Card';
import { Checkbox } from './common/Checkbox';
import { Input } from './common/Input';
import { Tag } from './common/Tag';
import { GoogleGenAI } from "@google/genai";
import { useToast } from '../contexts/ToastContext';

interface Stage2GenerateDocumentProps {
  onComplete: () => void;
  inputData: FindData['stage1'];
  updateInputData: (data: Partial<FindData['stage1']>) => void;
  jobId: string | null;
}

interface ScopeCardProps {
  title: string;
  description: string;
  icon: string;
  active: boolean;
  onClick: () => void;
  color: string;
}

const ScopeCard: React.FC<ScopeCardProps> = ({ title, description, icon, active, onClick, color }) => (
  <button
    onClick={onClick}
    className={`flex-1 text-left p-8 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-md hover:shadow-lg ${
      active 
      ? 'bg-card ring-2 ring-primary shadow-xl' 
      : 'bg-muted/20 opacity-70 hover:opacity-100'
    }`}
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${active ? 'bg-primary text-white' : 'bg-card text-muted-foreground shadow-sm'}`}>
      <span className="material-symbols-outlined text-3xl">{icon}</span>
    </div>
    <h4 className={`text-xl font-black uppercase tracking-tight mb-2 font-poppins ${active ? 'text-primary' : 'text-foreground'}`}>{title}</h4>
    <p className="text-sm text-muted-foreground font-medium leading-relaxed font-roboto">{description}</p>
    {active && (
      <div className="absolute top-4 right-4 animate-bounce">
        <span className="material-symbols-outlined text-primary">check_circle</span>
      </div>
    )}
  </button>
);

const Stage2GenerateDocument: React.FC<Stage2GenerateDocumentProps> = ({ onComplete, inputData, updateInputData }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    const sixMonthsHence = new Date();
    sixMonthsHence.setMonth(today.getMonth() + 6);

    const updates: Partial<FindData['stage1']> = {};
    const allKeywords = [...(inputData.keywords?.core || []), ...(inputData.keywords?.horizontal || []), ...(inputData.keywords?.action || [])];
    const keywordsString = allKeywords.join(', ');
    
    if (!inputData.nationalFilterKeywords && keywordsString) updates.nationalFilterKeywords = keywordsString;
    if (!inputData.searchStartDate) updates.searchStartDate = sixMonthsAgo.toISOString().split('T')[0];
    if (!inputData.searchEndDate) updates.searchEndDate = sixMonthsHence.toISOString().split('T')[0];
    
    if (Object.keys(updates).length > 0) updateInputData(updates);

    if (allKeywords.length > 0 && (!inputData.internationalFilterKeywords || inputData.internationalFilterKeywords === keywordsString)) {
        const translateKeywords = async () => {
            setIsTranslating(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                // Updated model to gemini-3-flash-preview for efficiency
                const response = await ai.models.generateContent({ 
                    model: "gemini-3-flash-preview", 
                    contents: `Translate the following Spanish keywords to English. Respond ONLY with a comma-separated list: "${keywordsString}"` 
                });
                const translated = response.text?.trim() || '';
                if (translated) updateInputData({ internationalFilterKeywords: translated });
            } catch (error) {
                showToast("Error en la traducción automática.", "warning");
                if (!inputData.internationalFilterKeywords) updateInputData({ internationalFilterKeywords: keywordsString });
            } finally {
                setIsTranslating(false);
            }
        };
        translateKeywords();
    }
  }, [inputData.keywords]);

  const handleFundingTypeChange = (type: keyof FindData['stage1']['fundingTypes'], checked: boolean) => {
    updateInputData({ fundingTypes: { ...inputData.fundingTypes, [type]: { ...inputData.fundingTypes[type], enabled: checked } } });
  };

  const allKeywordsForDisplay = [...(inputData.keywords?.core || []), ...(inputData.keywords?.horizontal || []), ...(inputData.keywords?.action || [])];
  
  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-toast-in pb-24">
      {/* Header Corporativo */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/10">
          <span className="material-symbols-outlined text-primary text-sm">settings_input_component</span>
          <span className="text-xs font-black uppercase tracking-widest text-primary font-poppins">Configuración de Inteligencia</span>
        </div>
        <h2 className="text-5xl font-black text-foreground uppercase tracking-tighter leading-none font-poppins">Alcance de la Auditoría</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium italic font-roboto">Define los perímetros geográficos y el horizonte temporal de la búsqueda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Panel Izquierdo: Alcance Geográfico */}
        <div className="lg:col-span-8 space-y-10">
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground ml-4 font-poppins">1. Perímetros de Financiación</h3>
            <div className="flex flex-col md:flex-row gap-6">
              <ScopeCard 
                title="España (Nacional)"
                description="Búsqueda en la BDNS y boletines autonómicos para subvenciones directas y préstamos bonificados."
                icon="flag"
                color="primary"
                active={inputData.fundingTypes.nationalSubsidies.enabled}
                onClick={() => handleFundingTypeChange('nationalSubsidies', !inputData.fundingTypes.nationalSubsidies.enabled)}
              />
              <ScopeCard 
                title="Europa (Transnacional)"
                description="Análisis de programas directos de la Comisión Europea (Horizonte, LIFE, Fondos de Innovación)."
                icon="language"
                color="primary"
                active={inputData.fundingTypes.internationalSubsidies.enabled}
                onClick={() => handleFundingTypeChange('internationalSubsidies', !inputData.fundingTypes.internationalSubsidies.enabled)}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground ml-4 font-poppins">2. Horizonte Temporal de Vigencia</h3>
            <Card className="p-10 bg-muted/20 rounded-3xl shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
                <Input 
                  label="Apertura mínima de convocatoria" 
                  type="date" 
                  className="bg-card h-14 font-bold rounded-2xl"
                  value={inputData.searchStartDate || ''} 
                  onChange={e => updateInputData({ searchStartDate: e.target.value })} 
                />
                <Input 
                  label="Cierre máximo de convocatoria" 
                  type="date" 
                  className="bg-card h-14 font-bold rounded-2xl"
                  value={inputData.searchEndDate || ''} 
                  onChange={e => updateInputData({ searchEndDate: e.target.value })} 
                />
              </div>
              <div className="mt-8 flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                <span className="material-symbols-outlined text-primary">info</span>
                <p className="text-xs font-bold text-primary uppercase tracking-widest font-poppins">Recomendación: Se analizarán programas abiertos o en previsión dentro de este rango.</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Panel Derecho: ADN de Búsqueda */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground ml-4 font-poppins">ADN Estratégico Detectado</h3>
            <Card className="p-8 bg-card shadow-2xl rounded-3xl space-y-8">
              <div>
                <h4 className="text-xs font-black uppercase text-primary mb-4 font-poppins">Motor Lingüístico (ES)</h4>
                <div className="flex flex-wrap gap-2">
                  {inputData.nationalFilterKeywords?.split(',').slice(0, 15).map((kw, i) => (
                    <Tag key={i}>{kw.trim()}</Tag>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-black uppercase text-primary font-poppins">Technical Keywords (EN)</h4>
                  {isTranslating && <span className="material-symbols-outlined animate-spin text-sm text-primary">sync</span>}
                </div>
                <div className="flex flex-wrap gap-2 opacity-60">
                  {inputData.internationalFilterKeywords?.split(',').slice(0, 15).map((kw, i) => (
                    <Tag key={i}>{kw.trim()}</Tag>
                  ))}
                </div>
              </div>

              <div className="pt-10">
                <Button 
                  onClick={onComplete} 
                  className="w-full h-20 rounded-3xl shadow-2xl shadow-primary/30 hover:scale-105"
                  isLoading={isTranslating}
                  size="lg"
                >
                  Ejecutar Auditoría
                  <span className="material-symbols-outlined ml-2 text-2xl leading-none">rocket_launch</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Stage2GenerateDocument;
