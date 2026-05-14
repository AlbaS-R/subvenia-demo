
import React, { useState } from 'react';
import type { Project } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { IconButton } from '../common/IconButton';
import { Button } from '../common/Button';
import ConfirmationModal from '../common/ConfirmationModal';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onRenameProject: (projectId: string, newName: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen, onClose, projects, activeProjectId, onSelectProject, onDeleteProject, onRenameProject
}) => {
  const { t } = useLanguage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const handleStartRename = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setEditingId(project.id);
    setTempName(project.name);
  };

  const handleFinishRename = () => {
    if (editingId && tempName.trim()) {
      onRenameProject(editingId, tempName);
    }
    setEditingId(null);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      onDeleteProject(projectToDelete);
    }
    setProjectToDelete(null);
  };

  return (
    <>
      <div 
        className={`fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div className={`fixed top-0 bottom-0 right-0 z-[100] glass-panel shadow-2xl transition-transform duration-300 ease-in-out w-96 border-l border-white/10 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <header className="flex items-center justify-between p-4 border-b border-white/10 h-20 flex-shrink-0">
            <h3 className="text-lg font-bold flex items-center gap-2 font-poppins">
              <span className="material-symbols-outlined">history</span>
              Historial de Actividad
            </h3>
            <IconButton icon="close" onClick={onClose} tooltip="Cerrar" tooltipPosition="bottom" />
          </header>
          <div className="flex-grow p-2 overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
                {projects.map((project) => (
                    <div key={project.id} className="group relative">
                        {editingId === project.id ? (
                             <div className="p-2">
                                <input
                                    autoFocus
                                    className="w-full bg-card ring-2 ring-primary rounded-lg px-3 py-2 text-base outline-none shadow-sm font-roboto"
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    onBlur={handleFinishRename}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFinishRename()}
                                />
                             </div>
                        ) : (
                            <button
                                onClick={() => onSelectProject(project)}
                                className={`w-full text-left p-4 rounded-xl transition-all ${
                                    activeProjectId === project.id 
                                        ? 'bg-primary/15 border border-primary/25 shadow-md' 
                                        : 'border border-transparent hover:bg-white/8 hover:border-white/10 hover:shadow-md'
                                }`}
                            >
                                <p className={`font-bold text-base truncate font-poppins ${activeProjectId === project.id ? 'text-primary' : 'text-foreground'}`}>{project.name}</p>
                                <p className="text-xs text-muted-foreground mt-1 font-roboto">
                                    Modificado: {new Date(project.lastModified).toLocaleDateString()}
                                </p>
                            </button>
                        )}
                        {editingId !== project.id && (
                             <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center bg-black/20 border border-white/10 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <IconButton icon="edit" tooltip="Renombrar" tooltipPosition="bottom" onClick={(e) => handleStartRename(e, project)} />
                                <IconButton icon="delete" tooltip="Eliminar" tooltipPosition="bottom" className="hover:text-destructive" onClick={(e) => { e.stopPropagation(); setProjectToDelete(project); }} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={confirmDelete}
        title={t('sidebar.deleteConfirmTitle')}
        message={t('sidebar.deleteConfirmMsg')}
      />
    </>
  );
};
