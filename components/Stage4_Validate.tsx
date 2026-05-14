
import React from 'react';
import type { ValidatedCallData } from '../types';

interface Stage4ValidateProps {
    selectedValidation?: ValidatedCallData;
}

const Stage4_Validate: React.FC<Stage4ValidateProps> = ({ selectedValidation }) => {
    if (!selectedValidation || !selectedValidation.analysis) return null;

    return (
        <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100 dark:bg-red-900/10 dark:border-red-800">
            <h4 className="text-xs font-black text-red-700 uppercase mb-3 tracking-widest flex items-center gap-2 dark:text-red-400 font-poppins">
                <span className="material-symbols-outlined text-sm">warning</span> PUNTOS FLOJOS DETECTADOS
            </h4>
            <p className="text-base font-semibold text-foreground leading-relaxed font-roboto">
                {selectedValidation.analysis.analysis?.weaknesses || 'No se detectaron debilidades críticas.'}
            </p>
        </div>
    );
};

export default Stage4_Validate;
