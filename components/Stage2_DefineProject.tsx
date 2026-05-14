
import React, { useState, useEffect } from 'react';
import type { FindData, UserProject } from '../types';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from './common/Card';
import { TextArea } from './common/TextArea';
import { Select } from './common/Select';
import { useToast } from '../contexts/ToastContext';
import { profileService } from '../services/profileService';
import { GoogleGenAI } from "@google/genai";

interface Stage2DefineProjectProps {
  onComplete: () => void;
  data: FindData['stage1'];
  updateData: (data: Partial<FindData['stage1']>) => void;
  jobId: string | null;
}

const Stage2_DefineProject: React.FC<Stage2DefineProjectProps> = ({ onComplete, data, updateData, jobId }) => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [userProjects, setUserProjects] = useState<UserProject[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);
    
    const [viewMode, setViewMode] = useState<'selection' | 'form'>(data.projectDetails?.title ? 'form' : 'selection');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const projects = await profileService.getUserProjects();
                setUserProjects(projects);
            } catch (e) { console.error(e); }
            finally { setIsLoadingProjects(false); }
        };
        fetchProjects();
    }, []);

    const handleSelectProject = (project: UserProject) => {
        const mappedDetails = profileService.mapUserProjectToDetails(project);
        updateData({ projectDetails: mappedDetails as any });
        setViewMode('form');
    };

    const handleUpdateField = (field: keyof NonNullable<FindData['stage1']['projectDetails']>, value: any) => {
        const newProjectDetails = { ...data.projectDetails, [field]: value };
        updateData({ projectDetails: newProjectDetails as any });
    }

    const handleSubmitProject = async () => {
        if (!data.projectDetails?.title || !data.projectDetails?.description) {
            showToast("Completa los campos obligatorios.", "warning");
            return;
        }

        setIsAnalyzing(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `Actúa como un Analista Senior de Financiación Pública Europea.
            Extrae el ADN ESTRATÉGICO E INDIVIDUAL para la entidad: "${data.companyName}".
            Proyecto/Capacidades a analizar: "${data.projectDetails?.title}".
            Descripción técnica: "${data.projectDetails?.description}".

            REGLAS DE KEYWORDS (ESTRICTAS):
            1. Proporciona exactamente 10 palabras clave por categoría:
               - CORE: Términos técnicos y específicos del sector de la empresa y este proyecto.
               - HORIZONTAL: Términos de impacto y transversales de subvenciones (digitalización, sostenibilidad, etc.).
               - ACTION: Verbos de implementación (desarrollar, prototipar, validar).
            2. CONTEXTUALIZACIÓN: Solo incluye términos como 'inteligencia artificial' o 'economía circular' SI TIENEN ENCAJE REAL con el contexto del proyecto. No incluyas ruido irrelevante.
            3. BILINGÜISMO: Genera el set en ESPAÑOL y su traducción técnica al INGLÉS.

            Estructura de salida (JSON):
            {
              "business_summary": "Resumen profesional del ADN estratégico (máx 3 líneas)",
              "keywords_es": {
                "core": ["kw1", "kw2"...],
                "horizontal": ["kw1", "kw2"...],
                "action": ["kw1", "kw2"...]
              },
              "keywords_en": {
                "core": ["kw1", "kw2"...],
                "horizontal": ["kw1", "kw2"...],
                "action": ["kw1", "kw2"...]
              }
            }`;
            
            // Updated model to gemini-3-pro-preview for complex reasoning and stability
            const response = await ai.models.generateContent({ 
                model: "gemini-3-pro-preview", 
                contents: prompt,
                config: { 
                    responseMimeType: "application/json",
                    temperature: 0.1
                }
            });
            
            const result = JSON.parse(response.text.trim());
            
            updateData({ 
                keywords: result.keywords_es,
                nationalFilterKeywords: [...result.keywords_es.core, ...result.keywords_es.horizontal, ...result.keywords_es.action].join(', '),
                internationalFilterKeywords: [...result.keywords_en.core, ...result.keywords_en.horizontal, ...result.keywords_en.action].join(', '),
                business_summary: result.business_summary
            });
            
            showToast("ADN Estratégico analizado con éxito.", "success");
        } catch (error) {
            console.error(error);
            showToast("Error al analizar el ADN.", "error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const hasGeneratedContent = (data.nationalFilterKeywords && data.nationalFilterKeywords.length > 0);

    if (isLoadingProjects) return <div className="p-20 text-center"><span className="material-symbols-outlined animate-spin text-primary">sync</span></div>;

    if (viewMode === 'selection') {
        return (
            <div className="max-w-6xl mx-auto animate-toast-in">
                <h2 className="text-2xl font-bold text-center mb-8 uppercase tracking-tighter font-poppins">Selección de Perfil de Capacidades</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userProjects.map((p) => (
                        <Card key={p.id} className="p-6 border-2 border-primary/10 hover:border-primary transition-all cursor-pointer" onClick={() => handleSelectProject(p)}>
                            <h3 className="font-bold text-lg mb-2 uppercase truncate font-poppins">{p.project_title}</h3>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-3 font-roboto">{p.project_description}</p>
                            <div className="flex justify-between items-center mt-auto pt-4 border-t border-border">
                                <span className="text-xs bg-secondary/10 px-2 py-1 rounded font-bold uppercase font-poppins">TRL: {p.trl_actual || 'N/A'}</span>
                                <span className="material-symbols-outlined text-primary">arrow_forward</span>
                            </div>
                        </Card>
                    ))}
                    <Card className="flex flex-col items-center justify-center border-dashed text-center cursor-pointer hover:bg-primary/5 transition-colors min-h-[200px]" onClick={() => setViewMode('form')}>
                        <span className="material-symbols-outlined text-4xl mb-2 text-primary">add_circle</span>
                        <p className="font-bold uppercase text-xs font-poppins">Añadir Nuevo Perfil</p>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-toast-in pb-20">
            <Card className="p-8 space-y-6 relative overflow-hidden shadow-2xl">
                <div className="flex justify-between items-start border-b border-border pb-6 mb-4">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter font-poppins">Configuración del ADN Maestro</h2>
                        <p className="text-sm text-muted-foreground font-bold uppercase font-poppins">Análisis profundo para búsqueda sin filtros de fecha.</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setViewMode('selection')} className="gap-2 text-primary">
                        <span className="material-symbols-outlined !text-sm">sync_alt</span> Cambiar Perfil
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Título Comercial del Proyecto/Perfil *" value={data.projectDetails?.title} onChange={(e) => handleUpdateField('title', e.target.value)} />
                    <Select label="Categoría de Subvención *" value={data.projectDetails?.category} onChange={(e) => handleUpdateField('category', e.target.value)}>
                        <option value="">Seleccionar...</option>
                        <option value="innovation">I+D+i (Tecnología)</option>
                        <option value="digitalization">Digitalización Pyme</option>
                        <option value="sustainability">Sostenibilidad y Energía</option>
                        <option value="law_services">Servicios Legales/Consultoría</option>
                    </Select>
                </div>

                <TextArea label="Descripción Detallada de Capacidades o Proyecto *" value={data.projectDetails?.description} onChange={(e) => handleUpdateField('description', e.target.value)} rows={5} placeholder="Describe qué hace la empresa o de qué trata el proyecto específico para que la IA genere las palabras clave correctas..." />
                
                <div className="pt-6 flex justify-end border-t border-border">
                    <Button onClick={handleSubmitProject} isLoading={isAnalyzing} variant="primary" size="lg" className="h-14 px-12 shadow-xl">
                        <span className="material-symbols-outlined text-base leading-none mr-2">auto_awesome</span> Extraer ADN Estratégico
                    </Button>
                </div>
            </Card>

            {hasGeneratedContent && (
                <div className="space-y-6 animate-toast-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-6 bg-muted/20 border-l-4 border-l-primary">
                            <h4 className="text-xs font-black uppercase mb-4 text-primary tracking-widest font-poppins">Keywords (España - BDNS)</h4>
                            <p className="text-sm text-muted-foreground italic leading-relaxed font-roboto">{data.nationalFilterKeywords}</p>
                        </Card>
                        <Card className="p-6 bg-muted/20 border-l-4 border-l-primary">
                            <h4 className="text-xs font-black uppercase mb-4 text-primary tracking-widest font-poppins">Keywords (Europa - EU Portal)</h4>
                            <p className="text-sm text-muted-foreground italic leading-relaxed font-roboto">{data.internationalFilterKeywords}</p>
                        </Card>
                    </div>
                    <div className="text-center pt-4">
                         <Button onClick={onComplete} size="lg" className="px-20 h-16 shadow-2xl">
                             Iniciar Búsqueda Bilingüe Total
                             <span className="material-symbols-outlined ml-2">manage_search</span>
                         </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stage2_DefineProject;
