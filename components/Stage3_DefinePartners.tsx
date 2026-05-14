
import React, { useState, useEffect } from 'react';
import type { GrantData, Partner, PartnerProfile, WorkPackage } from '../types';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { Tag } from './common/Tag';
import { GoogleGenAI, Type } from "@google/genai";
import { useToast } from '../contexts/ToastContext';
import { VersionControl } from './common/VersionControl';
import { TextArea } from './common/TextArea';
import { useLanguage } from '../contexts/LanguageContext';

interface Stage3DefinePartnersProps {
  onComplete: () => void;
  data: GrantData['stage3'];
  updateData: (data: Partial<GrantData['stage3']>) => void;
  projectContext: string;
  potentialPartnersFromStage2: string;
  workPackages: WorkPackage[];
}

const PartnerCard: React.FC<{ 
  partner: Partner; 
  onUpdatePartner: (updatedPartner: Partner) => void;
  onProfile: (partner: Partner) => Promise<PartnerProfile | null>;
  isGenerating: boolean;
  workPackages: WorkPackage[];
}> = ({ partner, onUpdatePartner, onProfile, isGenerating, workPackages }) => {
    
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState<PartnerProfile | null>(null);
    const activeProfile = partner.profiles.find(p => p.id === partner.activeProfileId);
    
    useEffect(() => {
        if(isEditing && activeProfile) setEditedProfile(JSON.parse(JSON.stringify(activeProfile)));
        else setEditedProfile(null);
    }, [isEditing, activeProfile]);

    const handleFieldChange = (field: keyof PartnerProfile, value: any) => {
        if (editedProfile) setEditedProfile({ ...editedProfile, [field]: value });
    };
    
    const handleSave = () => {
        if (editedProfile) {
            const updatedProfiles = partner.profiles.map(p => p.id === editedProfile.id ? editedProfile : p);
            onUpdatePartner({ ...partner, profiles: updatedProfiles });
        }
        setIsEditing(false);
    };

    const handleGenerateNewProfile = async () => {
        const newProfile = await onProfile(partner);
        if (newProfile) {
            onUpdatePartner({ ...partner, profiles: [...partner.profiles, newProfile], activeProfileId: newProfile.id });
        }
    };
    
    const currentProfile = isEditing ? editedProfile : activeProfile;

    return (
        <div className="glass-panel rounded-2xl shadow-xl p-6 border border-white/10 transition-all hover:-translate-y-1 hover:shadow-2xl">
            <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-lg text-neutral-100 pr-4 font-poppins">{partner.name}</h4>
                <VersionControl versions={partner.profiles.map((p, i) => ({ id: p.id, name: `Perfil ${i + 1}` }))} activeVersionId={partner.activeProfileId} onSelectVersion={(id) => onUpdatePartner({...partner, activeProfileId: id})} onGenerateNewVersion={handleGenerateNewProfile} isGenerating={isGenerating} size="sm" />
            </div>
            {currentProfile && (
              <div className="mt-4">
                <TextArea label="Experiencia" value={currentProfile.experience} onChange={e => handleFieldChange('experience', e.target.value)} rows={4} disabled={!isEditing} />
                <div className="flex gap-2 mt-4">{currentProfile.tags.map((t, i) => <Tag key={i}>{t}</Tag>)}</div>
                <div className="mt-4 flex justify-end">
                    {isEditing ? <Button size="sm" onClick={handleSave}>Guardar</Button> : <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>Editar</Button>}
                </div>
              </div>
            )}
        </div>
    );
};

const Stage3DefinePartners: React.FC<Stage3DefinePartnersProps> = ({ onComplete, data, updateData, projectContext, potentialPartnersFromStage2, workPackages }) => {
  const [newPartnerName, setNewPartnerName] = useState('');
  const [loadingPartnerId, setLoadingPartnerId] = useState<string | null>(null);
  const { showToast } = useToast();
  const { t } = useLanguage();

  const handleProfileWithAI = async (partnerToProfile: Partner): Promise<PartnerProfile | null> => {
    setLoadingPartnerId(partnerToProfile.id);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const schema = {
          type: Type.OBJECT,
          properties: {
            affinityScore: { type: Type.INTEGER },
            country: { type: Type.STRING },
            entityType: { type: Type.STRING },
            sector: { type: Type.STRING },
            experience: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            role: { type: Type.STRING },
            website: { type: Type.STRING },
            contactPerson: { type: Type.STRING },
            email: { type: Type.STRING },
          },
          required: ['affinityScore', 'country', 'entityType', 'sector', 'experience', 'tags', 'role', 'website', 'contactPerson', 'email']
        };
        const response = await ai.models.generateContent({
            // Updated model to gemini-3-flash-preview
            model: "gemini-3-flash-preview",
            contents: `Genera un perfil para: "${partnerToProfile.name}" en el contexto: "${projectContext}".`,
            config: { responseMimeType: "application/json", responseSchema: schema as any },
        });
        const profiledData = JSON.parse(response.text || '{}');
        const newProfile: PartnerProfile = {
            id: `prof_${Date.now()}`,
            affinityScore: profiledData.affinityScore,
            country: profiledData.country,
            entityType: profiledData.entityType,
            sector: profiledData.sector,
            experience: profiledData.experience,
            tags: profiledData.tags,
            role: profiledData.role,
            website: profiledData.website,
            contact_person: profiledData.contactPerson,
            email: profiledData.email,
            assignmentStatus: 'Pending',
        };
        showToast("Perfil generado.", "success");
        return newProfile;
    } catch (error) {
        showToast("Error generando perfil.", "error");
        return null;
    } finally {
        setLoadingPartnerId(null);
    }
  };

  return (
    <div className="space-y-8">
        <div className="flex gap-4">
            <Input value={newPartnerName} onChange={e => setNewPartnerName(e.target.value)} placeholder="Nombre del socio..." className="flex-grow" />
            <Button onClick={() => { if(newPartnerName.trim()) { updateData({ partners: [...data.partners, { id: `p_${Date.now()}`, name: newPartnerName, profiles: [], activeProfileId: null }] }); setNewPartnerName(''); } }}>Añadir</Button>
        </div>
        <div className="space-y-6">
            {data.partners.map(p => <PartnerCard key={p.id} partner={p} onUpdatePartner={(upd) => updateData({ partners: data.partners.map(x => x.id === upd.id ? upd : x) })} onProfile={handleProfileWithAI} isGenerating={loadingPartnerId === p.id} workPackages={workPackages} />)}
        </div>
        <div className="flex justify-end pt-6 border-t border-white/10"><Button onClick={onComplete}>Continuar</Button></div>
    </div>
  );
};

export default Stage3DefinePartners;
