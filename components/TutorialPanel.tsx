
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface TutorialPanelProps {
    currentStage: number;
}

interface TutorialPoint {
    title: string;
    description: string;
}

const TutorialPanel: React.FC<TutorialPanelProps> = ({ currentStage }) => {
    const { t } = useLanguage();
    
    // The 't' function might return the key if not found, so we need to check for that
    const pointsData = t(`tutorialPanel.stage${currentStage}.points`);
    const points: TutorialPoint[] | undefined = Array.isArray(pointsData) ? pointsData : undefined;

    return (
        <aside className="sticky top-8">
            {points && (
                <div className="glass-panel rounded-2xl p-6 shadow-xl border border-white/10">
                    <h3 className="text-lg font-semibold text-neutral-100 flex items-center gap-2 mb-4 font-poppins">
                        <span className="material-symbols-outlined text-xl leading-none text-primary">info</span>
                        {t('tutorialPanel.title')}
                    </h3>
                    <ul className="space-y-4">
                        {points.map((point, index) => (
                            <li key={index}>
                                <p className="font-semibold text-neutral-100 font-poppins">{point.title}</p>
                                <p className="text-neutral-300 text-base mt-1 font-roboto">{point.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </aside>
    );
};

export default TutorialPanel;
