
import React, { useState, useEffect } from 'react';
import type { GrantData, PublicationVersion } from '../types';
import { Button } from './common/Button';
import { TextArea } from './common/TextArea';
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { useToast } from '../contexts/ToastContext';
import { VersionControl } from './common/VersionControl';
import { useLanguage } from '../contexts/LanguageContext';
import { Input } from './common/Input';
import { Card } from './common/Card';

interface Stage4PublishConceptProps {
  onComplete: () => void;
  data: GrantData['stage4'];
  updateData: (data: Partial<GrantData['stage4']>) => void;
  projectContext: string;
}

const schemas: Record<string, any> = {
    title: { type: Type.OBJECT, properties: { title: { type: Type.STRING } }, required: ['title']},
    summary: { type: Type.OBJECT, properties: { summary: { type: Type.STRING } }, required: ['summary']},
    keyObjectives: { type: Type.OBJECT, properties: { keyObjectives: { type: Type.STRING } }, required: ['keyObjectives']},
    cta: { type: Type.OBJECT, properties: { cta: { type: Type.STRING } }, required: ['cta']},
    videoScript: { type: Type.OBJECT, properties: { videoScript: { type: Type.STRING } }, required: ['videoScript']},
};

const Stage4PublishConcept: React.FC<Stage4PublishConceptProps> = ({ onComplete, data, updateData, projectContext }) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [customImagePrompt, setCustomImagePrompt] = useState('');
  const { showToast } = useToast();
  const { t } = useLanguage();

  const activeVersion = data.versions.find(v => v.id === data.activeVersionId);
  
  useEffect(() => {
    if (activeVersion && !activeVersion.imageUrl && !isGeneratingImage) handleGenerateImage(true);
  }, [activeVersion?.id]);

  const handleFullGenerate = async () => {
    setIsGenerating('full');
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const schema = {
            type: Type.OBJECT,
            properties: { title: { type: Type.STRING }, summary: { type: Type.STRING }, keyObjectives: { type: Type.STRING }, cta: { type: Type.STRING }, videoScript: { type: Type.STRING } },
            required: ['title', 'summary', 'keyObjectives', 'cta', 'videoScript']
        };
        const response = await ai.models.generateContent({
            // Updated model to gemini-3-flash-preview
            model: "gemini-3-flash-preview",
            contents: `Genera contenido para publicación: "${projectContext}"`,
            config: { responseMimeType: "application/json", responseSchema: schema as any },
        });
        const generated = JSON.parse(response.text || '{}');
        const newId = `v_${Date.now()}`;
        updateData({ versions: [...data.versions, { id: newId, ...generated }], activeVersionId: newId });
    } catch (e) { showToast("Error generando contenido.", "error"); }
    finally { setIsGenerating(null); }
  };

  const handleGenerateImage = async (silent = false) => {
    if (!activeVersion) return;
    setIsGeneratingImage(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = customImagePrompt || `Professional visual for ${activeVersion.title}. No text.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: { imageConfig: { aspectRatio: "16:9" } }
        });
        
        const candidate = response.candidates?.[0];
        if (candidate) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                    const newVersions = data.versions.map(v => v.id === activeVersion.id ? {...v, imageUrl} : v);
                    updateData({ versions: newVersions });
                    if (!silent) showToast("Imagen generada.", "success");
                    break;
                }
            }
        }
    } catch (e) { if (!silent) showToast("Error generando imagen.", "error"); }
    finally { setIsGeneratingImage(false); }
  };

  return (
    <div className="space-y-8">
        {activeVersion && (
            <Card className="p-8">
                {activeVersion.imageUrl ? <img src={activeVersion.imageUrl} className="w-full rounded-lg mb-6" /> : <div className="h-48 bg-neutral-100 flex items-center justify-center rounded-lg mb-6"><span className="material-symbols-outlined text-4xl leading-none text-neutral-400">image</span></div>}
                <Input label="Ajustar Prompt Imagen" value={customImagePrompt} onChange={e => setCustomImagePrompt(e.target.value)} />
                <Button onClick={() => handleGenerateImage()} isLoading={isGeneratingImage} className="mt-4">Regenerar Imagen</Button>
            </Card>
        )}
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold font-poppins">Edición</h2>
            <Button onClick={handleFullGenerate} isLoading={isGenerating === 'full'}>Nueva Versión IA</Button>
        </div>
        <div className="flex justify-end pt-8 border-t"><Button onClick={onComplete}>Continuar</Button></div>
    </div>
  );
};

export default Stage4PublishConcept;
