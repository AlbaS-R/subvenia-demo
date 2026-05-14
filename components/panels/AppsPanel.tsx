
import React from 'react';
import { IconButton } from '../common/IconButton';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../common/Button';

interface AppsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const tools = [
    { name: 'Find', icon: 'find_in_page', url: 'https://gw-find-projects-eu-987068747069.us-west1.run.app/' },
    { name: 'Validate', icon: 'science', url: 'https://gw-validate-projects-eu-987068747069.us-west1.run.app/' },
    { name: 'Create', icon: 'lightbulb', url: 'https://gw-create-project-eu-987068747069.us-west1.run.app/' },
    { name: 'Match', icon: 'handshake', url: 'https://gw-match-sw-987068747069.us-west1.run.app/' },
    { name: 'Write', icon: 'edit_note', url: 'https://write.demo.acceleralia.com/' },
    { name: 'Evaluate', icon: 'fact_check', url: '/#', isDev: true },
    { name: 'Readapt', icon: 'autorenew', url: 'https://gw-readapt-projects-eu-987068747069.us-west1.run.app' },
    { name: 'Manage', icon: 'bar_chart', url: 'https://gw-manage-377433633160.us-west1.run.app' },
];

const solutions = [
    { name: 'SALESWIN.AI', url: 'https://grantsales-leads.grantswin.ai/' },
    { name: 'TENDERSWIN.AI', url: 'https://tenderswin-home.netlify.app/' },
    { name: 'GOVSWIN.AI', url: 'https://govsupply-home.netlify.app/' },
    { name: 'ACCELERALIA', url: 'https://ac-0-suite-home-acceleralia-com-rya-lpp-patricio-966724069199.us-west1.run.app/' },
];

const ToolCard: React.FC<{ icon: string; title: string; onClick: () => void; }> = ({ icon, title, onClick }) => (
    <button onClick={onClick} className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all shadow-md hover:shadow-lg hover:-translate-y-1">
        <div className="flex items-center justify-center text-primary-500 text-3xl mb-2 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined">{icon}</span>
        </div>
        <span className="text-sm font-semibold text-center text-foreground font-poppins">{title}</span>
    </button>
);


export const AppsPanel: React.FC<AppsPanelProps> = ({ isOpen, onClose }) => {
    const { session } = useAuth();
    const { theme } = useTheme();
    const { showToast } = useToast();

    const handleNavigate = (url: string, isDev: boolean = false) => {
        if (isDev) {
            showToast("Esta herramienta está en desarrollo.", "info");
            return;
        }

        let finalUrl = url;
        const token = session?.access_token;

        if (token) {
            if (url.includes('?')) {
                finalUrl += `&token=${token}`;
            } else {
                finalUrl += `?token=${token}`;
            }
        }
        // Abrir en pestaña nueva según lo solicitado
        window.open(finalUrl, '_blank');
    };

    const darkLogoUrl = "https://grantswin.fra1.digitaloceanspaces.com/PUBLIC/logos-suite/SVG/GrantsWin/Horizontal/GrantsWin-horizontal-dark.svg";
    const lightLogoUrl = "https://grantswin.fra1.digitaloceanspaces.com/PUBLIC/logos-suite/SVG/GrantsWin/Horizontal/GrantsWin-horizontal.svg";

    return (
        <>
            <div 
                className={`fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            ></div>
            <div className={`fixed top-0 bottom-0 left-0 z-[100] glass-panel shadow-2xl transition-transform duration-300 ease-in-out w-[300px] border-r border-white/10 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <header className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
                        <a href="https://suite.grantswin.ai/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                            <img src={lightLogoUrl} alt="GrantsWin.AI" className="h-8 w-auto dark:hidden" />
                            <img src={darkLogoUrl} alt="GrantsWin.AI" className="h-8 w-auto hidden dark:block" />
                        </a>
                        <IconButton icon="close" onClick={onClose} className="hover:bg-muted" />
                    </header>
                    <div className="flex-grow p-6 space-y-8 overflow-y-auto custom-scrollbar">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 font-poppins">HERRAMIENTAS</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {tools.map(tool => (
                                    <ToolCard key={tool.name} icon={tool.icon} title={tool.name} onClick={() => handleNavigate(tool.url, tool.isDev)} />
                                ))}
                            </div>
                        </div>
                        <hr className="border-t border-border" />
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 font-poppins">OTRAS SOLUCIONES</h3>
                            <div className="flex flex-col gap-4">
                                {solutions.map(solution => (
                                    <Button variant="ghost" key={solution.name} onClick={() => handleNavigate(solution.url)} className="w-full justify-start text-foreground hover:text-primary-500 uppercase">
                                        {solution.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
