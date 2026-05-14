
import React, { useState, useMemo, useEffect } from 'react';
import type { Project } from '../types';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { TextArea } from './common/TextArea';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { generatePdfFromJson } from '../utils/pdfGenerator';
import PdfPreviewer from './common/PdfPreviewer';
import { jsPDF } from 'jspdf';
import ConfirmationModal from './common/ConfirmationModal';
import { Card } from './common/Card';
import { getSenderEmail } from '../utils/emailUtils';

// --- CONFIGURACIÓN DE SMTP2GO ---
const SMTP2GO_API_KEY = "api-57A82AC4CE8248AB9079017E38F0BF89";
const SMTP2GO_TEMPLATE_ID = "6422747";

interface ProjectDashboardProps {
    projects: Project[];
    onDeleteProject: (project: Project) => void;
    onDuplicateProject: (project: Project) => void;
    onSelectProject?: (project: Project) => void;
    onRestartProject?: () => void;
    currentProjectId?: string | null;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
    projects,
    onDeleteProject,
    onSelectProject,
    onRestartProject,
    currentProjectId
}) => {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [selectedEntityIdx, setSelectedEntityIdx] = useState(0);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
    const [activePdf, setActivePdf] = useState<jsPDF | null>(null);
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    const [pdfScale, setPdfScale] = useState(1.0);
    const [pdfPage, setPdfPage] = useState(1);
    const [pdfTotalPages, setPdfTotalPages] = useState(0);

    const [emailForm, setEmailForm] = useState({
        to_email: '', 
        sender_name: '', 
        sender_email: '', 
        subject: '', 
        message: '', 
        report_link: '',
        additional_reply_to: '' // Nuevo campo para respuestas adicionales
    });

    // Determinar el email de respuesta dinámicamente según el dominio del usuario
    const defaultReplyEmail = useMemo(() => getSenderEmail(user?.email), [user?.email]);

    const currentProject = useMemo(() =>
        projects.find(p => p.id === currentProjectId) || null,
        [projects, currentProjectId]
    );

    const entities = useMemo(() => {
        if (!currentProject?.findData) return [];
        if (currentProject.findData.batchResults && currentProject.findData.batchResults.length > 0) {
            return currentProject.findData.batchResults;
        }
        const stage1 = currentProject.findData.stage1 as any;
        const stage2Result = currentProject.findData.stage2?.result;
        return [{
            entityName: stage2Result?.empresa_analizada || stage1?.companyName || currentProject.name,
            reports: stage2Result?.convocatorias || [],
            reportUrl: undefined,
            emailContact: stage1?.emailContact || ''
        }] as any[];
    }, [currentProject]);

    const activeEntity = entities[selectedEntityIdx];
    const config = currentProject?.findData?.templateConfig;

    useEffect(() => {
        if (activeEntity && config && activeEntity.reports?.length > 0) {
            try {
                const doc = generatePdfFromJson({
                    empresa_analizada: activeEntity.entityName,
                    convocatorias: activeEntity.reports
                }, config);
                setActivePdf(doc);
                setPdfPage(1);
            } catch (e) {
                console.error("Error al generar PDF:", e);
                setActivePdf(null);
            }
        } else {
            setActivePdf(null);
        }
    }, [activeEntity, config]);

    const handleOpenEmailModal = () => {
        if (!activeEntity || !config) return;
        const name = user?.user_metadata?.full_name || 'Consultor';
        const link = activeEntity.reportUrl || '';

        let personalizedSubject = config.emailSubject || '';
        personalizedSubject = personalizedSubject.replace(/{{Empresa}}/g, activeEntity.entityName);
        personalizedSubject = personalizedSubject.replace(/{{Entidad}}/g, config.entityName);

        let personalizedBody = config.emailBody || '';
        personalizedBody = personalizedBody.replace(/{{Empresa}}/g, activeEntity.entityName);
        personalizedBody = personalizedBody.replace(/{{Entidad}}/g, config.entityName);

        setEmailForm({
            to_email: activeEntity?.emailContact || '',
            sender_name: name,
            sender_email: user?.email || '',
            subject: personalizedSubject,
            message: personalizedBody,
            report_link: link,
            additional_reply_to: '' // Resetear adicionales al abrir
        });
        setIsEmailModalOpen(true);
    };

    const handleSendSMTP2GO = async () => {
        if (!emailForm.to_email || !emailForm.to_email.includes('@')) {
            showToast('Por favor, indica un email de destino válido.', 'warning');
            return;
        }

        setIsSendingEmail(true);

        try {
            const brandMapping: Record<string, string> = {
                "info@acceleralia.com": "Acceleralia",
                "clientes@fundswin.ai": "FundsWin",
                "oportunitats@clusterdigital.cat": "Cluster Digital"
            };

            const brandName = brandMapping[defaultReplyEmail] || config?.entityName || "Acceleralia";

            // Construir el Reply-To final (el de por defecto + los adicionales si existen)
            let finalReplyTo = defaultReplyEmail;
            if (emailForm.additional_reply_to.trim()) {
                // Limpiar espacios y asegurar que sea una lista separada por comas
                const cleanAdditionals = emailForm.additional_reply_to.split(',').map(e => e.trim()).filter(e => e.includes('@')).join(', ');
                if (cleanAdditionals) {
                    finalReplyTo = `${defaultReplyEmail}, ${cleanAdditionals}`;
                }
            }

            const response = await fetch('https://api.smtp2go.com/v3/email/send', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    api_key: SMTP2GO_API_KEY.trim(),
                    to: [emailForm.to_email.trim()],
                    sender: `${brandName} <${defaultReplyEmail}>`,
                    reply_to: finalReplyTo,
                    custom_headers: [
                        {
                            "header": "Reply-To",
                            "value": finalReplyTo
                        }
                    ],
                    template_id: SMTP2GO_TEMPLATE_ID,
                    template_data: {
                        "subject": emailForm.subject.trim(),
                        "message": emailForm.message,
                        "link": emailForm.report_link,
                        "first_name": activeEntity.entityName 
                    }
                })
            });

            const result = await response.json();

            if (response.ok && result.data && result.data.succeeded > 0) {
                showToast(`¡Email enviado con éxito desde ${brandName}!`, 'success');
                setIsEmailModalOpen(false);
            } else {
                const apiError = result.data?.error || 
                                 (result.data?.failures && result.data.failures[0]) || 
                                 'Error en el servidor de correo.';
                throw new Error(apiError);
            }
        } catch (error: any) {
            console.error("Error envío SMTP2GO:", error);
            showToast(error.message || 'Error al procesar el envío', 'error');
        } finally {
            setIsSendingEmail(false);
        }
    };

    const handleZoomIn = () => setPdfScale(prev => Math.min(prev + 0.25, 3.0));
    const handleZoomOut = () => setPdfScale(prev => Math.max(prev - 0.25, 0.5));
    const handlePrevPdfPage = () => setPdfPage(prev => Math.max(1, prev - 1));
    const handleNextPdfPage = () => setPdfPage(prev => Math.min(pdfTotalPages, prev + 1));

    if (!currentProject) {
        return (
            <div className="flex flex-col gap-10 h-full animate-fade-in py-10">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground font-poppins">Gestión de Clientes</h2>
                    <p className="text-muted-foreground font-medium italic text-lg font-roboto">Selecciona un proyecto del historial para gestionar sus dossiers.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map(p => (
                        <Card key={p.id} onClick={() => onSelectProject?.(p)} className="p-8 cursor-pointer transition-all rounded-3xl shadow-md hover:shadow-lg group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined">folder_open</span>
                                </div>
                                <span className="text-xs font-black uppercase bg-muted/50 px-3 py-1 rounded-full text-muted-foreground font-poppins">
                                    {new Date(p.lastModified).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight mb-2 truncate text-foreground font-poppins">{p.name}</h3>
                            <p className="text-xs text-muted-foreground mb-6 line-clamp-2 font-roboto">{p.websiteUrl || 'Sin URL asociada'}</p>
                            <div className="flex items-center gap-2 pt-4 border-t border-border">
                                <span className="text-xs font-black text-primary uppercase font-poppins">Abrir Gestión</span>
                                <span className="material-symbols-outlined text-primary text-sm">arrow_forward</span>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (!config) return null;

    return (
        <div className="fullscreen-panel fixed inset-0 lg:left-72 z-[80] border-l border-border flex flex-col lg:flex-row overflow-hidden animate-fade-in">
            {/* COLUMNA IZQUIERDA: Lista de Empresas */}
            <div className="w-full lg:w-80 bg-card border-r border-border flex flex-col h-[30vh] lg:h-full shadow-2xl relative z-20">
                <div className="h-24 px-6 border-b border-border flex-shrink-0 bg-muted/10 flex flex-col justify-center">
                    <h3 className="font-black text-xl uppercase tracking-tighter text-foreground font-poppins">Gestión Clientes</h3>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest font-poppins">Seleccionar Entidad</p>
                </div>

                <div className="flex-grow overflow-y-auto p-4 custom-scrollbar bg-background">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-3 mb-4 font-poppins">Empresas del Proyecto</p>
                    <div className="flex flex-col gap-2">
                        {entities.map((entity, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedEntityIdx(idx)}
                                className={`w-full text-left p-4 rounded-2xl transition-all duration-200 ${selectedEntityIdx === idx ? 'bg-primary/5 shadow-sm ring-2 ring-primary' : 'bg-transparent opacity-70 hover:opacity-100 hover:bg-muted/50'}`}
                            >
                                <h4 className={`font-black text-xs uppercase truncate font-poppins ${selectedEntityIdx === idx ? 'text-primary' : 'text-foreground'}`}>{entity.entityName}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-bold text-muted-foreground uppercase font-poppins">{entity.reports?.length || 0} Estrategias</span>
                                    {entity.reportUrl && <span className="material-symbols-outlined text-xs text-tertiary-500">cloud_done</span>}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-border">
                    <Button
                        variant="ghost"
                        onClick={() => setIsRestartModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl hover:bg-primary/5 text-primary font-black uppercase text-xs tracking-widest"
                    >
                        <span className="material-symbols-outlined text-base">restart_alt</span>
                        Comenzar de nuevo
                    </Button>
                </div>
            </div>

            {/* COLUMNA DERECHA */}
            <div className="flex-grow h-[70vh] lg:h-full bg-black/20 flex flex-col relative overflow-hidden backdrop-blur-sm">
                <div className="w-full min-h-24 glass-panel text-neutral-50 px-6 py-4 flex flex-col xl:flex-row items-center justify-between gap-4 z-30 shadow-lg flex-shrink-0 border-b border-neutral-50/5">
                    <div className="min-w-0 flex items-center gap-4 flex-shrink-0">
                        <div className="text-center xl:text-left">
                            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none mb-1 max-w-[250px] md:max-w-[400px] truncate font-poppins" title={currentProject.name}>
                                {currentProject.name}
                            </h3>
                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-neutral-50/50 font-poppins">Gestión de Proyecto</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="text-neutral-50/40 hover:text-red-500 hover:bg-neutral-50/5 p-2 h-9 w-9 rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">delete</span>
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 justify-center xl:justify-end">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => activePdf?.save(`Dossier_${activeEntity?.entityName}.pdf`)}
                                disabled={!activePdf}
                                className="shadow-lg h-9 text-xs md:text-sm"
                            >
                                <span className="material-symbols-outlined mr-1 md:mr-2 text-base">download</span> Descargar
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleOpenEmailModal}
                                className="shadow-lg h-9 text-xs md:text-sm"
                            >
                                <span className="material-symbols-outlined mr-1 md:mr-2 text-base">mail</span> Email
                            </Button>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 bg-neutral-50/10 rounded-lg p-0.5 border border-neutral-50/10">
                                <button onClick={handlePrevPdfPage} disabled={pdfPage <= 1} className="p-1.5 hover:bg-neutral-50/10 rounded-md transition-colors disabled:opacity-30">
                                    <span className="material-symbols-outlined text-base">chevron_left</span>
                                </button>
                                <span className="text-[10px] md:text-xs font-bold w-12 md:w-16 text-center font-poppins">
                                    {pdfPage}/{pdfTotalPages}
                                </span>
                                <button onClick={handleNextPdfPage} disabled={pdfPage >= pdfTotalPages} className="p-1.5 hover:bg-neutral-50/10 rounded-md transition-colors disabled:opacity-30">
                                    <span className="material-symbols-outlined text-base">chevron_right</span>
                                </button>
                            </div>
                            <div className="flex items-center gap-1 bg-neutral-50/10 rounded-lg p-0.5 border border-neutral-50/10">
                                <button onClick={handleZoomOut} className="p-1.5 hover:bg-neutral-50/10 rounded-md transition-colors">
                                    <span className="material-symbols-outlined text-base">remove</span>
                                </button>
                                <span className="text-[10px] md:text-xs font-bold w-10 text-center font-poppins">
                                    {Math.round(pdfScale * 100)}%
                                </span>
                                <button onClick={handleZoomIn} className="p-1.5 hover:bg-neutral-50/10 rounded-md transition-colors">
                                    <span className="material-symbols-outlined text-base">add</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-grow w-full relative overflow-hidden">
                    <div className="absolute inset-0">
                        {activePdf ?
                            <PdfPreviewer
                                pdfDoc={activePdf}
                                scale={pdfScale}
                                pageNumber={pdfPage}
                                onLoadSuccess={(pages) => setPdfTotalPages(pages)}
                            /> : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
                                    <span className="material-symbols-outlined text-5xl animate-pulse">picture_as_pdf</span>
                                    <p className="text-base font-medium uppercase tracking-widest font-roboto">Generando PDF...</p>
                                </div>
                            )}
                    </div>
                </div>
            </div>

            {/* MODALES */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => { if (currentProject) onDeleteProject(currentProject); setIsDeleteModalOpen(false); }}
                title="¿Eliminar Proyecto?"
                message={`Se borrará "${currentProject?.name}" permanentemente.`}
            />

            <ConfirmationModal
                isOpen={isRestartModalOpen}
                onClose={() => setIsRestartModalOpen(false)}
                onConfirm={() => { onRestartProject?.(); setIsRestartModalOpen(false); }}
                title="¿Comenzar de nuevo?"
                message="Se iniciará una nueva auditoría desde el principio."
            />

            {isEmailModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg bg-card rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                        <div className="p-8 bg-neutral-800 text-neutral-100 flex justify-between items-center">
                            <h3 className="text-2xl font-black uppercase tracking-tighter font-poppins">Enviar Dossier</h3>
                            <Button variant="ghost" size="md" onClick={() => setIsEmailModalOpen(false)}><span className="material-symbols-outlined">close</span></Button>
                        </div>
                        <div className="p-8 space-y-5 overflow-y-auto max-h-[65vh]">
                            <Input label="Email del Cliente" value={emailForm.to_email} onChange={e => setEmailForm({ ...emailForm, to_email: e.target.value })} />
                            
                            <Input 
                                label="Emails adicionales de respuesta:" 
                                value={emailForm.additional_reply_to} 
                                onChange={e => setEmailForm({ ...emailForm, additional_reply_to: e.target.value })} 
                                placeholder="ejemplo@correo.com, socio@correo.com"
                            />
                            
                            <Input label="Asunto" value={emailForm.subject} onChange={e => setEmailForm({ ...emailForm, subject: e.target.value })} />
                            <TextArea rows={6} label="Mensaje" value={emailForm.message} onChange={e => setEmailForm({ ...emailForm, message: e.target.value })} />
                            
                            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                <p className="text-[10px] text-primary font-bold uppercase">Respuesta principal (por dominio):</p>
                                <p className="text-[11px] text-muted-foreground">{defaultReplyEmail}</p>
                            </div>
                        </div>
                        <div className="p-8 border-t border-border flex gap-3">
                            <Button variant="ghost" onClick={() => setIsEmailModalOpen(false)} className="flex-1">Cancelar</Button>
                            <Button onClick={handleSendSMTP2GO} isLoading={isSendingEmail} className="flex-1 shadow-xl">Enviar Ahora</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDashboard;
