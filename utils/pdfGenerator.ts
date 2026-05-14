
import { jsPDF } from 'jspdf';
import type { TemplateConfig, StrategicReport } from '../types';
import { getDefaultTemplate, getMarketingText } from './defaultTemplates';

const PAGE = {
    width: 595.28,
    height: 841.89,
    margin: 46,
    contentWidth: 503.28,
    safeTop: 58,
    safeBottom: 64,
};

const BRAND = {
    ink: '#0B0F10',
    night: '#101415',
    panel: '#0A1B33',
    panel2: '#101722',
    mint: '#44EDCC',
    mintSoft: '#BFE9DF',
    blue: '#3B82F6',
    text: '#111827',
    muted: '#64748B',
    paper: '#F8FAFC',
    line: '#D9E3EA',
};

const cleanText = (text: any): string => {
    if (!text) return '';
    return String(text).replace(/\*/g, '').replace(/[^\x00-\x7F\xC0-\xFF]/g, '').trim();
};

const normalizeBrandColor = (value: string | undefined, fallback: string) => {
    const color = (value || '').toUpperCase();
    return color === '#B84E9D' || color === '#3A0CA3' || !color ? fallback : value!;
};

const PDF_LABELS: Record<string, any> = {
    es: {
        preparedFor: 'PREPARADO PARA',
        page: 'Pagina',
        executiveSnapshot: 'SNAPSHOT EJECUTIVO',
        opportunity: 'OPORTUNIDAD',
        analysisTitle: 'ENCAJE ESTRATEGICO',
        specsTitle: 'DATOS CLAVE',
        auditTitle: 'LECTURA TECNICA',
        nextStepsTitle: 'PROXIMOS PASOS',
        score: 'SCORE',
        opportunities: 'Oportunidades',
        topFit: 'Mejor encaje',
        budget: 'Presupuesto',
        specs: { id: 'ID', status: 'Estado', budget: 'Presupuesto', pubDate: 'Publicacion', deadline: 'Cierre', link: 'Link oficial' },
    },
    en: {
        preparedFor: 'PREPARED FOR',
        page: 'Page',
        executiveSnapshot: 'EXECUTIVE SNAPSHOT',
        opportunity: 'OPPORTUNITY',
        analysisTitle: 'STRATEGIC FIT',
        specsTitle: 'KEY DATA',
        auditTitle: 'TECHNICAL READ',
        nextStepsTitle: 'NEXT STEPS',
        score: 'SCORE',
        opportunities: 'Opportunities',
        topFit: 'Top fit',
        budget: 'Budget',
        specs: { id: 'ID', status: 'Status', budget: 'Budget', pubDate: 'Published', deadline: 'Deadline', link: 'Official link' },
    },
    ca: {
        preparedFor: 'PREPARAT PER A',
        page: 'Pagina',
        executiveSnapshot: 'SNAPSHOT EXECUTIU',
        opportunity: 'OPORTUNITAT',
        analysisTitle: 'ENCAIX ESTRATEGIC',
        specsTitle: 'DADES CLAU',
        auditTitle: 'LECTURA TECNICA',
        nextStepsTitle: 'PROXIMS PASSOS',
        score: 'SCORE',
        opportunities: 'Oportunitats',
        topFit: 'Millor encaix',
        budget: 'Pressupost',
        specs: { id: 'ID', status: 'Estat', budget: 'Pressupost', pubDate: 'Publicacio', deadline: 'Tancament', link: 'Enllac oficial' },
    },
};

type Palette = {
    primary: string;
    accent: string;
};

const drawBackground = (doc: jsPDF, palette: Palette, dark = false) => {
    doc.setFillColor(dark ? BRAND.night : '#FFFFFF');
    doc.rect(0, 0, PAGE.width, PAGE.height, 'F');

    if (dark) {
        doc.setFillColor(BRAND.panel);
        doc.circle(70, 82, 150, 'F');
        doc.setFillColor('#102C45');
        doc.circle(PAGE.width - 60, PAGE.height - 120, 190, 'F');
        doc.setFillColor(palette.primary);
        doc.circle(PAGE.width - 26, 95, 48, 'F');
        doc.setFillColor(palette.accent);
        doc.circle(38, PAGE.height - 45, 34, 'F');
    } else {
        doc.setFillColor('#F7FBFC');
        doc.rect(0, 0, PAGE.width, PAGE.height, 'F');
        doc.setFillColor('#EEF8F6');
        doc.circle(PAGE.width - 52, 52, 95, 'F');
        doc.setFillColor('#EEF5FF');
        doc.circle(20, PAGE.height - 40, 110, 'F');
    }
};

const addFooter = (doc: jsPDF, cfg: TemplateConfig, labels: any, palette: Palette) => {
    const pageNum = doc.getNumberOfPages();
    doc.setDrawColor('#DCE8EA');
    doc.setLineWidth(0.6);
    doc.line(PAGE.margin, PAGE.height - 48, PAGE.width - PAGE.margin, PAGE.height - 48);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(palette.primary);
    doc.text(cleanText(cfg.entityName || 'Subvenia').toUpperCase(), PAGE.margin, PAGE.height - 30);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#91A2AE');
    doc.text(`${cleanText(cfg.footerText || '').replace('{{Entidad}}', cfg.entityName || 'Subvenia')} | ${labels.page} ${pageNum}`, PAGE.width - PAGE.margin, PAGE.height - 30, { align: 'right' });
};

const ensurePageSpace = (doc: jsPDF, y: number, needed: number, cfg: TemplateConfig, labels: any, palette: Palette) => {
    if (y + needed <= PAGE.height - PAGE.safeBottom) return y;
    addFooter(doc, cfg, labels, palette);
    doc.addPage();
    drawBackground(doc, palette, false);
    return PAGE.safeTop;
};

const drawWrappedText = (
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    width: number,
    options: { size?: number; color?: string; bold?: boolean; lineHeight?: number; align?: 'left' | 'justify' } = {},
) => {
    const size = options.size || 10;
    const lineHeight = options.lineHeight || size + 4;
    doc.setFont('helvetica', options.bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(options.color || BRAND.text);
    const lines = doc.splitTextToSize(cleanText(text), width);
    doc.text(lines, x, y, { maxWidth: width, align: options.align || 'left' });
    return y + lines.length * lineHeight;
};

const drawCapsLabel = (doc: jsPDF, text: string, x: number, y: number, palette: Palette, color = palette.primary) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(color);
    doc.text(cleanText(text).toUpperCase(), x, y);
};

const drawMetricCard = (doc: jsPDF, x: number, y: number, w: number, label: string, value: string, palette: Palette) => {
    doc.setFillColor('#FFFFFF');
    doc.setDrawColor('#DCE8EA');
    doc.roundedRect(x, y, w, 72, 14, 14, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(21);
    doc.setTextColor(BRAND.night);
    doc.text(cleanText(value), x + 16, y + 34);
    drawCapsLabel(doc, label, x + 16, y + 55, palette, BRAND.muted);
};

const drawSectionHeader = (doc: jsPDF, title: string, x: number, y: number, palette: Palette) => {
    doc.setFillColor(palette.primary);
    doc.roundedRect(x, y - 11, 22, 22, 7, 7, 'F');
    doc.setFillColor(BRAND.night);
    doc.circle(x + 11, y, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(BRAND.night);
    doc.text(cleanText(title).toUpperCase(), x + 34, y + 4);
};

const parseMarkdownSections = (markdown: string, fallbackTitle: string) => {
    const sections: Array<{ title: string; body: string }> = [];
    let currentTitle = fallbackTitle;
    let currentBody: string[] = [];

    cleanText(markdown).split('\n').forEach(rawLine => {
        const line = rawLine.trim();
        if (!line) return;
        if (line.startsWith('###')) {
            if (currentBody.length) sections.push({ title: currentTitle, body: currentBody.join('\n') });
            currentTitle = cleanText(line.replace(/###/g, ''));
            currentBody = [];
        } else {
            currentBody.push(line);
        }
    });

    if (currentBody.length) sections.push({ title: currentTitle, body: currentBody.join('\n') });
    return sections;
};

const getTopBudget = (convocatorias: StrategicReport[]) => {
    return cleanText(convocatorias.find(c => c.evaluacionEncaje?.presupuesto)?.evaluacionEncaje?.presupuesto) || 'Por definir';
};

export const generatePdfFromJson = (reportData: any, config?: TemplateConfig): jsPDF => {
    const cfg = config || getDefaultTemplate();
    const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
    const palette = {
        primary: normalizeBrandColor(cfg.primaryColor, BRAND.mint),
        accent: normalizeBrandColor(cfg.accentColor, BRAND.blue),
    };
    const lang = cfg.reportLanguage || 'es';
    const labels = PDF_LABELS[lang] || PDF_LABELS.es;
    const empresa = cleanText(reportData.empresa_analizada || 'Cliente');
    const convocatorias = (reportData.convocatorias || [])
        .filter((c: any) => (c.overallScore || 0) > 15)
        .sort((a: any, b: any) => (b.overallScore || 0) - (a.overallScore || 0)) as StrategicReport[];
    const topScore = convocatorias[0]?.overallScore ? `${Math.round(convocatorias[0].overallScore)}%` : 'N/A';

    // Portada
    drawBackground(doc, palette, true);
    doc.setFillColor('#FFFFFF');
    doc.setDrawColor('#FFFFFF');
    doc.roundedRect(PAGE.margin, 54, PAGE.width - PAGE.margin * 2, 660, 30, 30, 'FD');
    doc.setFillColor(BRAND.night);
    doc.roundedRect(PAGE.margin + 10, 64, PAGE.width - PAGE.margin * 2 - 20, 640, 24, 24, 'F');

    doc.setFillColor(palette.primary);
    doc.roundedRect(PAGE.margin + 30, 96, 112, 28, 14, 14, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(BRAND.night);
    doc.text('SUBVENIA REPORT', PAGE.margin + 45, 114);

    if (cfg.logoBase64) {
        try {
            const ratio = cfg.logoAspectRatio || 2.4;
            const w = 160;
            const h = w / ratio;
            doc.addImage(cfg.logoBase64, 'PNG', PAGE.width - PAGE.margin - w - 24, 92, w, h);
        } catch (e) {}
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(43);
    doc.setTextColor('#FFFFFF');
    doc.text(doc.splitTextToSize(cleanText(cfg.coverTitle || 'Estrategia de financiacion'), 410), PAGE.margin + 30, 245);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(13);
    doc.setTextColor(BRAND.mintSoft);
    doc.text(doc.splitTextToSize(cleanText(cfg.coverSubtitle || 'Informe dinamico de oportunidades'), 390), PAGE.margin + 32, 340);

    drawCapsLabel(doc, labels.preparedFor, PAGE.margin + 32, 448, palette);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor('#FFFFFF');
    doc.text(doc.splitTextToSize(empresa, 410), PAGE.margin + 32, 482);

    drawMetricCard(doc, PAGE.margin + 32, 566, 144, labels.opportunities, String(convocatorias.length), palette);
    drawMetricCard(doc, PAGE.margin + 192, 566, 144, labels.topFit, topScore, palette);
    drawMetricCard(doc, PAGE.margin + 352, 566, 144, labels.budget, getTopBudget(convocatorias).substring(0, 16), palette);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor('#7F96A6');
    doc.text(cleanText(cfg.footerText || '').replace('{{Entidad}}', cfg.entityName || 'Subvenia'), PAGE.margin + 32, 740);

    // Introduccion / mapa ejecutivo
    doc.addPage();
    drawBackground(doc, palette, false);
    drawCapsLabel(doc, labels.executiveSnapshot, PAGE.margin, 76, palette);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(30);
    doc.setTextColor(BRAND.night);
    doc.text(doc.splitTextToSize(cleanText(cfg.introTitle || 'Presentacion del informe'), PAGE.contentWidth), PAGE.margin, 118);
    let y = 170;
    y = drawWrappedText(doc, cfg.introText, PAGE.margin, y, PAGE.contentWidth, { size: 11, color: '#334155', lineHeight: 16, align: 'justify' }) + 26;

    const introCards = [
        { title: labels.opportunities, value: String(convocatorias.length), text: 'Mapa priorizado de ayudas detectadas para la entidad analizada.' },
        { title: labels.topFit, value: topScore, text: 'Mayor indice de encaje encontrado entre las convocatorias analizadas.' },
        { title: labels.budget, value: getTopBudget(convocatorias).substring(0, 20), text: 'Importe de referencia extraido de la oportunidad con informacion disponible.' },
    ];
    introCards.forEach((card, idx) => {
        const x = PAGE.margin + idx * 169;
        doc.setFillColor('#FFFFFF');
        doc.setDrawColor('#DCE8EA');
        doc.roundedRect(x, y, 154, 132, 18, 18, 'FD');
        drawCapsLabel(doc, card.title, x + 16, y + 25, palette);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(idx === 2 ? 18 : 26);
        doc.setTextColor(BRAND.night);
        doc.text(doc.splitTextToSize(card.value, 120), x + 16, y + 58);
        drawWrappedText(doc, card.text, x + 16, y + 91, 122, { size: 8.5, color: BRAND.muted, lineHeight: 11 });
    });
    addFooter(doc, cfg, labels, palette);

    // Oportunidades
    convocatorias.forEach((call, index) => {
        doc.addPage();
        drawBackground(doc, palette, false);
        const title = cleanText(call.tituloComercial || call.evaluacionEncaje?.convocatoria_titulo || `${labels.opportunity} ${index + 1}`);
        const score = Math.round(call.overallScore || 0);

        doc.setFillColor(BRAND.night);
        doc.roundedRect(PAGE.margin, 48, PAGE.contentWidth, 148, 24, 24, 'F');
        doc.setFillColor(palette.primary);
        doc.circle(PAGE.width - PAGE.margin - 56, 122, 42, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(19);
        doc.setTextColor(BRAND.night);
        doc.text(`${score}%`, PAGE.width - PAGE.margin - 56, 129, { align: 'center' });
        doc.setFontSize(6.5);
        doc.text(labels.score, PAGE.width - PAGE.margin - 56, 146, { align: 'center' });

        drawCapsLabel(doc, `${labels.opportunity} ${String(index + 1).padStart(2, '0')}`, PAGE.margin + 24, 82, palette);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(19);
        doc.setTextColor('#FFFFFF');
        doc.text(doc.splitTextToSize(title, 365), PAGE.margin + 24, 116);

        y = 228;
        drawSectionHeader(doc, labels.analysisTitle, PAGE.margin, y, palette);
        y += 28;
        const analysisText = cleanText(call.aiCore?.analisisCompatibilidad || 'Analisis pendiente de completar.');
        const analysisLines = doc.splitTextToSize(analysisText, PAGE.contentWidth - 36);
        const analysisLineHeight = 13;
        const analysisCardHeight = Math.max(112, analysisLines.length * analysisLineHeight + 42);
        y = ensurePageSpace(doc, y, analysisCardHeight + 18, cfg, labels, palette);
        doc.setFillColor('#FFFFFF');
        doc.setDrawColor('#DCE8EA');
        doc.roundedRect(PAGE.margin, y, PAGE.contentWidth, analysisCardHeight, 18, 18, 'FD');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor('#334155');
        doc.text(analysisLines, PAGE.margin + 18, y + 24, { maxWidth: PAGE.contentWidth - 36, align: 'justify' });
        y += analysisCardHeight + 28;

        y = ensurePageSpace(doc, y, 210, cfg, labels, palette);
        drawSectionHeader(doc, labels.specsTitle, PAGE.margin, y, palette);
        y += 24;
        const specs = [
            { l: labels.specs.id, v: call.evaluacionEncaje?.source_id },
            { l: labels.specs.status, v: call.evaluacionEncaje?.convocatoria_estado },
            { l: labels.specs.budget, v: call.evaluacionEncaje?.presupuesto },
            { l: labels.specs.deadline, v: call.evaluacionEncaje?.cierre },
            { l: labels.specs.link, v: call.evaluacionEncaje?.convocatoria_url },
        ].filter(s => s.v);

        specs.slice(0, 6).forEach((spec, specIdx) => {
            const col = specIdx % 2;
            const row = Math.floor(specIdx / 2);
            const x = PAGE.margin + col * 257;
            const cardY = y + row * 55;
            doc.setFillColor('#FFFFFF');
            doc.setDrawColor('#DCE8EA');
            doc.roundedRect(x, cardY, 239, 42, 12, 12, 'FD');
            drawCapsLabel(doc, spec.l, x + 12, cardY + 16, palette, BRAND.muted);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(BRAND.night);
            doc.text(doc.splitTextToSize(cleanText(spec.v).substring(0, 58), 210), x + 12, cardY + 31);
        });
        y += Math.ceil(specs.length / 2) * 55 + 24;

        drawSectionHeader(doc, labels.auditTitle, PAGE.margin, y, palette);
        y += 28;
        const sections = parseMarkdownSections(call.markdownReport || '', labels.auditTitle);
        sections.forEach(section => {
            y = ensurePageSpace(doc, y, 84, cfg, labels, palette);
            doc.setFillColor('#FFFFFF');
            doc.setDrawColor('#DCE8EA');
            doc.roundedRect(PAGE.margin, y, PAGE.contentWidth, 28, 12, 12, 'FD');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9.5);
            doc.setTextColor(palette.accent);
            doc.text(cleanText(section.title).toUpperCase(), PAGE.margin + 14, y + 18);
            y += 42;

            const lines = doc.splitTextToSize(cleanText(section.body), PAGE.contentWidth - 28);
            lines.forEach((line: string) => {
                y = ensurePageSpace(doc, y, 16, cfg, labels, palette);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9.3);
                doc.setTextColor('#334155');
                doc.text(line, PAGE.margin + 14, y);
                y += 13;
            });
            y += 12;
        });

        if (call.proximosPasos?.length) {
            y = ensurePageSpace(doc, y, 90, cfg, labels, palette);
            drawSectionHeader(doc, labels.nextStepsTitle, PAGE.margin, y, palette);
            y += 28;
            call.proximosPasos.slice(0, 5).forEach((step, idx) => {
                y = ensurePageSpace(doc, y, 42, cfg, labels, palette);
                doc.setFillColor('#EFFFFB');
                doc.setDrawColor('#C7F7ED');
                doc.roundedRect(PAGE.margin, y, PAGE.contentWidth, 34, 12, 12, 'FD');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                doc.setTextColor(BRAND.night);
                doc.text(`${idx + 1}.`, PAGE.margin + 14, y + 21);
                drawWrappedText(doc, step, PAGE.margin + 34, y + 21, PAGE.contentWidth - 48, { size: 8.8, color: '#334155', lineHeight: 11 });
                y += 44;
            });
        }

        addFooter(doc, cfg, labels, palette);
    });

    // Cierre
    doc.addPage();
    drawBackground(doc, palette, true);
    doc.setFillColor('#FFFFFF');
    doc.roundedRect(PAGE.margin, 74, PAGE.contentWidth, 540, 30, 30, 'F');
    drawCapsLabel(doc, 'ROADMAP', PAGE.margin + 30, 126, palette);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(31);
    doc.setTextColor(BRAND.night);
    doc.text(doc.splitTextToSize(cleanText(cfg.conclusionTitle || 'Conclusiones y hoja de ruta'), 420), PAGE.margin + 30, 168);
    drawWrappedText(doc, cfg.conclusionIntro || 'Priorizad las oportunidades con mayor encaje y preparad la activacion comercial con datos medibles.', PAGE.margin + 30, 250, 410, { size: 11, color: '#334155', lineHeight: 16, align: 'justify' });

    const boxTop = 358;
    doc.setFillColor(BRAND.night);
    doc.roundedRect(PAGE.margin + 30, boxTop, 205, 150, 22, 22, 'F');
    drawCapsLabel(doc, 'ACTIVACION', PAGE.margin + 52, boxTop + 34, palette);
    drawWrappedText(doc, cleanText(cfg.conclusionText) || 'Seleccionar oportunidades prioritarias, validar elegibilidad y lanzar el siguiente paquete de acciones.', PAGE.margin + 52, boxTop + 68, 160, { size: 9.5, color: '#FFFFFF', lineHeight: 13 });

    doc.setDrawColor(palette.primary);
    doc.setLineWidth(1.2);
    doc.roundedRect(PAGE.margin + 265, boxTop, 178, 150, 22, 22, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(palette.primary);
    doc.text('Subvenia', PAGE.margin + 288, boxTop + 40);
    drawWrappedText(doc, getMarketingText(lang).replace('Subvenia', ''), PAGE.margin + 288, boxTop + 68, 132, { size: 9, color: BRAND.mintSoft, lineHeight: 13 });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor('#7F96A6');
    doc.text(`${cleanText(cfg.entityName || 'Subvenia')} | ${labels.page} ${doc.getNumberOfPages()}`, PAGE.width - PAGE.margin, PAGE.height - 30, { align: 'right' });

    return doc;
};
