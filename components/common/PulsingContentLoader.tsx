
import React from 'react';

export const PulsingContentLoader: React.FC = () => {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="space-y-3">
                <div className="h-6 bg-white/15 rounded-xl w-3/4"></div>
                <div className="h-4 bg-white/10 rounded-xl w-1/2"></div>
            </div>
            <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded-xl w-full"></div>
                <div className="h-4 bg-white/10 rounded-xl w-full"></div>
                <div className="h-4 bg-white/10 rounded-xl w-5/6"></div>
            </div>
             <div className="space-y-2 pt-4">
                <div className="h-4 bg-white/10 rounded-xl w-full"></div>
                <div className="h-4 bg-white/10 rounded-xl w-2/3"></div>
            </div>
        </div>
    );
};
