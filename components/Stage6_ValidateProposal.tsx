
import React from 'react';
import type { GrantData, Signature } from '../types';
import { Button } from './common/Button';
import { useLanguage } from '../contexts/LanguageContext';

interface Stage6ValidateProposalProps {
  onComplete: () => void;
  data: GrantData['stage6'];
  updateData: (data: Partial<GrantData['stage6']>) => void;
  partners: { id: string; name: string; company: string; email: string; position: string }[];
}

const SignatureRow: React.FC<{
  signature: Signature;
  onSign: () => void;
}> = ({ signature, onSign }) => {
  return (
    <div className="grid grid-cols-5 gap-4 items-center p-4 border-b border-white/10">
      <div className="col-span-2">
        <p className="font-semibold text-neutral-100 font-poppins text-base">{signature.name}</p>
        <p className="text-sm text-neutral-300 font-roboto">{signature.company}</p>
      </div>
      <div>
        <p className="text-sm text-neutral-200 font-roboto">{signature.position}</p>
      </div>
      <div>
        {signature.signed ? (
          <div className="flex items-center gap-2 text-primary-500">
            <span className="material-symbols-outlined text-xl leading-none">check_box</span>
            <span className="text-sm font-semibold font-poppins">Firmado</span>
          </div>
        ) : (
          <p className="text-sm text-primary-600 font-semibold font-poppins">Pendiente</p>
        )}
      </div>
      <div>
        {signature.signed ? (
          <p className="text-sm text-neutral-300 font-roboto">{new Date(signature.date).toLocaleDateString()}</p>
        ) : (
          <Button size="sm" onClick={onSign}>
            Firmar (Sim.)
          </Button>
        )}
      </div>
    </div>
  );
};

const Stage6ValidateProposal: React.FC<Stage6ValidateProposalProps> = ({ onComplete, data, updateData, partners }) => {
  const { t } = useLanguage();
  
  // Initialize signatures from partners if they don't exist
  React.useEffect(() => {
    const newSignatures: Record<string, Signature> = { ...data.partnerConformity };
    let hasChanged = false;
    partners.forEach(p => {
      if (!newSignatures[p.id]) {
        hasChanged = true;
        newSignatures[p.id] = {
          name: p.name,
          position: p.position,
          email: p.email,
          company: p.company,
          signed: false,
          date: '',
        };
      }
    });
    if (hasChanged) {
      updateData({ partnerConformity: newSignatures });
    }
  }, [partners, data.partnerConformity, updateData]);

  const handleSign = (partnerId: string) => {
    const updatedSignatures = { ...data.partnerConformity };
    if (updatedSignatures[partnerId]) {
      updatedSignatures[partnerId] = {
        ...updatedSignatures[partnerId],
        signed: true,
        date: new Date().toISOString(),
      };
      updateData({ partnerConformity: updatedSignatures });
    }
  };

  // FIX: Explicitly type `s` as `Signature` to resolve a type inference issue where it was being inferred as `unknown`.
  const allSigned = Object.values(data.partnerConformity).every((s: Signature) => s.signed);

  const signatures = Object.entries(data.partnerConformity);

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-neutral-100 font-poppins">Validación de la Propuesta</h2>
        <p className="text-neutral-300 mt-2 max-w-2xl mx-auto font-roboto text-base">
          Es el último paso. Revisa que todos los socios hayan dado su conformidad. La firma es una simulación para registrar la validación.
        </p>
      </div>
      
      <div className="glass-panel rounded-2xl shadow-xl border border-white/10 overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-4 border-b border-white/10 font-semibold text-sm text-neutral-300 font-poppins">
          <div className="col-span-2">Socio</div>
          <div>Cargo</div>
          <div>Estado</div>
          <div>Acción</div>
        </div>
        {signatures.length > 0 ? (
            signatures.map(([id, signature]) => (
                <SignatureRow key={id} signature={signature as Signature} onSign={() => handleSign(id)} />
            ))
        ) : (
            <p className="p-8 text-center text-neutral-400 font-roboto text-base">No hay socios definidos en la etapa 3.</p>
        )}
      </div>

      {allSigned && signatures.length > 0 && (
          <div className="mt-8 p-6 glass-panel border-l-4 border-primary-500 rounded-r-2xl text-center animate-toast-in">
              <span className="material-symbols-outlined text-6xl leading-none mx-auto text-primary-500">celebration</span>
              <h3 className="text-xl font-bold text-primary mt-3 font-poppins">¡Propuesta Completada y Validada!</h3>
              <p className="text-neutral-300 mt-1 font-roboto text-base">Todos los socios han dado su conformidad. Ya puedes generar la versión final y presentarla.</p>
          </div>
      )}

      <div className="mt-10 border-t border-white/10 pt-6 flex justify-end">
        <Button onClick={onComplete} disabled={!allSigned || signatures.length === 0}>
          Finalizar Proyecto
        </Button>
      </div>
    </div>
  );
};

export default Stage6ValidateProposal;
