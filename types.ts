
export type TFunction = (key: string, ...args: any[]) => any;

export interface TechnicalSummary {
    objetivo: string;
    condiciones: string;
    requisitos: string;
    presupuesto: string;
    intensidadAyuda: string;
}

export interface StrategicReport {
    tituloComercial: string;
    estado: string;
    overallScore: number;
    projectedScore?: number;
    markdownReport?: string; 
    evaluacionEncaje: {
        cliente_nombre?: string;
        convocatoria_titulo?: string;
        fuente_procedencia?: string; 
        convocatoria_url?: string;
        convocatoria_entidad?: string;
        convocatoria_documento_nombre?: string;
        convocatoria_estado?: string;
        cierre?: string;
        presupuesto?: string;
        // Nuevos campos solicitados
        source_id?: string;
        publicacion?: string;
    };
    technicalSummary?: TechnicalSummary; 
    aiCore: {
        analisisValor: string;
        analisisCompatibilidad: string; 
        puntosFuertes: string;
        puntosFlojos: string; 
    };
    marcoFinanciero: {
        programa: string;
        tipoAccion: string;
        presupuestoProyecto: string;
        ratioFinanciacion: string;
    };
    roadmap: string[];
    proximosPasos?: string[]; // Nuevo campo para pasos accionables
    // Soporte para formatos de informes heredados o extendidos
    resumenTecnico?: any;
    analisisEncaje?: any;
    propuestaPreliminar?: any;
    checklistElegibilidadFinal?: string;
    siguientesPasos?: string;
    textoSugeridoMemoria?: any;
    datosFaltantes?: string;
    metadatos?: any;
}

export interface BatchEntityResult {
    entityName: string;
    profileId: string;
    emailContact?: string;
    business_summary: string;
    reports: StrategicReport[];
    reportUrl?: string;
}

export interface BatchProcessingItem {
    id: string;
    profile: UserProfile;
    status: 'waiting' | 'searching' | 'reporting' | 'completed' | 'error';
    progress: number;
    keywords_es: string; 
    keywords_en: string; 
    logs: {
        business_summary: string;
        keywords: { core: string[], horizontal: string[], action: string[] };
        validations: { title: string; score: number }[];
    };
}

export interface UserProfile {
    id: string;
    user_id: string;
    company_name: string;
    email_contact?: string;
    website: string;
    nif_vat?: string;
    tipo_entidad?: string;
    pais?: string;
    ciudad?: string;
    description?: string;
    location?: string;
    sector_principal?: string;
    sectores_secundarios?: string[];
    products?: string[];
    interest_sectors?: string[];
    experience?: any;
    palabras_clave_es?: string;
    palabras_clave_en?: string;
    last_modified: string;
    created_at?: string;
}

export interface UserProject {
    id: string;
    user_id: string;
    project_title: string;
    project_description: string;
    category: string;
    territorial_scope: string;
    estimated_budget?: number;
    tipo_iniciativa: string;
    areas_tematicas: string[];
    trl_actual: string;
    trl_objetivo: string;
    notas_internas: string;
    previous_experience: string;
    technical_capabilities: string;
    last_modified: string;
}

export interface ValidatedCallData {
    status: 'waiting' | 'analyzing' | 'completed' | 'error';
    analysis?: any;
    error?: string;
    strategicReport?: any;
    strategicReportStatus?: 'completed' | 'error';
}

export interface CompatibilityAnalysis {
    overallScore: number;
    matchLevel: string;
    criteriaBreakdown: any;
    analysis: {
        strengths: string;
        weaknesses: string; 
        justification: string;
    };
    technicalSummary: any;
    suggestedRole: string;
    pivotFeasibility: string;
    projectedScore: number;
}

export interface Signature {
    name: string;
    position: string;
    email: string;
    company: string;
    signed: boolean;
    date: string;
}

export interface SignatureEntry {
    name: string;
    email: string;
    company: string;
}

export interface PartnerProfile {
    id: string;
    affinityScore: number;
    country: string;
    entityType: string;
    sector: string;
    experience: string;
    tags: string[];
    role: string;
    website: string;
    contact_person: string;
    email: string;
    assignmentStatus: string;
}

export interface Partner {
    id: string;
    name: string;
    profiles: PartnerProfile[];
    activeProfileId: string | null;
}

export interface WorkPackage {
    id: string;
    title: string;
    description: string;
}

export interface Feedback {
    author: string;
    email: string;
    workPackageTitle: string;
    comment: string;
}

export interface PublicationVersion {
    id: string;
    title: string;
    summary: string;
    keyObjectives: string;
    cta: string;
    videoScript: string;
    imageUrl?: string;
}

export interface GrantData {
    stage1: any;
    stage2: any;
    stage3: {
        partners: Partner[];
    };
    stage4: {
        versions: PublicationVersion[];
        activeVersionId: string | null;
    };
    stage5: {
        feedbacks: Feedback[];
    };
    stage6: {
        partnerConformity: Record<string, Signature>;
    };
}

export interface FindData {
    jobId: string | null;
    isBatch?: boolean;
    batchResults?: BatchEntityResult[];
    templateConfig?: TemplateConfig;
    stage1: {
        companyName: string;
        websiteUrl: string;
        nifVat?: string;
        tipoEntidad?: string;
        pais?: string;
        ciudad?: string;
        pastedText: string;
        reportLanguage: string;
        keywords: { core: string[], horizontal: string[], action: string[] };
        business_summary: string;
        description: string;
        sectorPrincipal: string;
        sectoresSecundarios: string[];
        targetSectors: string[];
        keyServices: string[];
        main_location: string;
        fundingTypes: any;
        projectDetails: any;
        searchStartDate: string;
        searchEndDate: string;
        selectedEntityIds?: string[];
        nationalFilterKeywords?: string;
        internationalFilterKeywords?: string;
        nationalFilterKeywordsBase?: string;
        internationalFilterKeywordsBase?: string;
    };
    stage2: any;
    stage4_searchResults: any[];
    stage5_validationResults?: Record<string, ValidatedCallData>;
}

export interface TemplateConfig {
    coverLayout: 'modern-sidebar' | 'classic-centered';
    coverTitle: string;
    coverSubtitle: string;
    showSubtitle: boolean;
    logoBase64: string | null;
    logoScale: number;
    logoAspectRatio?: number; 
    primaryColor: string;
    entityName: string;
    fontHeading: string;
    fontBody: string;
    fontSizeBody: number;
    fontSizeTitle: number;
    fontSizeSubtitle: number;
    fontSizeHeader: number;
    fontSizeFooter: number;
    fontSizeCardTitle: number;
    fontSizeCardBody: number;
    titleColor: string;
    subtitleColor: string;
    bodyTextColor: string;
    headerTextColor: string;
    footerTextColor: string;
    cardBgColor: string;
    cardTitleColor: string;
    cardTextColor: string;
    accentColor: string;
    headerText: string;
    headerIncludeLogo: boolean;
    logoPosition: 'left' | 'center' | 'right';
    showSeparatorLine: boolean;
    footerText: string;
    showPageNumbers: boolean;
    watermarkEnabled: boolean;
    watermarkType: 'text' | 'image';
    watermarkText: string;
    watermarkOpacity: number;
    introTitle: string;
    introText: string;
    dnaTitle: string;
    specsTitle: string;
    reportLanguage: 'es' | 'ca' | 'en' | 'fr' | 'de' | 'it';
    conclusionTitle: string;
    conclusionIntro: string;
    conclusionText: string;
    signatures: any[];
    sigNameColor: string;
    sigEmailColor: string;
    sigCompanyColor: string;
    callHeaderBgColor: string;
    callTitleColor: string;
    emailSubject?: string;
    emailBody?: string;
    emailLinkPlaceholder?: string;
    emailSignature?: string;
}

export interface BrandTemplate {
    id: string;
    user_id: string;
    name: string;
    config: TemplateConfig;
    last_modified: string;
}

export interface Project {
    id: string;
    name: string;
    lastModified: string;
    websiteUrl: string;
    result: any;
    currentStage?: number;
    maxReachedStage?: number;
    findData?: FindData;
}
