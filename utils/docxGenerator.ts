
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Footer,
  Table,
  TableRow,
  TableCell,
  WidthType
} from 'docx';
import type { StrategicReport, TemplateConfig } from '../types';
import { getDefaultTemplate } from './defaultTemplates';

export const generateDocxFromJson = async (reportData: any, config?: TemplateConfig): Promise<Blob> => {
    const finalConfig = config || getDefaultTemplate();
    const companyName = reportData.empresa_analizada || 'Entidad';
    const primaryColor = finalConfig.primaryColor.replace('#', '');
    
    const children: any[] = [];

    // Portada
    children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: finalConfig.coverTitle, bold: true, size: 48, color: primaryColor })],
        spacing: { before: 2000, after: 400 }
    }));
    children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: `PREPARADO PARA: ${companyName}`, size: 24, bold: true })],
        spacing: { after: 4000 }
    }));

    // Intro
    if (finalConfig.introText) {
        children.push(new Paragraph({ pageBreakBefore: true }));
        children.push(new Paragraph({
            children: [new TextRun({ text: finalConfig.introTitle || "INTRODUCCIÓN", bold: true, size: 32, color: primaryColor })],
            spacing: { after: 400 }
        }));
        children.push(new Paragraph({
            children: [new TextRun({ text: finalConfig.introText, size: 22 })],
            spacing: { after: 800 }
        }));
    }

    // Convocatorias
    if (reportData.convocatorias && reportData.convocatorias.length > 0) {
        reportData.convocatorias.forEach((call: StrategicReport, idx: number) => {
            children.push(new Paragraph({ pageBreakBefore: true }));
            children.push(new Paragraph({
                children: [new TextRun({ text: `OPORTUNIDAD #${idx + 1}: ${call.evaluacionEncaje.convocatoria_titulo}`, bold: true, size: 28, color: primaryColor })],
                spacing: { after: 400 }
            }));

            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "OBJETIVO", bold: true, size: 18 })] })], shading: { fill: "F3F4F6" } }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: call.resumenTecnico.objetivo, size: 18 })] })] }),
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "PRESUPUESTO", bold: true, size: 18 })] })], shading: { fill: "F3F4F6" } }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: call.resumenTecnico.cuantia, size: 18 })] })] }),
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "ESTADO", bold: true, size: 18 })] })], shading: { fill: "F3F4F6" } }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: call.evaluacionEncaje.convocatoria_estado, size: 18 })] })] }),
                        ]
                    })
                ]
            }));

            children.push(new Paragraph({
                children: [new TextRun({ text: "ANÁLISIS DE ENCAJE ESTRATÉGICO", bold: true, size: 22, color: primaryColor })],
                spacing: { before: 400, after: 200 }
            }));
            children.push(new Paragraph({
                children: [new TextRun({ text: call.analisisEncaje.evaluacionCompatibilidad, size: 20, italic: true })],
                spacing: { after: 400 }
            }));
        });
    }

    const doc = new Document({
        sections: [{
            children: children,
            footers: {
                default: new Footer({
                    children: [new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: finalConfig.footerText.replace('{{Entidad}}', finalConfig.entityName), size: 16 })]
                    })]
                })
            }
        }]
    });

    return await Packer.toBlob(doc);
};
