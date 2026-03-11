import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ showLogo = true, title = 'SLET', subtitle = 'Soundarya Law Entrance Test', action = null }) => {
    const navigate = useNavigate();

    return (
        <header className="bg-brand-purple text-white min-h-[5rem] md:min-h-[8rem] shadow-md flex items-center relative z-20">
            <div className="container mx-auto px-4 sm:px-6 py-3 md:py-4">
                <div className="flex flex-row items-center justify-between relative">
                    
                    {/* Logo Section */}
                    {showLogo && (
                        <div className="z-10 flex-shrink-0 flex items-center">
                            <img 
                                src="/logo.png" 
                                alt="SLET Logo" 
                                className="h-16 w-auto sm:h-20 md:h-24 object-contain cursor-pointer transition-transform duration-300 hover:scale-105 bg-white p-1 rounded" 
                                onClick={() => navigate('/')}
                            />
                        </div>
                    )}
                    
                    {/* Title Section */}
                    <div className={`text-center z-0 flex-1 px-2 sm:px-4 ${!action && showLogo ? 'pr-16 sm:pr-20 md:pr-24' : ''}`}>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-white tracking-wide">
                            {title}
                        </h1>
                        <p className="text-[10px] sm:text-xs md:text-base text-purple-200 mt-1 md:mt-2 uppercase tracking-widest font-bold">
                            {subtitle}
                        </p>
                    </div>
                    
                    {/* Action Section */}
                    {action && (
                        <div className="z-10 flex-shrink-0 flex items-center">
                            {action}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
