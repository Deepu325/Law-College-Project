import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-bg-exam">
            {/* Header */}
            <header className="bg-brand-purple text-white py-6 shadow-md">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-heading font-bold text-center">S-CLAT</h1>
                    <p className="text-center text-purple-200 mt-2">Online Law Entrance Examination</p>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Exam Overview Card */}
                <div className="card-exam mb-8">
                    <h2 className="text-3xl font-heading font-bold text-brand-purple mb-6 text-center">
                        Examination Overview
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <Clock className="w-12 h-12 text-brand-purple mx-auto mb-3" />
                            <h3 className="font-semibold text-lg mb-2">Duration</h3>
                            <p className="text-text-body">60 Minutes</p>
                        </div>

                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <FileText className="w-12 h-12 text-brand-purple mx-auto mb-3" />
                            <h3 className="font-semibold text-lg mb-2">Questions</h3>
                            <p className="text-text-body">30 MCQs</p>
                        </div>

                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <CheckCircle className="w-12 h-12 text-brand-purple mx-auto mb-3" />
                            <h3 className="font-semibold text-lg mb-2">Sections</h3>
                            <p className="text-text-body">RC & Legal Reasoning</p>
                        </div>
                    </div>

                    {/* Exam Structure */}
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-4 text-brand-purple">Exam Structure</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <span className="text-brand-purple mr-3">•</span>
                                <span><strong>Section A:</strong> Reading Comprehension - 2 passages with 10 questions each (20 marks)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-brand-purple mr-3">•</span>
                                <span><strong>Section B:</strong> Legal Reasoning - 10 principle-based questions (10 marks)</span>
                            </li>
                        </ul>
                    </div>

                    {/* Instructions */}
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-4 text-brand-purple">Important Instructions</h3>
                        <ul className="space-y-3 text-text-body">
                            <li className="flex items-start">
                                <span className="text-brand-purple mr-3">1.</span>
                                <span>You will have <strong>60 minutes</strong> to complete the exam once you start.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-brand-purple mr-3">2.</span>
                                <span>Your answers will be <strong>auto-saved</strong> as you progress.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-brand-purple mr-3">3.</span>
                                <span>You can navigate between questions and change answers before submission.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-brand-purple mr-3">4.</span>
                                <span>The exam will <strong>auto-submit</strong> when time expires.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-brand-purple mr-3">5.</span>
                                <span>You can resume the exam if you refresh or close the browser (within time limit).</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-brand-purple mr-3">6.</span>
                                <span>Results will be visible only to the admin team.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Important Notice */}
                    <div className="bg-yellow-50 border-l-4 border-brand-gold p-6 mb-8">
                        <div className="flex items-start">
                            <AlertCircle className="w-6 h-6 text-brand-gold mr-3 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-lg mb-2 text-text-dark">Important Notice</h4>
                                <ul className="space-y-2 text-text-body">
                                    <li>• You can attempt this exam <strong>only once</strong>.</li>
                                    <li>• Ensure stable internet connection before starting.</li>
                                    <li>• Do not refresh or close the browser unnecessarily.</li>
                                    <li>• Your email and phone number must be unique.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Start Button */}
                    <div className="text-center">
                        <button
                            onClick={() => navigate('/register')}
                            className="btn-primary text-lg px-12 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                        >
                            Start Test
                        </button>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="text-center text-sm text-gray-500 mt-8">
                    By proceeding, you agree to the terms and conditions of this examination.
                </p>
            </main>
        </div>
    );
};

export default LandingPage;
