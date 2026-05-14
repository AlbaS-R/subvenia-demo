
import React, { useState } from 'react';
import type { GrantData, WorkPackage, Feedback } from '../types';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { TextArea } from './common/TextArea';
import { GoogleGenAI } from "@google/genai";
import { useToast } from '../contexts/ToastContext';
import { Card } from './common/Card';

interface NewFeedback {
    author: string;
    email: string;
    workPackageTitle: string;
    comment: string;
}

const FeedbackForm: React.FC<{
    workPackages: WorkPackage[];
    onSubmit: (feedback: NewFeedback) => void;
}> = ({ workPackages, onSubmit }) => {
    const [formData, setFormData] = useState<NewFeedback>({ author: '', email: '', workPackageTitle: workPackages[0]?.title || '', comment: '' });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.author || !formData.comment) return;
        onSubmit(formData);
        setFormData({ author: '', email: '', workPackageTitle: workPackages[0]?.title || '', comment: '' });
    };
    return (
        <form onSubmit={handleSubmit} className="glass-panel p-4 mt-6 rounded-2xl shadow-xl border border-white/10">
            <h4 className="font-semibold text-neutral-100 mb-3 font-poppins">Añadir Comentario</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nombre" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} required />
                <TextArea label="Comentario" value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} rows={3} required />
            </div>
            <div className="mt-4 flex justify-end"><Button type="submit">Enviar</Button></div>
        </form>
    )
}

interface Stage5IteratePartnersProps {
  onComplete: () => void;
  data: GrantData['stage5'];
  updateData: (data: Partial<GrantData['stage5']>) => void;
  workPackages: WorkPackage[];
  updateWorkPackages: (workPackages: WorkPackage[]) => void;
}

const Stage5IteratePartners: React.FC<Stage5IteratePartnersProps> = ({ onComplete, data, workPackages, updateData, updateWorkPackages }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const { showToast } = useToast();

    const handleAiWpEdit = async (wp: WorkPackage, action: 'expand' | 'shorten') => {
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = action === 'expand' ? `Expande: "${wp.description}"` : `Resume: "${wp.description}"`;
            // Updated model to gemini-3-flash-preview
            const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: prompt });
            const newDesc = response.text || '';
            updateWorkPackages(workPackages.map(w => w.id === wp.id ? { ...w, description: newDesc } : w));
            showToast("Actualizado con IA.", "success");
        } catch (e) { showToast("Error en IA.", "error"); }
        finally { setIsGenerating(false); }
    };

    return (
        <div className="space-y-8">
            {workPackages.map(wp => (
                <Card key={wp.id} className="p-6">
                    <h3 className="font-bold mb-4 font-poppins">{wp.title}</h3>
                    <TextArea value={wp.description} rows={5} onChange={e => updateWorkPackages(workPackages.map(w => w.id === wp.id ? { ...w, description: e.target.value } : w))} />
                    <div className="flex gap-2 mt-4">
                        <Button variant="secondary" size="sm" onClick={() => handleAiWpEdit(wp, 'expand')} isLoading={isGenerating}>Expandir IA</Button>
                        <Button variant="secondary" size="sm" onClick={() => handleAiWpEdit(wp, 'shorten')} isLoading={isGenerating}>Resumir IA</Button>
                    </div>
                </Card>
            ))}
            <div className="flex justify-end pt-6 border-t border-white/10"><Button onClick={onComplete}>Finalizar Revisión</Button></div>
        </div>
    );
};

export default Stage5IteratePartners;
