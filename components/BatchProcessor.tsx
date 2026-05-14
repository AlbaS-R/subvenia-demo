
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { supabasePublicData } from '../supabase-client';
import type { BatchProcessingItem, BatchEntityResult, TemplateConfig } from '../types';
import { useToast } from '../contexts/ToastContext';
import { Card } from './common/Card';
import { Button } from './common/Button';

const normalizeKeywords = (value: any): string[] => {
    if (Array.isArray(value)) {
        return value
            .map(v => (v == null ? '' : String(v)))
            .flatMap(v => v.split(','))
            .map(v => v.trim())
            .filter(v => v.length > 2);
    }
    if (typeof value === 'string') {
        return value
            .split(',')
            .map(v => v.trim())
            .filter(v => v.length > 2);
    }
    if (value != null) {
        return String(value)
            .split(',')
            .map(v => v.trim())
            .filter(v => v.length > 2);
    }
    return [];
};

interface BatchProcessorProps {
    profiles: BatchProcessingItem[];
    templateConfig?: TemplateConfig;
    onFinished: (results: BatchEntityResult[]) => void;
    searchStartDate: string;
    searchEndDate: string;
    initialResults?: BatchEntityResult[];
    onRestart?: () => void;
    onContinue?: () => void;
}

const BatchProcessor: React.FC<BatchProcessorProps> = ({ 
    profiles, 
    templateConfig, 
    onFinished,
    initialResults,
    onRestart,
    onContinue
}) => {
    const [currentProgress, setCurrentProgress] = useState(initialResults && initialResults.length > 0 ? 100 : 0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [resultsSoFar, setResultsSoFar] = useState<BatchEntityResult[]>(initialResults || []);
    
    const isRunningRef = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const { showToast } = useToast();

    // FIX: Define currentLang and targetLanguageName at the component level so they are available in both processQueue and the return statement.
    const currentLang = templateConfig?.reportLanguage || 'es';
    const targetLanguageName = currentLang === 'en' ? 'English' : currentLang === 'ca' ? 'Catalan' : 'Spanish';
    const hasGeneratedReports = resultsSoFar.some(entity => (entity.reports || []).length > 0);

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

    useEffect(() => {
        if (!isRunningRef.current && profiles.length > 0 && (!initialResults || initialResults.length === 0)) {
            startProcessing();
        }
        return () => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, [profiles]);

    const startProcessing = () => {
        isRunningRef.current = true;
        setIsProcessing(true);
        setLogs([]);
        processQueue();
    };

    const fetchCallsFromDB = async (keywords_es: any, keywords_en: any) => {
        const kws_es = normalizeKeywords(keywords_es);
        const kws_en = normalizeKeywords(keywords_en);
        
        const fetchTable = async (table: string, kws: string[]) => {
            if (kws.length === 0) return [];
            const query = kws.map(k => `nombre.ilike.%${k}%`).join(',');
            const { data } = await supabasePublicData
                .from(table)
                .select('nombre, url, presupuesto, estado, raw_data, source_id, publication_date, fecha_fin_solicitud')
                .or(query)
                .limit(10);
            return data || [];
        };

        const [resEs, resEu] = await Promise.all([
            fetchTable('convocatorias_nacionales', kws_es),
            fetchTable('convocatorias_europeas', kws_en)
        ]);

        return [...resEs, ...resEu];
    };

    const processQueue = async () => {
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            addLog("Error: Falta la clave de API de Gemini. Configura GEMINI_API_KEY en tu .env.local.");
            showToast("Falta la clave de Gemini. Revisa la configuración.", "error");
            setIsProcessing(false);
            return;
        }

        const ai = new GoogleGenAI({ apiKey });
        const finalResults: BatchEntityResult[] = [];

        const headersMap: Record<string, any> = {
            es: { obj: "OBJETIVO", cond: "CONDICIONES", req: "REQUISITOS", pts: "PUNTOS FUERTES", brc: "BRECHAS Y MEJORAS", pre: "PRESUPUESTO DETALLADO" },
            en: { obj: "OBJECTIVE", cond: "CONDITIONS", req: "REQUIREMENTS", pts: "STRENGTHS", brc: "GAPS AND IMPROVEMENTS", pre: "DETAILED BUDGET" },
            ca: { obj: "OBJECTIU", cond: "CONDICIONS", req: "REQUISITS", pts: "PUNTS FORTS", brc: "BRETXES I MILLORES", pre: "PRESSUPOST DETALLAT" }
        };
        const h = headersMap[currentLang];

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                tituloComercial: { type: Type.STRING },
                overallScore: { type: Type.NUMBER },
                presupuestoMontoEuros: { type: Type.STRING, description: "Extract exactly the budget amount in Euros if available in RAW DATA (e.g. 5.000.000 €)" },
                analisisCompatibilidadNarrativo: { type: Type.STRING, description: "Mínimo 200 palabras de sinergia estratégica" },
                auditDetail: {
                    type: Type.OBJECT,
                    properties: {
                        objetivo: { type: Type.STRING },
                        condiciones: { type: Type.STRING },
                        requisitos: { type: Type.STRING },
                        puntosFuertes: { type: Type.STRING },
                        brechasMejoras: { type: Type.STRING },
                        presupuesto: { type: Type.STRING, description: "Exhaustive explanation of the budget found in RAW DATA" }
                    },
                    required: ["objetivo", "condiciones", "requisitos", "puntosFuertes", "brechasMejoras", "presupuesto"]
                },
                proximosPasos: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["tituloComercial", "overallScore", "presupuestoMontoEuros", "analisisCompatibilidadNarrativo", "auditDetail", "proximosPasos"]
        };

        try {
            addLog(`Iniciando motor PRO para auditoría en ${targetLanguageName}...`);

            const tasksByProfile = await Promise.all(profiles.map(async p => {
                const calls = await fetchCallsFromDB(p.keywords_es, p.keywords_en);
                return { profile: p, calls };
            }));

            const totalCallsToAnalyze = tasksByProfile.reduce((acc, curr) => acc + curr.calls.length, 0);
            let callsCompleted = 0;

            if (totalCallsToAnalyze === 0) {
                addLog("No se encontraron convocatorias para auditar.");
                showToast("No se encontraron convocatorias para generar informes.", "warning");
                setIsProcessing(false);
                return;
            }

            for (const item of tasksByProfile) {
                if (signal.aborted) break;
                const { profile, calls } = item;

                if (calls.length === 0) continue;

                addLog(`Analizando ${calls.length} convocatorias para ${profile.profile.company_name}...`);
                const reports: any[] = [];
                const batchSize = 5;

                for (let i = 0; i < calls.length; i += batchSize) {
                    if (signal.aborted) break;
                    
                    const batch = calls.slice(i, i + batchSize);
                    const batchPromises = batch.map(async (call) => {
                        const systemInstruction = `ROLE: Senior Funding Consultant.
                        CRITICAL RULE: You MUST write the ENTIRE response (every single key and value) in ${targetLanguageName}. Do NOT use Spanish unless target is Spanish.
                        BUDGET RULE: Search deep into the RAW DATA for budget numbers. 
                        1. Put the numeric amount in 'presupuestoMontoEuros'. 
                        2. Explain how that money is used in 'auditDetail.presupuesto'.
                        NARRATIVE: Minimum 200 words for 'analisisCompatibilidadNarrativo'.
                        STRICT: NO asterisks (*). NO Spanish text if target is English or Catalan.`;

                        const prompt = `CLIENT: ${JSON.stringify(profile.profile)}. CALL: ${call.nombre}. DATA: ${JSON.stringify(call.raw_data).substring(0, 4500)}`;

                        try {
                            const result = await ai.models.generateContent({
                                model: "gemini-3-flash-preview",
                                contents: prompt,
                                config: { 
                                    responseMimeType: "application/json", 
                                    responseSchema: responseSchema as any,
                                    systemInstruction,
                                    temperature: 0.1 
                                }
                            });

                            const aiData = JSON.parse(result.text);
                            
                            return {
                                ...aiData,
                                evaluacionEncaje: {
                                    convocatoria_titulo: call.nombre,
                                    convocatoria_url: call.url,
                                    convocatoria_estado: call.estado,
                                    presupuesto: aiData.presupuestoMontoEuros || call.presupuesto,
                                    source_id: call.source_id,
                                    publicacion: call.publication_date,
                                    cierre: call.fecha_fin_solicitud
                                },
                                aiCore: { analisisCompatibilidad: aiData.analisisCompatibilidadNarrativo },
                                markdownReport: `### ${h.obj}\n${aiData.auditDetail.objetivo}\n\n### ${h.pre}\n${aiData.auditDetail.presupuesto}\n\n### ${h.cond}\n${aiData.auditDetail.condiciones}\n\n### ${h.req}\n${aiData.auditDetail.requisitos}\n\n### ${h.pts}\n${aiData.auditDetail.puntosFuertes}\n\n### ${h.brc}\n${aiData.auditDetail.brechasMejoras}`
                            };
                        } catch (e: any) {
                            addLog(`Error IA en "${call.nombre}": ${e?.message || String(e)}`);
                            return null;
                        } finally {
                            callsCompleted++;
                            setCurrentProgress(Math.round((callsCompleted / totalCallsToAnalyze) * 100));
                        }
                    });

                    const batchResults = await Promise.all(batchPromises);
                    reports.push(...batchResults.filter(r => r !== null));
                }

                finalResults.push({
                    entityName: profile.profile.company_name,
                    profileId: profile.profile.id,
                    emailContact: profile.profile.email_contact,
                    business_summary: profile.logs.business_summary,
                    reports: reports
                });
                
                setResultsSoFar([...finalResults]);
            }

            if (!signal.aborted) {
                setIsProcessing(false);
                const generatedCount = finalResults.reduce((acc, entity) => acc + (entity.reports?.length || 0), 0);
                if (generatedCount === 0) {
                    addLog("La auditoría terminó, pero Gemini no devolvió informes válidos. Revisa los errores anteriores.");
                    showToast("No se pudieron generar informes válidos. Revisa el log.", "error");
                    return;
                }
                addLog(`Auditoría masiva completada con éxito. Informes generados: ${generatedCount}.`);
                onFinished(finalResults);
            }

        } catch (error: any) {
            console.error("Error en BatchProcessor:", error);
            addLog(`Error en el procesamiento: ${error?.message || String(error)}`);
            setIsProcessing(false);
            showToast(error?.message || "Error en el procesamiento", "error");
        } finally {
            isRunningRef.current = false;
        }
    };

    return (
        <div className="p-4 sm:p-8 space-y-10 max-w-5xl mx-auto pb-24">
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 pb-6 border-b border-border/50">
                <Button variant="primary" onClick={onRestart} className="rounded-2xl px-10 h-16 shadow-xl font-black uppercase text-xs tracking-widest flex items-center gap-3">
                    <span className="material-symbols-outlined text-xl">manage_search</span> Nueva Auditoría
                </Button>
                <Button variant="secondary" onClick={onContinue} disabled={isProcessing || !hasGeneratedReports} className="rounded-2xl px-10 h-16 border-2 border-primary/20 bg-primary/5 text-primary font-black uppercase text-xs tracking-widest flex items-center gap-3 disabled:opacity-30">
                    Ir al Dossier <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </Button>
            </div>
            
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground">
                    {isProcessing ? 'Procesando Auditoría Estratégica' : 'Análisis Completado'}
                </h2>
                <p className="text-xs font-bold text-primary uppercase tracking-widest animate-pulse">
                    {isProcessing ? `Motor Pro: Generando informes detallados en ${targetLanguageName}...` : 'Todos los informes han sido generados y validados.'}
                </p>
            </div>

            <div className="relative w-full bg-muted/20 rounded-3xl h-14 overflow-hidden border-2 border-border p-1.5 shadow-inner">
                <div className="bg-primary h-full rounded-2xl transition-all duration-1000 ease-in-out" style={{ width: `${currentProgress}%` }}></div>
                <div className="absolute inset-0 flex items-center justify-center font-black text-xs uppercase tracking-widest mix-blend-difference text-white">
                    {currentProgress}% COMPLETADO
                </div>
            </div>

            <Card className="bg-neutral-950 border-neutral-800 rounded-3xl p-6 h-[400px] overflow-hidden flex flex-col shadow-2xl">
                <div className="flex justify-between items-center mb-4 border-b border-neutral-800 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Log de Auditoría Multilingüe</span>
                    {isProcessing && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>}
                </div>
                <div className="flex-grow overflow-y-auto custom-scrollbar font-mono text-[11px] leading-relaxed text-emerald-500/90 space-y-2">
                    {logs.map((log, i) => <div key={i} className="border-l-2 border-emerald-500/20 pl-4 py-0.5 animate-toast-in">{log}</div>)}
                    {logs.length === 0 && <div className="text-neutral-600 italic">Esperando inicio de proceso...</div>}
                </div>
            </Card>
        </div>
    );
};

export default BatchProcessor;
