
import React, { useState, useEffect } from 'react';
import ProgressBar from './ProgressBar';
import { Button } from './common/Button';
import { useLanguage } from '../contexts/LanguageContext';
import type { Project } from '../types';

interface HeaderProps {
    currentStage: number;
    onBack: () => void;
    activeProject?: Project;
    onRenameProject: (id: string, newName: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentStage, onBack, activeProject, onRenameProject }) => {
    const { t } = useLanguage();
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState('');

    useEffect(() => {
        if (activeProject) {
            setTempName(activeProject.name);
        }
    }, [activeProject]);

    const handleSaveRename = () => {
        if (activeProject && tempName.trim() && tempName !== activeProject.name) {
            onRenameProject(activeProject.id, tempName);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSaveRename();
        if (e.key === 'Escape') {
            setTempName(activeProject?.name || '');
            setIsEditing(false);
        }
    };

    // Mapeo de IDs de etapa a número visual del paso (1-4)
    const getStepNumber = (id: number) => {
        switch(id) {
            case 1: return 1;
            case 2: return 2;
            case 3: return 3;
            case 8: return 4;
            default: return 1;
        }
    };

    const stepNumber = getStepNumber(currentStage);

    return (
        <header className="w-full flex-shrink-0 bg-card/65 backdrop-blur-xl py-4 border border-white/10 mb-3 rounded-3xl px-6 relative z-10 shadow-[0_14px_32px_rgba(0,0,0,0.28)]">
            <div className="flex flex-col gap-4 max-w-[85%]">
                <div className="flex justify-between items-center gap-4">
                    {/* Navegación y Título */}
                    <div className="flex items-center gap-4 flex-1">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={onBack}
                            disabled={currentStage <= 1}
                            className="h-10 w-10 p-0 rounded-full flex-shrink-0"
                        >
                            <span className="material-symbols-outlined !text-xl">arrow_back</span>
                        </Button>

                        <div className="flex items-center gap-3 group max-w-[60%]">
                            <span className="material-symbols-outlined text-secondary flex-shrink-0 opacity-90">folder_open</span>
                            {isEditing ? (
                                <input
                                    autoFocus
                                    className="bg-black/20 border border-primary/60 rounded-xl px-4 py-2 text-lg font-black uppercase tracking-tight outline-none w-full min-w-[200px] font-poppins"
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    onBlur={handleSaveRename}
                                    onKeyDown={handleKeyDown}
                                />
                            ) : (
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <h2 className="text-xl font-black uppercase tracking-tight text-foreground truncate max-w-full font-poppins" title={activeProject?.name}>
                                        {activeProject?.name || 'Nuevo Proyecto'}
                                    </h2>
                                    <Button 
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsEditing(true)}
                                        className="opacity-0 group-hover:opacity-100 text-secondary transition-all flex-shrink-0"
                                        title="Renombrar proyecto"
                                    >
                                        <span className="material-symbols-outlined !text-base">edit</span>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Barra de Progreso - Ajustada para 4 pasos */}
                <div className="flex items-center gap-6 px-2 w-full lg:w-[90%]">
                    <div className="flex-grow">
                        <div className="w-full max-w-xs">
                            <div className="w-full bg-white/10 rounded-full h-1.5">
                                <div 
                                    className="bg-gradient-to-r from-secondary to-primary h-1.5 rounded-full transition-all duration-500 ease-out" 
                                    style={{ width: `${(stepNumber / 4) * 100}%` }}>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-xs font-black uppercase text-neutral-300 whitespace-nowrap bg-white/5 px-3 py-1 rounded-full border border-white/15 font-poppins">
                        {t('general.step')} {stepNumber} / 4
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
