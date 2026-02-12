import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const ThankYouPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-bg-exam flex items-center justify-center px-4">
            <div className="max-w-2xl w-full">
                <div className="card-exam text-center">
                    <CheckCircle className="w-20 h-20 text-success-green mx-auto mb-6" />

                    <h1 className="text-4xl font-heading font-bold text-brand-purple mb-4">
                        Exam Submitted Successfully!
                    </h1>

                    <p className="text-lg text-text-body mb-6">
                        Thank you for completing the S-CLAT examination.
                    </p>

                    <div className="bg-purple-50 p-6 rounded-lg mb-8">
                        <h2 className="font-semibold text-lg text-text-dark mb-3">What happens next?</h2>
                        <ul className="text-left space-y-2 text-text-body">
                            <li className="flex items-start">
                                <span className="text-brand-purple mr-2">•</span>
                                <span>Your responses have been securely saved.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-brand-purple mr-2">•</span>
                                <span>The admission team has been notified of your submission.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-brand-purple mr-2">•</span>
                                <span>Results will be communicated by the college administration.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-brand-purple mr-2">•</span>
                                <span>You will be contacted via the email and phone number provided.</span>
                            </li>
                        </ul>
                    </div>

                    <p className="text-sm text-gray-500 mb-6">
                        Please note: You cannot view your score or retake this exam.
                    </p>

                    <button
                        onClick={() => navigate('/')}
                        className="btn-secondary"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThankYouPage;
