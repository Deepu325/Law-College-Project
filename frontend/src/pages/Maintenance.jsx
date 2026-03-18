import React from 'react';
import { AlertTriangle, Clock, Phone, Mail } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Maintenance = () => {
    return (
        <div className="min-h-screen bg-bg-exam flex flex-col font-body">
            <Header title="S-CLAT" subtitle="System Maintenance" />

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-100 animate-fade-in text-center p-8 md:p-12">
                    <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-yellow-100">
                        <AlertTriangle className="w-12 h-12 text-yellow-600 animate-pulse" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-heading font-black text-brand-purple mb-4">
                        System Under Maintenance
                    </h1>
                    
                    <p className="text-lg text-text-body/80 mb-8 leading-relaxed">
                        The examination system is temporarily <span className="text-red-600 font-bold">PAUSED</span> for maintenance or administrative updates. 
                        Please don't worry—your progress (if you were in an active exam) has been saved.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <Clock className="w-6 h-6 text-brand-purple mx-auto mb-2" />
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Estimated Return</p>
                            <p className="text-lg font-black text-brand-purple">Coming Soon</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <AlertTriangle className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Active Exams</p>
                            <p className="text-lg font-black text-brand-purple">Paused</p>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100">
                        <p className="text-sm text-gray-400 mb-4 font-bold uppercase tracking-widest">Application Maintenance Team</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <a href="tel:+918310605144" className="flex items-center gap-2 text-brand-purple font-bold hover:underline">
                                <Phone className="w-4 h-4" />
                                +91 83106 05144
                            </a>
                            <a href="mailto:deepukc2526@gmail.com" className="flex items-center gap-2 text-brand-purple font-bold hover:underline">
                                <Mail className="w-4 h-4" />
                                deepukc2526@gmail.com
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Maintenance;
