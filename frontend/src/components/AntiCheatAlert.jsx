import React from 'react';
import { ShieldAlert } from 'lucide-react';

const AntiCheatAlert = ({ count }) => {
    if (count === 0) return null;

    return (
        <div className="fixed bottom-6 left-6 z-50 animate-bounce">
            <div className="bg-red-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border-2 border-white">
                <ShieldAlert className="w-5 h-5" />
                <span className="text-sm font-bold">
                    Warning: Tab Switch Detected ({count}/3)
                </span>
            </div>
        </div>
    );
};

export default AntiCheatAlert;
