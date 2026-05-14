
import React, { useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Tooltip } from './common/Tooltip';
import UserMenu from './UserMenu';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';
import { IconButton } from './common/IconButton';

interface SidebarProps {
  currentStage: number;
  maxReachedStage: number;
  onStageSelect: (stageNumber: number) => void;
  onGoHome: () => void;
  isStarted: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  onOpenHistory: () => void;
  onOpenApps: () => void;
}

const stageConfig = [
    { id: 1, labelKey: 'sidebar.stage1', icon: 'palette' },
    { id: 2, labelKey: 'sidebar.stage2', icon: 'groups' },
    { id: 3, labelKey: 'sidebar.stage3', icon: 'analytics' },
    { id: 8, labelKey: 'sidebar.stage8', icon: 'folder_managed' },
];

const NavLink: React.FC<{
  stageId: number,
  currentStage: number,
  isStarted: boolean,
  onStageSelect: (stage: number) => void,
  icon: string,
  label: string,
  isCollapsed: boolean
}> = ({ stageId, currentStage, isStarted, onStageSelect, icon, label, isCollapsed }) => {
  const isActive = isStarted && currentStage === stageId;
  const isDisabled = !isStarted;

  const linkContent = (
    <button
      onClick={() => onStageSelect(stageId)}
      disabled={isDisabled}
      className={`w-full p-3.5 flex items-center gap-3 rounded-xl font-semibold transition-all duration-200 font-poppins border border-transparent ${
        isActive
          ? 'bg-white/12 text-white border-white/15 shadow-[0_10px_24px_rgba(0,0,0,0.28)]'
          : isDisabled
          ? 'text-neutral-500 cursor-not-allowed'
          : 'text-neutral-300 hover:bg-white/8 hover:text-white hover:border-white/10'
      } ${isCollapsed ? 'justify-center' : ''}`}
    >
      <span className="material-symbols-outlined">{icon}</span>
      {!isCollapsed && <span className="truncate">{label}</span>}
    </button>
  );

  return (
    <li className="w-full">
      {isCollapsed ? (
        <Tooltip content={label} position="right">
          {linkContent}
        </Tooltip>
      ) : (
        linkContent
      )}
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
    currentStage, maxReachedStage, onStageSelect, onGoHome, isStarted,
    isCollapsed, setIsCollapsed, onOpenHistory, onOpenApps
}) => {
  const { t } = useLanguage();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const userMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const langMenuTriggerRef = useRef<HTMLButtonElement>(null);

  const centeredWhenCollapsed = isCollapsed ? 'justify-center' : '';

  return (
    <>
      <aside className={`relative z-[70] hidden lg:flex flex-col h-full bg-card/65 backdrop-blur-xl border-r border-white/10 shadow-[0_18px_50px_rgba(0,0,0,0.4)] transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
        {/* Header */}
        <div className={`flex items-center gap-2 p-4 h-20 border-b border-white/10 ${centeredWhenCollapsed}`}>
          <IconButton icon="menu" onClick={onOpenApps} tooltip={isCollapsed ? "Aplicaciones" : undefined} />
          {!isCollapsed && (
            <button onClick={onGoHome} className="flex items-center gap-2 group">
                <span className="material-symbols-outlined text-primary text-3xl">find_in_page</span>
                <h1 className="text-2xl font-bold text-neutral-100 font-poppins tracking-tight">
                    Subvenia
                </h1>
            </button>
          )}
        </div>
        
        {/* Toolbar - Alineación horizontal cuando no está colapsado */}
        <div className={`p-2 border-b border-white/10 flex ${isCollapsed ? 'flex-col' : 'flex-row'} items-center justify-center gap-1 ${isCollapsed ? 'py-4' : ''}`}>
            <ThemeSwitcher isCollapsed={isCollapsed} />
            <div className="relative">
                <IconButton ref={langMenuTriggerRef} icon="language" onClick={() => setIsLangMenuOpen(o => !o)} tooltip={isCollapsed ? "Idioma" : undefined} />
                {isLangMenuOpen && (
                    <div className="absolute left-full top-0 ml-2 z-50">
                        <LanguageSwitcher isOpen={isLangMenuOpen} onClose={() => setIsLangMenuOpen(false)} anchorRef={langMenuTriggerRef} />
                    </div>
                )}
            </div>
             <div className="relative">
                <IconButton ref={userMenuTriggerRef} icon="account_circle" onClick={() => setIsUserMenuOpen(o => !o)} tooltip={isCollapsed ? "Perfil" : undefined} />
                {isUserMenuOpen && (
                     <div className="absolute left-full top-0 ml-2 z-50">
                        <UserMenu isOpen={isUserMenuOpen} onClose={() => setIsUserMenuOpen(false)} anchorRef={userMenuTriggerRef} />
                    </div>
                )}
            </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-grow p-2">
          <ul className="flex flex-col gap-y-1">
            {stageConfig.map((stage) => (
              <NavLink
                key={stage.id}
                stageId={stage.id}
                currentStage={currentStage}
                isStarted={isStarted}
                onStageSelect={onStageSelect}
                icon={stage.icon}
                label={t(stage.labelKey)}
                isCollapsed={isCollapsed}
              />
            ))}
          </ul>
        </nav>

        {/* History Button */}
        <div className="p-2 border-t border-white/10">
             <button
                onClick={onOpenHistory}
                className={`w-full p-3.5 flex items-center gap-3 rounded-xl font-semibold text-neutral-300 hover:bg-white/8 hover:text-white transition-all border border-transparent hover:border-white/10 font-poppins ${isCollapsed ? 'justify-center' : ''}`}
              >
                <span className="material-symbols-outlined">history</span>
                {!isCollapsed && <span className="truncate">Historial</span>}
              </button>
        </div>

        {/* Footer: Collapse Button */}
        <div className={`p-2 border-t border-white/10 flex ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
          <IconButton icon={isCollapsed ? 'chevron_right' : 'chevron_left'} onClick={() => setIsCollapsed(!isCollapsed)} tooltip={isCollapsed ? 'Expandir' : 'Contraer'} />
        </div>
      </aside>

      {/* Mobile Nav - Remains unchanged as per spec */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-sidebar/80 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.35)]">
        <ul className="flex justify-around items-center h-20 px-2 overflow-hidden pb-safe">
          {stageConfig.map((stage) => (
              <li key={`mobile-${stage.id}`} className="flex-1">
                 <Tooltip content={t(stage.labelKey)} position="top">
                    <button onClick={() => isStarted && onStageSelect(stage.id)} disabled={!isStarted} className={`w-full p-2.5 flex flex-col items-center gap-1 rounded-xl transition-all border ${isStarted && currentStage === stage.id ? 'text-primary-100 bg-primary/20 border-primary/30' : 'text-muted-foreground border-transparent'}`}>
                      <span className="material-symbols-outlined">{stage.icon}</span>
                      <span className="text-xs font-bold uppercase truncate font-poppins">{t(stage.labelKey)}</span>
                    </button>
                 </Tooltip>
              </li>
          ))}
        </ul>
      </nav>
      <div className="lg:hidden w-full h-20 flex-shrink-0" />
    </>
  );
};

export default Sidebar;
