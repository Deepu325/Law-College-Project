import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ showLogo = true, title = 'SLET', subtitle = 'Soundarya Law Entrance Test', action = null }) => {
    const navigate = useNavigate();

    return (
        <header className="bg-brand-purple text-white h-32 shadow-md flex items-center overflow-hidden">
            <div className="w-full px-4">
                <div className="flex items-center justify-center gap-6 relative">
                    {showLogo && (
                        <img src="/logo.png" alt="SLET Logo" className="h-55 w-55 object-contain flex-shrink-0 absolute left-4" />
                    )}
                    <div className="text-center">
                        <h1 className="text-3xl font-heading font-bold text-white">{title}</h1>
                        <p className="text-purple-200 mt-1">{subtitle}</p>
                    </div>
                    {action && <div className="absolute right-4 flex-shrink-0">{action}</div>}
                </div>
            </div>
        </header>
    );
};

export default Header;
