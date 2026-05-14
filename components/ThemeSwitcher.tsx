import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './common/Button';
import { Tooltip } from './common/Tooltip';
import { useLanguage } from '../contexts/LanguageContext';

// Fix: Add isCollapsed prop to handle dynamic tooltip positioning
export const ThemeSwitcher: React.FC<{ isCollapsed?: boolean }> = ({ isCollapsed }) => {
    const { theme, setTheme } = useTheme();
    const { t } = useLanguage();

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const tooltipContent = theme === 'light' ? t('themeSwitcher.switchToDark') : t('themeSwitcher.switchToLight');

    return (
        <Tooltip content={tooltipContent} position={isCollapsed ? 'right' : 'bottom'}>
            <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-9 px-0 hover:bg-muted focus:bg-muted"
                aria-label={tooltipContent}
            >
                {theme === 'light' ? (
                    <span className="material-symbols-outlined text-xl">dark_mode</span>
                ) : (
                    <span className="material-symbols-outlined text-xl">light_mode</span>
                )}
            </Button>
        </Tooltip>
    );
};