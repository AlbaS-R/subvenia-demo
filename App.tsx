
import React, { useState, useRef, useEffect } from 'react';
import type { Project, FindData, UserProfile, BatchEntityResult, BatchProcessingItem } from './types';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Stage1GatherInfo from './components/Stage1_GatherInfo';
import Stage2_GenerateConcept from './components/Stage2_GenerateConcept';
import Stage3_DistributeReport from './components/Stage3_DistributeReport';
import ProjectDashboard from './components/ProjectDashboard';
import IntroScreen from './components/IntroScreen';
import { type LandingPage } from './components/LandingNavbar';
import PricingScreen from './components/PricingScreen';
import Header from './components/Header';
import TemplateSettings from './components/TemplateSettings';
import Chatbot from './components/Chatbot';
import Login from './components/Login';
import BatchProcessor from './components/BatchProcessor';
import { projectService } from './services/projectService';
import { getTemplateConfig } from './utils/templateStorage';
import { generatePdfFromJson } from './utils/pdfGenerator';
import { supabase } from './supabase-client';
import { HistoryPanel } from './components/panels/HistoryPanel';
import { AppsPanel } from './components/panels/AppsPanel';

const initialFindData: FindData = {
    jobId: null,
    templateConfig: undefined,
    stage1: {
        companyName: '',
        websiteUrl: '',
        pastedText: '',
        reportLanguage: 'es',
        keywords: { core: [], horizontal: [], action: [] },
        business_summary: '',
        description: '',
        sectorPrincipal: '',
        sectoresSecundarios: [],
        targetSectors: [],
        keyServices: [],
        main_location: '',
        fundingTypes: {
            internationalSubsidies: { enabled: true, country: '' },
            nationalSubsidies: { enabled: false, category: '' },
        },
        projectDetails: { title: '', description: '', category: '', scope: '' },
        searchStartDate: '',
        searchEndDate: '',
        selectedEntityIds: []
    },
    stage2: {},
    stage4_searchResults: [],
};

const AppContent: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const { showToast } = useToast();
    
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [findData, setFindData] = useState<FindData>(initialFindData);
    const [currentStage, setCurrentStage] = useState(1);
    const [maxReachedStage, setMaxReachedStage] = useState(1);
    const [started, setStarted] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    
    const [batchProfiles, setBatchProfiles] = useState<BatchProcessingItem[]>([]);
    const [isBatchMode, setIsBatchMode] = useState(false);
    const [isRestartingAudit, setIsRestartingAudit] = useState(false);

    // New UI States
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
    const [isAppsPanelOpen, setIsAppsPanelOpen] = useState(false);
    const [landingPage, setLandingPage] = useState<LandingPage>('intro');

    const findDataRef = useRef(findData);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => { findDataRef.current = findData; }, [findData]);

    const loadProjects = async () => {
        try {
            const data = await projectService.getProjects();
            setProjects(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => { if (user) loadProjects(); }, [user?.id]);

    const handleAutoSave = (updates: Partial<FindData>, newStage?: number) => {
        if (!activeProjectId) return;
        const updated = { ...findData, ...updates };
        setFindData(updated);
        
        if (newStage) {
            setCurrentStage(newStage);
            if (newStage > maxReachedStage) setMaxReachedStage(newStage);
        }

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await projectService.updateProject(
                    activeProjectId, 
                    { ...findDataRef.current, ...updates }, 
                    newStage || currentStage, 
                    Math.max(maxReachedStage, newStage || currentStage)
                );
                loadProjects();
            } catch (e) {
                console.error("Error saving:", e);
            }
        }, 1000);
    };

    const handleRenameProject = async (id: string, newName: string) => {
        try {
            const project = projects.find(p => p.id === id);
            if (!project) return;

            const updatedFindData = { ...project.findData!, stage1: { ...project.findData!.stage1, companyName: newName } };
            await projectService.updateProject(id, updatedFindData, project.currentStage || 1, project.maxReachedStage || 1);
            
            setProjects(prev => prev.map(p => p.id === id ? { ...p, name: newName, findData: updatedFindData } : p));
            if (activeProjectId === id) setFindData(updatedFindData);
            
            showToast("Nombre actualizado", "success");
        } catch (error) {
            showToast("Error al renombrar", "error");
        }
    };

    const handleBatchFinished = async (batchResults: BatchEntityResult[]) => {
        if (!activeProjectId || !user) return;

        try {
            showToast("Finalizando auditoría y sincronizando informes...", "info");

            const updatedBatchResultsWithUrls = await Promise.all(
                batchResults.map(async (entityResult) => {
                    const pdfDoc = generatePdfFromJson({
                        empresa_analizada: entityResult.entityName,
                        convocatorias: entityResult.reports
                    }, findData.templateConfig);
                    const pdfBlob = pdfDoc.output('blob');

                    const safeName = entityResult.entityName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                    const filePath = `informes_clientes/${user.id}/${activeProjectId}_${safeName}_${Date.now()}.pdf`;

                    const { error: uploadError } = await supabase.storage
                        .from('informes_find_corp')
                        .upload(filePath, pdfBlob, { contentType: 'application/pdf', upsert: true });
                    if (uploadError) throw uploadError;

                    const { data: urlData, error: urlError } = await supabase.storage
                        .from('informes_find_corp')
                        .createSignedUrl(filePath, 2592000); 
                    if (urlError) throw urlError;

                    return { ...entityResult, reportUrl: urlData.signedUrl };
                })
            );

            const updatedFindData = {
                ...findData,
                isBatch: true,
                batchResults: updatedBatchResultsWithUrls,
                jobId: `batch_${Date.now()}`
            };

            const targetStage = 8; 
            await projectService.updateProject(activeProjectId, updatedFindData, targetStage, Math.max(maxReachedStage, targetStage));

            setFindData(updatedFindData);
            setCurrentStage(targetStage);
            setMaxReachedStage(prev => Math.max(prev, targetStage));
            loadProjects();
            setIsBatchMode(false);
            setIsRestartingAudit(false);
            
            showToast("Dossiers listos", "success");
        } catch (error: any) {
            console.error(error);
            showToast("Error al guardar informes", "error");
            const updatedFindData = { ...findData, isBatch: true, batchResults };
            setFindData(updatedFindData);
            handleAutoSave(updatedFindData, 8);
        }
    };

    const handleStartNewProject = async () => {
        if (!user) return;
        const config = getTemplateConfig(user.email);
        const freshData = { ...initialFindData, templateConfig: config };
        try {
            const newId = await projectService.createProject(freshData, user.id);
            setFindData(freshData);
            setActiveProjectId(newId);
            setCurrentStage(1);
            setMaxReachedStage(1);
            setStarted(true);
            setIsBatchMode(false);
            setIsRestartingAudit(false);
            loadProjects();
        } catch (error) {
            showToast("Error al crear el proyecto", "error");
        }
    };

    const handleLoadProject = (project: Project) => {
        if (project.findData) {
            setFindData(project.findData);
            setActiveProjectId(project.id);
            setCurrentStage(project.currentStage || 1);
            setMaxReachedStage(project.maxReachedStage || 1);
            setStarted(true);
            setIsBatchMode(!!project.findData.isBatch);
            setIsRestartingAudit(false);
            setIsHistoryPanelOpen(false); // Close panel on select
        }
    };

    const handleDeleteProject = async (project: Project) => {
        try {
            await projectService.deleteProject(project.id);
            loadProjects();
            if (activeProjectId === project.id) {
                setStarted(false);
                setActiveProjectId(null);
            }
            showToast("Proyecto eliminado", "success");
        } catch (error) {
            showToast("Error al eliminar el proyecto", "error");
        }
    };

    const handleBackNavigation = () => {
        setCurrentStage(prev => {
            if (prev === 8) return 3; 
            return Math.max(1, prev - 1);
        });
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center font-poppins font-bold">Cargando...</div>;
    if (!user) return <Login />;

    const activeProject = projects.find(p => p.id === activeProjectId);

    const renderCurrentStage = () => {
        // Mostramos el procesador si estamos en modo batch o si estamos en la etapa 3 y ya hay resultados guardados (para ver el historial)
        if ((isBatchMode && (currentStage === 4 || currentStage === 3)) || (currentStage === 3 && findData.batchResults && findData.batchResults.length > 0 && !isRestartingAudit)) {
            return <BatchProcessor 
                        profiles={batchProfiles.length > 0 ? batchProfiles : (findData.batchResults?.map(r => ({ id: r.profileId, profile: { company_name: r.entityName } } as any)) || [])} 
                        templateConfig={findData.templateConfig}
                        onFinished={handleBatchFinished}
                        searchStartDate={findData.stage1.searchStartDate}
                        searchEndDate={findData.stage1.searchEndDate}
                        initialResults={findData.batchResults}
                        onRestart={() => setIsRestartingAudit(true)}
                        onContinue={() => setCurrentStage(8)}
                    />;
        }

        switch (currentStage) {
            case 1:
                return <TemplateSettings onComplete={(config) => handleAutoSave({ templateConfig: config }, 2)} initialConfig={findData.templateConfig} />;
            case 2:
                return <Stage1GatherInfo onComplete={(jobId, selectedProfiles) => { if (selectedProfiles && selectedProfiles.length >= 1) { setBatchProfiles(selectedProfiles); setIsBatchMode(true); setCurrentStage(4); } else { handleAutoSave({ jobId }, 3); } }} data={findData.stage1} updateData={(data) => handleAutoSave({ stage1: { ...findData.stage1, ...data } })} jobId={findData.jobId} setJobId={(id) => handleAutoSave({ jobId: id })} />;
            case 3:
                return <Stage2_GenerateConcept onComplete={() => { const singleItem: BatchProcessingItem = { id: activeProjectId || 'single', profile: { id: activeProjectId || 'single', user_id: user?.id || '', company_name: findData.stage1.companyName, website: findData.stage1.websiteUrl, description: findData.stage1.description, sector_principal: findData.stage1.sectorPrincipal, last_modified: new Date().toISOString() }, status: 'waiting', progress: 0, keywords_es: findData.stage1.nationalFilterKeywords || '', keywords_en: findData.stage1.internationalFilterKeywords || '', logs: { business_summary: findData.stage1.business_summary, keywords: findData.stage1.keywords, validations: [] } }; setBatchProfiles([singleItem]); setIsBatchMode(true); setCurrentStage(4); }} inputData={findData.stage1} updateInputData={(data) => handleAutoSave({ stage1: { ...findData.stage1, ...data } })} jobId={findData.jobId} />;
            case 7:
                return <Stage3_DistributeReport onSave={() => {}} onNavigateToDashboard={() => setCurrentStage(8)} findData={findData} />;
            case 8:
                 return <ProjectDashboard projects={projects} onDeleteProject={handleDeleteProject} onDuplicateProject={() => {}} onSelectProject={handleLoadProject} onRestartProject={handleStartNewProject} currentProjectId={activeProjectId} />;
            default:
                return <ProjectDashboard projects={projects} onDeleteProject={handleDeleteProject} onDuplicateProject={()=>{}} onSelectProject={handleLoadProject} currentProjectId={activeProjectId} />;
        }
    }

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden">
            <div aria-hidden className="site-mesh-bg" />
            <div aria-hidden className="site-aurora-layer" />
            <div aria-hidden className="site-flow-gradient" />
            <div aria-hidden className="site-grid-overlay" />
            <Sidebar
                currentStage={started ? currentStage : 0}
                maxReachedStage={maxReachedStage}
                onStageSelect={setCurrentStage}
                onGoHome={() => {
                    setStarted(false);
                    setLandingPage('intro');
                }}
                isStarted={started}
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
                onOpenHistory={() => setIsHistoryPanelOpen(true)}
                onOpenApps={() => setIsAppsPanelOpen(true)}
            />
            
            <main className="relative flex-grow flex flex-col bg-transparent w-full h-full overflow-y-auto">
                <div className="relative w-full max-w-[92rem] mx-auto px-4 sm:px-8 lg:px-10 py-4 sm:py-8 flex-grow flex flex-col min-h-full">
                    {!started ? (
                        <div className="glass-panel rounded-[2rem] p-4 sm:p-6 md:p-8">
                            {landingPage === 'intro' ? (
                                <IntroScreen onStart={handleStartNewProject} />
                            ) : (
                                <PricingScreen onStart={handleStartNewProject} />
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col flex-grow">
                            <Header currentStage={currentStage} onBack={handleBackNavigation} activeProject={activeProject} onRenameProject={handleRenameProject} />
                            <div className="mt-4 sm:mt-8 flex-grow">
                                {renderCurrentStage()}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            
            <HistoryPanel
                isOpen={isHistoryPanelOpen}
                onClose={() => setIsHistoryPanelOpen(false)}
                projects={projects}
                activeProjectId={activeProjectId}
                onSelectProject={handleLoadProject}
                onDeleteProject={handleDeleteProject}
                onRenameProject={handleRenameProject}
            />

            <AppsPanel 
                isOpen={isAppsPanelOpen}
                onClose={() => setIsAppsPanelOpen(false)}
            />

            <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>
    );
};

const App: React.FC = () => (
    <AuthProvider><ThemeProvider><LanguageProvider><ToastProvider><AppContent/></ToastProvider></LanguageProvider></ThemeProvider></AuthProvider>
);
export default App;
