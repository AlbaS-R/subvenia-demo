
import React from 'react';

interface BrowserFrameProps {
    children: React.ReactNode;
    url?: string;
}

export const BrowserFrame: React.FC<BrowserFrameProps> = ({ children, url = "https://example.com" }) => {
    return (
        <div className="w-full h-full rounded-2xl shadow-2xl overflow-hidden glass-panel flex flex-col border border-white/10">
            {/* Browser Header */}
            <div className="flex-shrink-0 h-11 bg-white/8 backdrop-blur-xl flex items-center px-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 bg-destructive-500 rounded-full border border-destructive-600/50"></span>
                    <span className="w-3.5 h-3.5 bg-primary-400 rounded-full border border-primary-500/50"></span>
                    <span className="w-3.5 h-3.5 bg-tertiary-500 rounded-full border border-tertiary-600/50"></span>
                </div>
                <div className="flex-grow flex items-center justify-center">
                    <div className="bg-black/20 border border-white/10 rounded-full w-full max-w-md h-7 flex items-center px-4">
                        <p className="text-sm text-neutral-300 truncate font-roboto">{url}</p>
                    </div>
                </div>
                <div className="w-16"></div> {/* Spacer to balance header */}
            </div>
            {/* Browser Content */}
            <div className="flex-grow overflow-y-auto">
                {children}
            </div>
        </div>
    );
};
