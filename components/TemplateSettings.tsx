
import React, { useState, useEffect } from 'react';
import { TemplateConfig, BrandTemplate } from '../types';
import { Card } from './common/Card';
import { Input } from './common/Input';
import { TextArea } from './common/TextArea';
import { Button } from './common/Button';
import { Select } from './common/Select';
import { useAuth } from '../contexts/AuthContext';
import { getTemplateConfig } from '../utils/templateStorage';
import { useToast } from '../contexts/ToastContext';
import { Checkbox } from './common/Checkbox';
import { templateService } from '../services/templateService';
import { getDefaultTemplate, getTemplateTexts } from '../utils/defaultTemplates';
import { useLanguage } from '../contexts/LanguageContext';

const TemplateSettings: React.FC<{ onComplete: (config: TemplateConfig) => void; initialConfig?: TemplateConfig }> = ({ onComplete, initialConfig }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { t } = useLanguage();
    
    const [view, setView] = useState<'library' | 'editor'>('library');
    const [config, setConfig] = useState<TemplateConfig>(initialConfig || getTemplateConfig(user?.email));
    const [previewMode, setPreviewMode] = useState<'cover' | 'intro' | 'conclusion' | 'email'>('cover');
    const [savedTemplates, setSavedTemplates] = useState<BrandTemplate[]>([]);
    const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
    const [newTemplateName, setNewTemplateName] = useState('');

    useEffect(() => { loadTemplates(); }, []);

    const loadTemplates = async () => {
        try {
            const data = await templateService.getTemplates();
            setSavedTemplates(data || []);
        } catch (error) { console.error(error); }
    };

    const handleSelectTemplateForEdit = (template: BrandTemplate) => {
        setConfig(template.config);
        setActiveTemplateId(template.id);
        setNewTemplateName(template.name);
        setView('editor');
    };

    const handleUpdateExisting = async () => {
        if (!newTemplateName.trim()) {
            showToast("Introduce un nombre para la identidad", "warning");
            return;
        }
        try {
            if (!activeTemplateId) {
                const id = await templateService.saveTemplate(newTemplateName, config);
                setActiveTemplateId(id);
            } else {
                await templateService.updateTemplate(activeTemplateId, config);
            }
            await loadTemplates();
            showToast("Identidad guardada con éxito", "success");
            onComplete(config);
        } catch (error) { showToast("Error al guardar", "error"); }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar que sea una imagen
            if (!file.type.startsWith('image/')) {
                showToast("Por favor, selecciona un archivo de imagen válido", "warning");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const rawData = reader.result as string;
                
                // Usamos un objeto Image para cargar la imagen (funciona con SVG, JPG, PNG, etc.)
                const img = new Image();
                img.onload = () => {
                    // Creamos un canvas para convertir a PNG y asegurar compatibilidad con jsPDF
                    const canvas = document.createElement('canvas');
                    // Usamos dimensiones naturales para mantener calidad
                    canvas.width = img.naturalWidth || img.width;
                    canvas.height = img.naturalHeight || img.height;
                    
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        // Limpiar canvas
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        // Dibujar imagen cargada en el canvas
                        ctx.drawImage(img, 0, 0);
                        
                        // Convertir a PNG (formato universalmente aceptado por jsPDF)
                        const pngBase64 = canvas.toDataURL('image/png');
                        const ratio = canvas.width / canvas.height;

                        setConfig(prev => ({ 
                            ...prev, 
                            logoBase64: pngBase64,
                            logoAspectRatio: ratio 
                        }));
                        showToast("Logo procesado correctamente", "success");
                    }
                };
                img.onerror = () => {
                    showToast("Error al procesar la imagen seleccionada", "error");
                };
                img.src = rawData;
            };
            reader.readAsDataURL(file);
        }
    };

    const setProp = (key: keyof TemplateConfig, value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value;
        const newTexts = getTemplateTexts(newLang);
        
        setConfig(prev => ({
            ...prev,
            reportLanguage: newLang as any,
            ...newTexts
        }));
        
        showToast("Textos de plantilla traducidos", "info");
    };

    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-8 animate-toast-in pb-24">
            {view === 'library' ? (
                <div className="py-10">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-black uppercase tracking-tighter text-foreground mb-4">Identidades Corporativas</h2>
                        <p className="text-muted-foreground text-lg">Define cómo tus clientes verán sus informes estratégicos.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        <Card className="flex flex-col items-center justify-center p-12 cursor-pointer rounded-3xl bg-card dark:bg-neutral-800 hover:bg-muted/50 transition-all shadow-xl hover:shadow-2xl" onClick={() => { setConfig(getDefaultTemplate(user?.email)); setActiveTemplateId(null); setView('editor'); }}>
                            <span className="material-symbols-outlined text-4xl mb-4 text-primary">add_circle</span>
                            <span className="font-black uppercase text-xs text-primary tracking-widest">Crear Nueva Plantilla</span>
                        </Card>
                        
                        {savedTemplates.map(template => (
                            <Card key={template.id} className="p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all bg-card dark:bg-neutral-800 hover:ring-2 hover:ring-primary/50 group relative">
                                <div className="h-4 w-full rounded-full mb-6 transition-all group-hover:scale-105" style={{ backgroundColor: template.config.primaryColor }}></div>
                                <h4 className="font-black text-xl uppercase mb-6 truncate text-foreground group-hover:text-primary transition-colors">{template.name}</h4>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" className="flex-1 hover:bg-background/50" onClick={() => handleSelectTemplateForEdit(template)}>Editar</Button>
                                    <Button variant="primary" size="sm" className="flex-1 shadow-md hover:scale-105" onClick={() => onComplete(template.config)}>Usar</Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="sticky top-4 z-50 bg-background/80 backdrop-blur-xl p-4 rounded-3xl shadow-2xl flex justify-between items-center">
                        <div className="flex gap-2 bg-muted/50 p-1 rounded-2xl">
                            {['cover', 'intro', 'conclusion', 'email'].map(tab => (
                                <Button key={tab} variant="ghost" size="sm" onClick={() => setPreviewMode(tab as any)} className={`px-6 rounded-xl ${previewMode === tab ? 'bg-card dark:bg-neutral-800 text-primary shadow-sm font-bold' : 'text-muted-foreground hover:text-foreground'}`}>
                                    {tab === 'cover' ? 'Portada' : tab === 'intro' ? 'Introducción' : tab === 'conclusion' ? 'Cierre' : 'Email'}
                                </Button>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => setView('library')}>Cancelar</Button>
                            <Button variant="primary" onClick={handleUpdateExisting} className="shadow-lg">Guardar Cambios</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="p-8 space-y-8 rounded-3xl bg-card dark:bg-neutral-800 shadow-2xl">
                                <div>
                                    <Input label="Nombre de esta Plantilla" value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} placeholder="Ej: Marca Principal" className="bg-background" />
                                </div>

                                {previewMode === 'cover' && (
                                    <div className="space-y-6">
                                        <div className="p-4 bg-muted/20 rounded-2xl border border-border">
                                            <label className="block text-xs font-bold uppercase text-muted-foreground mb-3 font-poppins">Diseño de Portada</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button 
                                                    onClick={() => setProp('coverLayout', 'modern-sidebar')}
                                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${config.coverLayout === 'modern-sidebar' ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted/50'}`}
                                                >
                                                    <div className="w-8 h-10 border border-current rounded flex overflow-hidden">
                                                        <div className="w-2 h-full bg-current"></div>
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase">Moderno</span>
                                                </button>
                                                <button 
                                                    onClick={() => setProp('coverLayout', 'classic-centered')}
                                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${config.coverLayout === 'classic-centered' ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted/50'}`}
                                                >
                                                    <div className="w-8 h-10 border border-current rounded flex flex-col items-center justify-center gap-1">
                                                        <div className="w-4 h-0.5 bg-current"></div>
                                                        <div className="w-2 h-0.5 bg-current"></div>
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase">Clásico</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <input type="file" id="logo" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                            <label htmlFor="logo" className="flex-1 h-12 border-2 border-dashed border-neutral-200 dark:border-neutral-50/20 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary hover:text-primary transition-colors text-sm font-bold text-muted-foreground bg-background">
                                                {config.logoBase64 ? 'Cambiar Logo' : 'Subir Logo'}
                                            </label>
                                            
                                            {config.logoBase64 && (
                                                <Button 
                                                    variant="ghost" 
                                                    onClick={() => setProp('logoBase64', null)}
                                                    className="h-12 w-12 p-0 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-neutral-50 border border-destructive/20"
                                                    title="Eliminar Logo"
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </Button>
                                            )}

                                            <div className="h-12 w-12 relative overflow-hidden rounded-xl shadow-sm border border-border">
                                                <input 
                                                    type="color" 
                                                    value={config.primaryColor} 
                                                    onChange={e => setProp('primaryColor', e.target.value)} 
                                                    className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0" 
                                                />
                                            </div>
                                        </div>
                                        <Input label="Título Principal" value={config.coverTitle} onChange={e => setProp('coverTitle', e.target.value)} className="bg-background" />
                                        <Input label="Subtítulo" value={config.coverSubtitle} onChange={e => setProp('coverSubtitle', e.target.value)} className="bg-background" />
                                        <Input label="Nombre Consultora" value={config.entityName} onChange={e => setProp('entityName', e.target.value)} className="bg-background" />
                                    </div>
                                )}

                                {previewMode === 'intro' && (
                                    <div className="space-y-6">
                                        <Select label="Idioma del Informe" value={config.reportLanguage} onChange={handleLanguageChange} className="bg-background">
                                            <option value="es">Español (ES)</option>
                                            <option value="ca">Catalán (CA)</option>
                                            <option value="en">Inglés (EN)</option>
                                        </Select>
                                        <Input label="Título Introducción" value={config.introTitle} onChange={e => setProp('introTitle', e.target.value)} className="bg-background" />
                                        <TextArea label="Contenido (acepta párrafos e ítems)" rows={12} value={config.introText} onChange={e => setProp('introText', e.target.value)} className="bg-background" />
                                        <p className="text-xs text-muted-foreground italic">* Esta página aparecerá sin encabezado ni pie para un diseño minimalista.</p>
                                    </div>
                                )}

                                {previewMode === 'conclusion' && (
                                    <div className="space-y-6">
                                        <Input label="Título Bloque Cierre" value={config.conclusionTitle} onChange={e => setProp('conclusionTitle', e.target.value)} className="bg-background" />
                                        
                                        <TextArea 
                                            label="Tu Conclusión Personalizada" 
                                            rows={4} 
                                            value={config.conclusionIntro || ''} 
                                            onChange={e => setProp('conclusionIntro', e.target.value)} 
                                            className="bg-background"
                                            placeholder="Introduce un texto que aparecerá entre el título y las tarjetas..."
                                        />

                                        <TextArea label="Información de contacto" rows={8} value={config.conclusionText} onChange={e => setProp('conclusionText', e.target.value)} className="bg-background" />
                                        
                                        <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                                            <p className="text-xs font-bold text-primary uppercase mb-1">Bloque de Marketing Fijo</p>
                                            <p className="text-xs text-muted-foreground leading-relaxed italic">Este bloque aparecerá al lado de tu conclusión con el logo de GrantsWin y vuestra información de contacto para captación.</p>
                                        </div>
                                    </div>
                                )}

                                {previewMode === 'email' && (
                                    <div className="space-y-6">
                                        <Input label="Asunto del Correo" value={config.emailSubject} onChange={e => setProp('emailSubject', e.target.value)} className="bg-background" />
                                        <TextArea label="Contenido del Correo" rows={14} value={config.emailBody} onChange={e => setProp('emailBody', e.target.value)} className="bg-background" />
                                        <p className="text-xs text-muted-foreground">* Usa el botón "Enviar Dossier" en Gestión Clientes para usar esta configuración.</p>
                                    </div>
                                )}
                            </Card>
                        </div>

                        <div className="lg:col-span-8 bg-muted/20 dark:bg-neutral-900/20 rounded-3xl p-12 flex justify-center overflow-auto max-h-[80vh] shadow-lg">
                            <div className="bg-card text-neutral-900 shadow-2xl rounded-sm w-[500px] aspect-[1/1.41] p-10 flex flex-col relative overflow-hidden ring-1 ring-black/5">
                                {previewMode === 'cover' && (
                                    <div className={`flex flex-col h-full ${config.coverLayout === 'classic-centered' ? 'items-center justify-center text-center' : 'justify-center pl-8 text-center'}`}>
                                        {config.coverLayout === 'modern-sidebar' && (
                                            <div className="absolute top-0 bottom-0 left-0 w-4" style={{ backgroundColor: config.primaryColor }}></div>
                                        )}
                                        {config.logoBase64 && <img src={config.logoBase64} className="h-64 mb-10 object-contain max-w-full mx-auto" />}
                                        <h1 className="text-3xl font-black uppercase mb-4" style={{ color: config.primaryColor }}>{config.coverTitle}</h1>
                                        <p className="text-xl text-neutral-500 font-medium">{config.coverSubtitle}</p>
                                        <div className={`mt-20 pt-10 border-t border-neutral-100 w-full ${config.coverLayout === 'classic-centered' ? 'border-t-2 w-1/3 mx-auto' : ''}`}>
                                            <p className="text-xs font-bold text-neutral-900">{config.entityName}</p>
                                        </div>
                                    </div>
                                )}
                                {previewMode === 'intro' && (
                                    <div className="flex flex-col gap-6">
                                        <h2 className="text-2xl font-black uppercase" style={{ color: config.primaryColor }}>{config.introTitle}</h2>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-neutral-800">{config.introText}</p>
                                        <div className="absolute bottom-10 right-10 text-xs text-neutral-400">Pág. 2</div>
                                    </div>
                                )}
                                {previewMode === 'conclusion' && (
                                    <div className="flex flex-col h-full justify-between">
                                        <div>
                                            <h2 className="text-2xl font-black uppercase mb-6" style={{ color: config.primaryColor }}>{config.conclusionTitle}</h2>
                                            <div className="mb-8">
                                                <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-wrap break-words">{config.conclusionIntro}</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex-1 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl min-h-[150px]">
                                                    <p className="text-xs text-neutral-600 leading-relaxed break-words">{config.conclusionText}</p>
                                                </div>
                                                <div className="flex-1 p-4 border-2 border-primary/20 rounded-2xl bg-card min-h-[150px]">
                                                    <p className="text-xs font-black text-primary mb-2">GrantsWin</p>
                                                    <p className="text-xs text-neutral-400 break-words">Te invitamos a utilizar nuestra Suite...</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-10 right-10 text-xs text-neutral-400">Pág. 10</div>
                                    </div>
                                )}
                                {previewMode === 'email' && (
                                    <div className="flex flex-col gap-4">
                                        <div className="p-4 bg-neutral-50 border rounded-xl">
                                            <p className="text-xs font-bold text-neutral-400 uppercase">Asunto:</p>
                                            <p className="text-xs font-bold text-neutral-900">{config.emailSubject}</p>
                                        </div>
                                        <div className="p-6 bg-neutral-50 border rounded-xl flex-grow">
                                            <p className="text-xs leading-relaxed whitespace-pre-wrap text-neutral-700">{config.emailBody}</p>
                                            <div className="mt-8 p-3 bg-primary text-neutral-50 text-xs font-bold rounded-lg text-center w-40">Descargar Dossier</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplateSettings;
