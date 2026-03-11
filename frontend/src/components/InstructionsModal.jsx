import React, { useState } from 'react';
import { Shield, Monitor, RefreshCw, Zap, CheckCircle, AlertCircle, Info } from 'lucide-react';

const InstructionsModal = ({ isOpen, onAccept }) => {
    const [agreed, setAgreed] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col overflow-y-auto font-sans">
            {/* Minimal Top Brand Bar */}
            <div className="h-1.5 w-full bg-brand-purple"></div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-start py-12 px-4 md:py-20 lg:py-24">

                {/* Instruction Card */}
                <div className="w-full max-w-2xl bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">

                    {/* Security Header */}
                    <div className="pt-10 pb-8 px-8 text-center border-b border-gray-50 bg-gray-50/30">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-sm border border-gray-100 mb-6">
                            <Shield className="w-7 h-7 text-brand-purple" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                            Examination Rules & Instructions
                        </h2>
                        <p className="text-gray-500 mt-2 text-sm md:text-base font-medium">
                            Please read carefully before starting the test
                        </p>
                    </div>

                    <div className="p-8 md:p-10 space-y-10">

                        {/* Important Warning Section (Minimalist Version) */}
                        <div className="bg-[#FFF7E6] border border-[#FFD591] rounded-xl p-5 flex gap-4">
                            <AlertCircle className="w-5 h-5 text-[#D48806] flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-[#D48806] text-sm uppercase tracking-wider mb-2">Important Notice</h4>
                                <ul className="text-sm text-[#856404] space-y-2 leading-relaxed font-medium">
                                    <li className="flex gap-2"><span>•</span> Do not switch tabs or minimize the browser during the exam.</li>
                                    <li className="flex gap-2"><span>•</span> The system detects all navigation attempts automatically.</li>
                                    <li className="flex gap-2"><span>•</span> Ensure a stable internet connection for the next 60 minutes.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Rules List */}
                        <div className="grid gap-8">
                            <InstructionItem
                                icon={<Monitor className="w-5 h-5" />}
                                title="Monitoring"
                                description="The exam is proctored and your activity may be recorded for audit."
                            />
                            <InstructionItem
                                icon={<RefreshCw className="w-5 h-5" />}
                                title="No Refresh"
                                description="Do not refresh or navigate away. Progress is saved atomically."
                            />
                            <InstructionItem
                                icon={<Zap className="w-5 h-5" />}
                                title="Auto Submission"
                                description="The timer is strict. At 00:00, your exam will be finalized instantly."
                            />
                            <InstructionItem
                                icon={<Info className="w-5 h-5" />}
                                title="Academic Integrity"
                                description="Any attempt to use unfair means will lead to immediate disqualification."
                            />
                        </div>

                        <label className="flex items-center gap-4 cursor-pointer group p-4 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors">
                            <div className="relative flex-shrink-0">
                                <input
                                    type="checkbox"
                                    className="peer h-6 w-6 cursor-pointer appearance-none rounded border-2 border-gray-300 transition-all checked:bg-brand-purple checked:border-brand-purple"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                />
                                <CheckCircle className="absolute top-0 left-0 h-6 w-6 text-white scale-0 transition-transform peer-checked:scale-100 pointer-events-none p-0.5" />
                            </div>
                            <span className="text-sm md:text-base font-semibold text-gray-700 select-none">
                                I have read, understood and agree to follow all the exam rules.
                            </span>
                        </label>

                        {/* Malpractice Warning */}
                        <div className="mt-8 p-5 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-error-red flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-error-red font-bold leading-relaxed">
                                Any form of malpractice, cheating, impersonation, or use of unfair means during the examination will result in immediate cancellation of the candidate’s candidature.
                            </p>
                        </div>

                        <button
                            onClick={onAccept}
                            disabled={!agreed}
                            className={`w-full py-4.5 mt-6 rounded-xl font-bold text-lg shadow-sm flex items-center justify-center gap-2 transition-all duration-200
                                    ${agreed
                                    ? 'bg-brand-purple text-white hover:bg-purple-700 active:scale-[0.98]'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                                `}
                        >
                            I Agree & Start Exam
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Section */}
            <div className="mt-12 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-[0.2em] font-bold">
                    Secure Examination Portal — SLET 2026
                </p>
            </div>
        </div>
    );
};

const InstructionItem = ({ icon, title, description }) => (
    <div className="flex items-start gap-5">
        <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-lg text-brand-purple flex-shrink-0 mt-0.5">
            {icon}
        </div>
        <div>
            <h5 className="font-bold text-gray-900 text-base">{title}</h5>
            <p className="text-sm text-gray-500 font-medium leading-relaxed mt-1">{description}</p>
        </div>
    </div>
);

export default InstructionsModal;
