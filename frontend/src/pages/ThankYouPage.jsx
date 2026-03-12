import React, { useState, useEffect } from 'react';
import { CheckCircle, Home, ExternalLink } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const COLLEGE_URL = 'https://soundaryalaw.edu.in/';

const ThankYouPage = () => {
    const [countdown, setCountdown] = useState(10);

    // Auto-redirect after 10 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    window.location.href = COLLEGE_URL;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleBackToHome = () => {
        window.location.href = COLLEGE_URL;
    };

    return (
        <div className="min-h-screen bg-bg-exam flex flex-col font-body">
            <Header showLogo={true} />

            <div className="flex-1 flex items-center justify-center px-4 py-8 md:py-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-purple-50 pointer-events-none"></div>
                
                <div className="max-w-2xl w-full relative z-10">
                    <div className="card-exam bg-white shadow-2xl rounded-2xl border-t-8 border-success-green p-6 sm:p-10 md:p-12 text-center transform transition-all duration-500 scale-100 animate-in zoom-in-95">
                        
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-inner relative">
                            <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-success-green absolute" />
                            <div className="absolute inset-0 border-4 border-success-green rounded-full animate-ping opacity-20"></div>
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-brand-purple mb-4 tracking-tight leading-tight">
                            Successfully Submitted!
                        </h1>

                        <p className="text-base sm:text-lg text-gray-600 font-medium mb-8 max-w-lg mx-auto">
                            Thank you for completing the Soundarya Law Entrance Test.
                        </p>

                        <div className="bg-white p-6 sm:p-8 rounded-2xl mb-10 border border-gray-200 shadow-sm text-left">
                            <h2 className="font-extrabold text-sm sm:text-base text-brand-purple mb-4 uppercase tracking-widest border-b border-gray-200 pb-2">Next Steps</h2>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="bg-success-green/20 p-1 rounded mt-0.5"><CheckCircle className="w-4 h-4 text-success-green" /></div>
                                    <span className="text-gray-700 text-sm sm:text-base font-medium leading-relaxed">Your responses have been securely audited and saved.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="bg-success-green/20 p-1 rounded mt-0.5"><CheckCircle className="w-4 h-4 text-success-green" /></div>
                                    <span className="text-gray-700 text-sm sm:text-base font-medium leading-relaxed">The admission team has been notified of your completion.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="bg-purple-100 p-1 rounded mt-0.5"><CheckCircle className="w-4 h-4 text-brand-purple" /></div>
                                    <span className="text-gray-700 text-sm sm:text-base font-medium leading-relaxed">Results will be communicated exclusively via the provided email/phone.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="border-t border-gray-100 pt-8 mt-2 mb-10 text-left bg-yellow-50/50 p-6 rounded-xl">
                            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-bold uppercase tracking-wide">
                                <span className="text-brand-gold mr-2">Disclaimer:</span>
                                Qualification does not automatically guarantee admission. Subject to fulfillment of eligibility and seat availability.
                            </p>
                        </div>

                        <button
                            onClick={handleBackToHome}
                            className="w-full sm:w-auto relative inline-flex items-center justify-center min-h-[56px] px-8 py-4 overflow-hidden font-bold text-white bg-brand-purple rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 text-lg hover:bg-purple-900 group"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                <Home className="w-5 h-5 group-hover:hidden" />
                                <ExternalLink className="w-5 h-5 hidden group-hover:block" />
                                Return to College Website
                            </span>
                        </button>

                        <div className="mt-8 flex items-center justify-center gap-2">
                           <div className="text-sm font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-4 py-2 rounded-full shadow-inner">
                               Redirecting in <span className="text-brand-purple font-black text-base">{countdown}</span>s
                           </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ThankYouPage;
