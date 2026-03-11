import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FileText, AlertCircle, Calendar } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useExam } from '../context/ExamContext';

const LandingPage = () => {
    const navigate = useNavigate();
    const { examConfig } = useExam();

    const now = new Date();
    const startTime = examConfig ? new Date(examConfig.startTime) : null;
    const stopTime = examConfig ? new Date(examConfig.stopTime) : null;

    const isBefore = startTime && now < startTime;
    const isAfter = stopTime && now > stopTime;
    const isOpen = startTime && stopTime && now >= startTime && now <= stopTime;

    const formatDate = (date) => {
        if (!date) return '';
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="min-h-screen bg-bg-exam flex flex-col font-body">
            <Header showLogo={true} title="SLET" subtitle="Soundarya Law Entrance Test" />

            {/* Main Content */}
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 max-w-5xl flex-1 flex flex-col items-center">
                
                {/* Hero / Exam Overview Card */}
                <div className="card-exam w-full mb-8 transform transition-all duration-300 hover:shadow-lg border-t-4 border-t-brand-purple">
                    <div className="text-center mb-10">
                        <span className="inline-block py-1.5 px-4 rounded-full bg-purple-100 text-brand-purple text-xs font-bold uppercase tracking-widest mb-4">
                            Admissions 2026
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-heading font-extrabold text-brand-purple mb-4 leading-tight">
                            Examination Overview
                        </h2>
                        <div className="w-24 h-1.5 bg-brand-gold mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
                        {/* Duration */}
                        <div className="group bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center transform hover:-translate-y-1">
                            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-brand-purple transition-colors duration-300">
                                <Clock className="w-8 h-8 text-brand-purple group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="font-bold text-lg text-text-dark mb-2 font-heading">Duration</h3>
                            <p className="text-text-body font-medium bg-gray-50 px-4 py-1.5 rounded-full text-sm">60 Minutes</p>
                        </div>

                        {/* Window */}
                        <div className="group bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center transform hover:-translate-y-1 relative sm:col-span-2 md:col-span-1">
                            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-brand-purple transition-colors duration-300">
                                <Calendar className="w-8 h-8 text-brand-purple group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="font-bold text-lg text-text-dark mb-2 font-heading">Window</h3>
                            <div className="space-y-1 w-full bg-gray-50 p-2 md:p-3 rounded-lg text-xs font-mono font-medium text-text-body">
                                <div className="flex flex-wrap justify-center gap-1">
                                    <span className="text-brand-purple font-bold">Start:</span> {formatDate(startTime)}
                                </div>
                                <div className="flex flex-wrap justify-center gap-1">
                                    <span className="text-error-red font-bold">End:</span> {formatDate(stopTime)}
                                </div>
                            </div>
                        </div>

                        {/* Questions */}
                        <div className="group bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center transform hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
                            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-brand-purple transition-colors duration-300">
                                <FileText className="w-8 h-8 text-brand-purple group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="font-bold text-lg text-text-dark mb-2 font-heading">Questions</h3>
                            <p className="text-text-body font-medium bg-gray-50 px-4 py-1.5 rounded-full text-sm">30 MCQs</p>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-10">
                        {/* Exam Structure */}
                        <div className="bg-gray-50 p-6 sm:p-8 rounded-2xl border border-gray-100">
                            <h3 className="text-xl sm:text-2xl font-bold mb-6 text-brand-purple font-heading flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-brand-purple text-white flex items-center justify-center text-sm font-bold">1</span>
                                Exam Structure
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex items-start bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-50 gap-4 transition-all hover:bg-purple-50">
                                    <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center flex-shrink-0 text-brand-gold font-bold">10</div>
                                    <div>
                                        <p className="font-bold text-text-dark text-sm sm:text-base">General Knowledge & CA</p>
                                    </div>
                                </li>
                                <li className="flex items-start bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-50 gap-4 transition-all hover:bg-purple-50">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold">8</div>
                                    <div>
                                        <p className="font-bold text-text-dark text-sm sm:text-base">Logical Reasoning</p>
                                    </div>
                                </li>
                                <li className="flex items-start bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-50 gap-4 transition-all hover:bg-purple-50">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-green-600 font-bold">2</div>
                                    <div>
                                        <p className="font-bold text-text-dark text-sm sm:text-base">Quantitative Aptitude</p>
                                    </div>
                                </li>
                                <li className="flex items-start bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-50 gap-4 transition-all hover:bg-purple-50">
                                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600 font-bold">10</div>
                                    <div>
                                        <p className="font-bold text-text-dark text-sm sm:text-base">Legal Reading Comp.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Instructions */}
                        <div className="p-4 sm:p-6 lg:p-8">
                            <h3 className="text-xl sm:text-2xl font-bold mb-6 text-brand-purple font-heading flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-brand-purple text-white flex items-center justify-center text-sm font-bold">2</span>
                                General Guidelines
                            </h3>
                            <ul className="space-y-5 text-gray-600 text-sm sm:text-base font-medium">
                                <li className="flex items-start group">
                                    <span className="text-brand-gold font-bold mr-3 mt-0.5">•</span>
                                    <span className="group-hover:text-text-dark transition-colors">You will have <strong className="text-brand-purple">60 minutes</strong> to complete the exam.</span>
                                </li>
                                <li className="flex items-start group">
                                    <span className="text-brand-gold font-bold mr-3 mt-0.5">•</span>
                                    <span className="group-hover:text-text-dark transition-colors">Your answers are <strong className="text-brand-purple">auto-saved</strong> as you progress.</span>
                                </li>
                                <li className="flex items-start group">
                                    <span className="text-brand-gold font-bold mr-3 mt-0.5">•</span>
                                    <span className="group-hover:text-text-dark transition-colors">You can navigate between questions easily.</span>
                                </li>
                                <li className="flex items-start group">
                                    <span className="text-brand-gold font-bold mr-3 mt-0.5">•</span>
                                    <span className="group-hover:text-text-dark transition-colors">The exam will <strong className="text-brand-purple">auto-submit</strong> when time expires.</span>
                                </li>
                                <li className="flex items-start group">
                                    <span className="text-brand-gold font-bold mr-3 mt-0.5">•</span>
                                    <span className="group-hover:text-text-dark transition-colors">You can resume if browser closes accidentally.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Alerts Array Grid Layout */}
                    <div className="grid md:grid-cols-2 gap-6 mb-12">
                        {/* Important Notice */}
                        <div className="bg-yellow-50 border-l-4 border-brand-gold p-6 rounded-xl rounded-l-none shadow-sm h-full transition-transform hover:-translate-y-1">
                            <div className="flex flex-col sm:flex-row items-start gap-4">
                                <div className="bg-brand-gold/20 p-2 rounded-full flex-shrink-0">
                                    <AlertCircle className="w-6 h-6 text-yellow-700" />
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-sm sm:text-base mb-3 text-yellow-800 uppercase tracking-widest">Notice</h4>
                                    <ul className="space-y-2 text-yellow-900/80 text-sm font-medium">
                                        <li className="flex items-start gap-2"><span className="text-brand-gold">•</span> You can attempt only once.</li>
                                        <li className="flex items-start gap-2"><span className="text-brand-gold">•</span> Ensure stable internet.</li>
                                        <li className="flex items-start gap-2"><span className="text-brand-gold">•</span> Do not refresh unnecessarily.</li>
                                        <li className="flex items-start gap-2"><span className="text-brand-gold">•</span> Valid email & phone required.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Malpractice Warning */}
                        <div className="bg-red-50 border-l-4 border-error-red p-6 rounded-xl rounded-l-none shadow-sm h-full transition-transform hover:-translate-y-1">
                            <div className="flex flex-col sm:flex-row items-start gap-4">
                                <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
                                    <AlertCircle className="w-6 h-6 text-error-red" />
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-sm sm:text-base mb-3 text-red-800 uppercase tracking-widest">Warning</h4>
                                    <p className="text-red-900/80 text-sm font-medium leading-relaxed">
                                        Any form of malpractice, cheating, or impersonation during the examination will be recorded and will result in strict <strong className="text-error-red">cancellation</strong> of candidature.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Start Button & Admission Disclaimer */}
                    <div className="text-center flex flex-col items-center gap-6 md:gap-8 bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
                        {isBefore ? (
                            <div className="p-6 bg-blue-50 text-blue-800 rounded-xl border border-blue-200 max-w-md w-full shadow-inner text-center">
                                <Clock className="w-10 h-10 text-blue-500 mx-auto mb-3 animate-bounce" />
                                <p className="font-bold text-lg mb-1">The exam has not started yet.</p>
                                <p className="text-sm font-mono bg-white inline-block px-3 py-1 rounded">Resume at: {formatDate(startTime)}</p>
                            </div>
                        ) : isAfter ? (
                            <div className="p-6 bg-red-50 text-error-red rounded-xl border border-red-200 max-w-md w-full shadow-inner text-center">
                                <AlertCircle className="w-10 h-10 text-error-red mx-auto mb-3" />
                                <p className="font-bold text-lg">The exam session has ended.</p>
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate('/register')}
                                className="group relative inline-flex items-center justify-center min-h-[56px] px-8 sm:px-16 py-4 sm:py-5 overflow-hidden font-bold text-white bg-brand-purple rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 text-lg sm:text-xl font-heading tracking-wide"
                            >
                                <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                                <span className="relative z-10 flex items-center gap-3">
                                    Begin Registration
                                    <span className="transition-transform group-hover:translate-x-1">→</span>
                                </span>
                            </button>
                        )}

                        <p className="text-xs sm:text-sm text-gray-500 max-w-2xl leading-relaxed font-medium bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            Qualification in the entrance test does not automatically guarantee admission. Admission is subject to fulfillment of eligibility criteria, availability of seats, and verification of documents.
                            <br/><br/>
                            <span className="text-brand-purple font-bold block mt-2">By proceeding, you agree to these terms.</span>
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default LandingPage;
