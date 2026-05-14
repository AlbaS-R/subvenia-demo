
import React from 'react';
import { Button } from './Button';
import { useLanguage } from '../../contexts/LanguageContext';

interface Version {
    id: string;
    name: string;
}

interface VersionControlProps {
    versions: Version[];
    activeVersionId: string | null;
    onSelectVersion: (id: string) => void;
    onGenerateNewVersion: () => void;
    isGenerating: boolean;
    generateButtonText?: string;
    size?: 'sm' | 'md';
}

export const VersionControl: React.FC<VersionControlProps> = ({
    versions,
    activeVersionId,
    onSelectVersion,
    onGenerateNewVersion,
    isGenerating,
    generateButtonText,
    size = 'md',
}) => {
    const { t } = useLanguage();
    
    return (
        <div className={`glass-panel flex items-center gap-3 p-2 rounded-2xl shadow-xl border border-white/10 ${size === 'sm' ? 'text-base' : ''}`}>
            {versions.length > 0 && (
                 <div className="flex items-center gap-2">
                    <label htmlFor="version-select" className="font-medium text-neutral-200 whitespace-nowrap font-poppins">{t('general.version')}:</label>
                    <select
                        id="version-select"
                        value={activeVersionId || ''}
                        onChange={(e) => onSelectVersion(e.target.value)}
                        className={`block w-full pl-3 pr-8 py-2 border border-white/10 bg-card/70 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 rounded-xl backdrop-blur-md ${size === 'sm' ? 'text-base' : ''}`}
                    >
                        {versions.map((v) => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                    </select>
                </div>
            )}
           
            <Button 
                onClick={onGenerateNewVersion} 
                isLoading={isGenerating} 
                variant="secondary" 
                size={size === 'sm' ? 'sm' : 'md'}
                className="flex-grow whitespace-nowrap"
            >
                <span className="material-symbols-outlined text-base leading-none mr-2">auto_awesome</span>
                {isGenerating ? t('general.generating') : (generateButtonText || t('general.generate'))}
            </Button>
        </div>
    );
};
