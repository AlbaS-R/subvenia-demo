import { TemplateConfig } from '../types';

export const getMarketingText = (lang: string) => {
    const texts: Record<string, string> = {
        es: "Subvenia\nConvertimos vuestra base de socios en oportunidades reales de financiación: automáticas, escalables y medibles. Contacto: contacto@subvenia.ai",
        ca: "Subvenia\nConvertim la vostra base de socis en oportunitats reals de finançament: automàtiques, escalables i mesurables. Contacte: contacto@subvenia.ai",
        en: "Subvenia\nWe turn your member base into real funding opportunities: automated, scalable and measurable. Contact: contacto@subvenia.ai"
    };
    return texts[lang] || texts.es;
};

// Diccionario de textos editables por idioma - ACTUALIZADO
export const TEMPLATE_TEXTS: Record<string, Partial<TemplateConfig>> = {
    es: {
        coverTitle: 'MOTOR DE OPORTUNIDADES',
        coverSubtitle: 'Informe dinámico de financiación para socios y clientes',
        headerText: 'INFORME ESTRATÉGICO SUBVENIA',
        footerText: 'Confidencial. Este documento es propiedad de {{Entidad}}.',
        introTitle: 'SNAPSHOT DE FINANCIACIÓN',
        introText: 'Este dossier convierte datos corporativos y convocatorias públicas en una lectura accionable: dónde hay encaje, qué presupuesto puede activarse y qué pasos conviene priorizar.\n\nEl objetivo no es listar ayudas, sino construir un mapa de oportunidades que permita decidir rápido y activar financiación con criterio.',
        dnaTitle: 'ANÁLISIS DE ADN ESTRATÉGICO',
        specsTitle: 'ESPECIFICACIONES TÉCNICAS',
        conclusionTitle: 'ROADMAP DE ACTIVACIÓN',
        conclusionIntro: 'La recomendación es priorizar las oportunidades de mayor encaje, validar elegibilidad documental y convertir el informe en una secuencia de acciones comerciales y técnicas.',
        conclusionText: 'Siguiente movimiento: seleccionar las convocatorias prioritarias, preparar evidencias y activar la comunicación con el socio o cliente final.',
        emailSubject: 'Dossier Estratégico de Financiación: {{Empresa}}',
        emailBody:
            'Hola {{Empresa}},\n\n' +
            'Nos alegra contarte que hemos completado la auditoría técnica de tu perfil corporativo. ' +
            'Como resultado de este análisis, hemos preparado un informe personalizado donde se recogen ' +
            'las mejores oportunidades de financiación pública disponibles ahora mismo para tu sector.\n\n' +
            'Puedes acceder al informe completo y descargar la documentación técnica haciendo clic en el botón inferior.\n\n' +
            'Estamos a tu disposición para comentar cualquier duda sobre el informe y definir los próximos pasos ' +
            'en la preparación de tus candidaturas.',
        emailLinkPlaceholder: 'Ver Dossier Estratégico',
        emailSignature: 'Saludos,\nEl equipo de {{Entidad}}'
    },
    en: {
        coverTitle: 'FUNDING STRATEGY',
        coverSubtitle: 'Strategic Funding Report',
        headerText: 'STRATEGIC REPORT GW-FIND',
        footerText: 'Confidential. This document is property of {{Entidad}}.',
        introTitle: 'REPORT PRESENTATION',
        introText: 'After a deep analysis of your technological and operational DNA, we present this Strategic Dossier.\n\nThe objective of this document is to identify the public grant calls that best adapt to your current business plan, facilitating decision-making and financial planning.',
        dnaTitle: 'STRATEGIC DNA ANALYSIS',
        specsTitle: 'TECHNICAL SPECIFICATIONS',
        conclusionTitle: 'CONCLUSIONS AND ROADMAP',
        conclusionIntro: 'Based on your profile, we recommend prioritizing R&D grants due to their high intensity. We remain at your disposal to start the technical drafting phase.',
        conclusionText: '',
        emailSubject: 'Strategic Funding Dossier: {{Empresa}}',
        emailBody:
            'Hi {{Empresa}},\n\n' +
            "We're happy to let you know that we have completed the technical audit of your corporate profile. " +
            "As a result of this analysis, we've prepared a personalized report outlining the best public funding " +
            'opportunities currently available for your sector.\n\n' +
            'You can access the full report and download the technical documentation by clicking the button below.\n\n' +
            "We're at your disposal to answer any questions about the report and define the next steps " +
            'in preparing your applications.',
        emailLinkPlaceholder: 'View Strategic Dossier',
        emailSignature: 'Best regards,\nThe {{Entidad}} team'
    },
    ca: {
        coverTitle: 'ESTRATÈGIA DE FINANÇAMENT',
        coverSubtitle: 'Informe Estratègic de Finançament',
        headerText: 'INFORME ESTRATÈGIC GW-FIND',
        footerText: 'Confidencial. Aquest document és propietat de {{Entidad}}.',
        introTitle: 'PRESENTACIÓ DE L\'INFORME',
        introText: 'Després de l\'anàlisi profund del vostre ADN tecnològic i operatiu, presentem aquest Dossier Estratègic.\n\nL\'objectiu d\'aquest document és identificar les convocatòries d\'ajut públic que millor s\'adapten al vostre pla de negoci actual, facilitant la presa de decisions i la planificació financera.',
        dnaTitle: 'ANÀLISI D\'ADN ESTRATÈGIC',
        specsTitle: 'ESPECIFICACIONS TÈCNIQUES',
        conclusionTitle: 'CONCLUSIONS I FULL DE RUTA',
        conclusionIntro: 'Basant-nos en el vostre perfil, recomanem prioritzar els ajuts d\'R+D a causa de la seva alta intensitat. Restem a la vostra disposició per iniciar la fase de redacció tècnica.',
        conclusionText: '',
        emailSubject: 'Dossier Estratègic de Finançament: {{Empresa}}',
        emailBody:
            'Hola {{Empresa}},\n\n' +
            'Ens plau informar-te que hem completat l\'auditoria tècnica del teu perfil corporatiu. ' +
            'Com a resultat d\'aquesta anàlisi, hem generat un informe personalitzat on es detallen ' +
            'les millors oportunitats de finançament públic disponibles actualment per al teu sector.\n\n' +
            'Pots accedir a l\'informe complet i descarregar la documentació tècnica prement el botó inferior.\n\n' +
            'Restem a la teva disposició per comentar els detalls d\'aquest informe i definir els següents passos ' +
            'en la preparació de les teves candidatures.',
        emailLinkPlaceholder: 'Veure Dossier Estratègic',
        emailSignature: 'Salutacions,\nL\'equip de {{Entidad}}'
    }
};

export const getTemplateTexts = (lang: string) => {
    return TEMPLATE_TEXTS[lang] || TEMPLATE_TEXTS['es'];
};

export const getDefaultTemplate = (email: string = '', lang: string = 'es'): TemplateConfig => {
    const texts = getTemplateTexts(lang);

    return {
        // 1. Portada
        coverLayout: 'modern-sidebar',
        coverTitle: texts.coverTitle!,
        coverSubtitle: texts.coverSubtitle!,
        showSubtitle: true,
        logoBase64: null,
        logoScale: 1,
        primaryColor: '#44EDCC',
        entityName: 'Subvenia',

        // 2. Texto y Colores (Mantenemos tipografías modernas del código 2)
        fontHeading: 'Sora',
        fontBody: 'Inter',
        fontSizeBody: 11,
        fontSizeTitle: 24,
        fontSizeSubtitle: 16,
        fontSizeHeader: 10,
        fontSizeFooter: 8,
        fontSizeCardTitle: 18,
        fontSizeCardBody: 11,
        
        titleColor: '#44EDCC', 
        subtitleColor: '#000000',
        bodyTextColor: '#000000',
        headerTextColor: '#000000',
        footerTextColor: '#000000',
        
        cardBgColor: '#F3F4F6',
        cardTitleColor: '#000000',
        cardTextColor: '#000000',
        accentColor: '#3B82F6',

        headerText: texts.headerText!,
        headerIncludeLogo: true,
        logoPosition: 'left',
        showSeparatorLine: true,
        footerText: texts.footerText!,
        showPageNumbers: true,
        
        watermarkEnabled: false,
        watermarkType: 'text',
        watermarkText: 'BORRADOR',
        watermarkOpacity: 0.05,

        // 3. Introducción
        reportLanguage: lang as any,
        introTitle: texts.introTitle!,
        introText: texts.introText!,
        
        // 4. Cierre
        dnaTitle: texts.dnaTitle!,
        specsTitle: texts.specsTitle!,
        conclusionTitle: texts.conclusionTitle!,
        conclusionIntro: texts.conclusionIntro!,
        conclusionText: texts.conclusionText!,
        
        signatures: [
            { name: 'Equipo Subvenia', email: 'contacto@subvenia.ai', company: 'Subvenia' }
        ],
        sigNameColor: '#44EDCC',
        sigEmailColor: '#000000',
        sigCompanyColor: '#000000',
        
        callHeaderBgColor: '#0B1018',
        callTitleColor: '#FFFFFF',

        // 5. Configuración de Email (Campos actualizados)
        emailSubject: texts.emailSubject!,
        emailBody: texts.emailBody!,
        emailLinkPlaceholder: texts.emailLinkPlaceholder!,
        emailSignature: texts.emailSignature!
    };
};