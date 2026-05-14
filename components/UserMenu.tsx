
import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './common/Button';

interface UserMenuProps {
    isOpen: boolean;
    onClose: () => void;
    anchorRef: React.RefObject<HTMLButtonElement>;
}

const UserMenu: React.FC<UserMenuProps> = ({ isOpen, onClose, anchorRef }) => {
    const { t } = useLanguage();
    const { user, signOut } = useAuth();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && !anchorRef.current?.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, anchorRef]);

    if (!isOpen) return null;

    const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario';
    const displayEmail = user?.email || '';

    return (
        <div ref={dropdownRef} className="w-64 bg-card dark:bg-neutral-800 rounded-2xl shadow-2xl z-50 animate-toast-in overflow-hidden">
            <div className="p-4 border-b border-border">
                <p className="font-bold text-sm text-foreground truncate font-poppins">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate font-roboto">{displayEmail}</p>
            </div>
            <div className="p-2 space-y-1">
                <Button variant="ghost" className="w-full justify-start gap-x-3 opacity-60 cursor-not-allowed">
                    <span className="material-symbols-outlined text-lg">edit</span>
                    <span>{t('sidebar.editUser')}</span>
                </Button>
                <Button variant="ghost" onClick={signOut} className="w-full justify-start gap-x-3 text-destructive hover:bg-destructive/10">
                    <span className="material-symbols-outlined text-lg">logout</span>
                    <span>{t('sidebar.logout')}</span>
                </Button>
            </div>
        </div>
    );
};

export default UserMenu;
