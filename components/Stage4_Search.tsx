
import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { supabasePublicData } from '../supabase-client';

const Stage4_Search: React.FC<any> = ({ onComplete, onRefineSearch, findData, updateFindData }) => {
    const { showToast } = useToast();
    const [isSearching, setIsSearching] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [msg, ...prev]);

    const performSearch = async () => {
        if (isSearching) return;
        setIsSearching(true);
        setLogs([]);
        try {
            const finalResults: any[] = [];
            
            // 1. BÚSQUEDA NACIONAL (ESPAÑA)
            if (findData.stage1.nationalFilterKeywords) {
                addLog("Iniciando búsqueda en España...");
                const kws = findData.stage1.nationalFilterKeywords.split(',').map(k => k.trim()).filter(k => k.length > 2);
                
                const orConditions = kws.flatMap(kw => {
                    const clean = kw.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, '');
                    return [
                        `nombre.ilike.%${clean}%`, 
                        `raw_data.at.text.ilike.%${clean}%` 
                    ];
                });

                const { data, error } = await supabasePublicData
                    .from('convocatorias_nacionales')
                    .select('nombre, url, presupuesto, estado, raw_data')
                    .or(kws.map(kw => `nombre.ilike.%${kw.trim()}%`).join(','))
                    .limit(200);

                if (error) addLog(`Error DB ES: ${error.message}`);
                addLog(`Resultados España: ${data?.length || 0} encontrados.`);

                (data || []).forEach(item => {
                    finalResults.push({
                        title: item.nombre,
                        description: 'Localizada en BDNS (España).',
                        url: item.url,
                        source: 'Infosubvenciones',
                        budget: item.presupuesto || 'Ver bases',
                        estado: item.estado,
                        raw_data: item.raw_data
                    });
                });
            }

            // 2. BÚSQUEDA EUROPEA (INGLÉS)
            if (findData.stage1.internationalFilterKeywords) {
                addLog("Iniciando búsqueda en Europa...");
                const kws = findData.stage1.internationalFilterKeywords.split(',').map(k => k.trim()).filter(k => k.length > 2);
                
                const { data, error } = await supabasePublicData
                    .from('convocatorias_europeas')
                    .select('nombre, descripcion, url, presupuesto, estado, raw_data')
                    .or(kws.map(kw => `nombre.ilike.%${kw.trim()}%`).join(','))
                    .limit(200);

                if (error) addLog(`Error DB EU: ${error.message}`);
                addLog(`Resultados Europa: ${data?.length || 0} encontrados.`);

                (data || []).forEach(item => {
                    finalResults.push({
                        title: item.nombre,
                        description: item.descripcion || 'Localizada en EU Portal.',
                        url: item.url,
                        source: 'European Commission',
                        budget: item.presupuesto || 'Ver bases',
                        estado: item.estado,
                        raw_data: item.raw_data
                    });
                });
            }

            const unique = Array.from(new Map(finalResults.map(i => [i.url, i])).values());
            updateFindData('stage4_searchResults', unique);
            if (unique.length === 0) addLog("ATENCIÓN: Sin coincidencias. Intenta ajustar las palabras clave.");
            else addLog(`ÉXITO: ${unique.length} oportunidades listas.`);
            
        } catch (e: any) {
            addLog(`ERROR CRÍTICO: ${e.message}`);
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => { performSearch(); }, []);

    return (
        <div className="space-y-10 animate-toast-in pb-16">
            <div className="bg-card rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">Consola de Búsqueda</h2>
                        <p className="text-xs text-muted-foreground">Monitor de conexión con base de datos</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={onRefineSearch}>Ajustar ADN</Button>
                        <Button onClick={onComplete} size="sm" disabled={findData.stage4_searchResults.length === 0}>Siguiente Paso</Button>
                    </div>
                </div>
                
                <div className="p-6 bg-neutral-950 min-h-[300px] max-h-[400px] overflow-y-auto custom-scrollbar font-mono text-xs text-emerald-400/80">
                    {logs.map((log, i) => (
                        <div key={i} className="mb-1 flex gap-4 border-b border-white/5 pb-1">
                            <span className="text-neutral-50/30 whitespace-nowrap">[{new Date().toLocaleTimeString()}]</span>
                            <span className={log.includes('ERROR') ? 'text-red-400' : log.includes('Resultados') ? 'text-green-400 font-bold' : 'text-primary-300'}>
                                {log}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {!isSearching && findData.stage4_searchResults.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">Resultados localizados</h3>
                    {findData.stage4_searchResults.map((r, i) => (
                        <Card key={i} className="p-4 flex justify-between items-center bg-card shadow-md">
                            <div>
                                <p className="font-bold text-sm text-primary">{r.title}</p>
                                <span className="text-xs font-black uppercase bg-muted/50 px-2 py-0.5 rounded text-muted-foreground">{r.source}</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => updateFindData('stage4_searchResults', findData.stage4_searchResults.filter(x => x.url !== r.url))}>
                                <span className="material-symbols-outlined text-sm">close</span>
                            </Button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Stage4_Search;
