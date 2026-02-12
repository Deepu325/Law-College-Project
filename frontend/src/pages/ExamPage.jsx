import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../context/ExamContext';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import AntiCheatAlert from '../components/AntiCheatAlert';

const ExamPage = () => {
    const navigate = useNavigate();
    const {
        sessionData,
        questions,
        answers,
        currentQuestion,
        currentQuestionIndex,
        remainingTime,
        loading,
        saving,
        answeredCount,
        saveAnswer,
        submitExam,
        goToQuestion,
        nextQuestion,
        previousQuestion,
    } = useExam();

    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [tabSwitchCount, setTabSwitchCount] = useState(0);

    // Redirect if no session
    useEffect(() => {
        if (!sessionData && !loading) {
            navigate('/register');
        }
    }, [sessionData, loading, navigate]);

    // Anti-Cheat: Tab Switch Detection
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setTabSwitchCount((prev) => prev + 1);
                console.warn('Security Warning: Tab switch detected.');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // Anti-Cheat: Disable Right Click
    useEffect(() => {
        const handleContextMenu = (e) => {
            e.preventDefault();
            return false;
        };

        document.addEventListener('contextmenu', handleContextMenu);
        return () => document.removeEventListener('contextmenu', handleContextMenu);
    }, []);

    // Format time display
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Get timer class based on remaining time
    const getTimerClass = () => {
        if (remainingTime <= 60) return 'timer-critical font-bold text-error-red animate-pulse';
        if (remainingTime <= 300) return 'timer-warning text-brand-gold font-bold';
        return 'timer-normal text-brand-purple font-medium';
    };

    // Handle answer selection
    const handleAnswerSelect = (option) => {
        if (currentQuestion) {
            saveAnswer(currentQuestion._id, option);
        }
    };

    // Handle submit
    const handleSubmitClick = () => {
        setShowSubmitModal(true);
    };

    const confirmSubmit = async () => {
        setSubmitting(true);
        const success = await submitExam();
        if (success) {
            navigate('/thank-you');
        } else {
            setSubmitting(false);
            setShowSubmitModal(false);
        }
    };

    // Prevent accidental page close
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
            return '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    if (loading || !currentQuestion) {
        return (
            <div className="min-h-screen bg-bg-exam flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-text-body">Loading exam questions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-exam select-none">
            {/* Anti-Cheat Alert Overlay */}
            <AntiCheatAlert count={tabSwitchCount} />

            {/* Top Bar */}
            <div className="bg-white shadow-md sticky top-0 z-10 border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-brand-purple text-white w-10 h-10 rounded flex items-center justify-center font-bold text-xl uppercase tracking-tighter shadow-sm">Sc</div>
                            <div>
                                <h1 className="text-xl font-heading font-bold text-brand-purple leading-tight">S-CLAT Examination</h1>
                                <p className="text-xs text-text-body font-medium uppercase tracking-wider">{sessionData?.fullName}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            {/* Auto-save indicator */}
                            <div className="hidden md:flex items-center gap-2">
                                {saving ? (
                                    <div className="flex items-center gap-2 text-success-green text-sm font-medium">
                                        <div className="w-2 h-2 bg-success-green rounded-full animate-pulse"></div>
                                        <span>Saving...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Auto-saved</span>
                                    </div>
                                )}
                            </div>

                            {/* Timer */}
                            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 shadow-sm min-w-[120px] justify-center">
                                <Clock className={`w-5 h-5 ${remainingTime <= 60 ? 'text-error-red' : 'text-brand-purple'}`} />
                                <span className={`text-xl font-mono tabular-nums ${getTimerClass()}`}>
                                    {formatTime(remainingTime)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Question Area */}
                    <div className="lg:col-span-3">
                        <div className="card-exam bg-white shadow-lg overflow-hidden border-t-2 border-brand-purple">
                            {/* Section Header */}
                            <div className="bg-purple-50 px-6 py-4 border-b border-purple-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="bg-brand-purple text-white px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest">
                                        Section {currentQuestion.section}
                                    </span>
                                    <div className="h-4 w-px bg-purple-200"></div>
                                    <h2 className="text-sm font-bold text-brand-purple">
                                        {currentQuestion.section === 'RC' ? 'Reading Comprehension' : 'Legal Reasoning'}
                                    </h2>
                                </div>
                                <div className="text-sm font-bold text-text-dark">
                                    Question {currentQuestionIndex + 1} / {questions.length}
                                </div>
                            </div>

                            <div className="p-8">
                                {/* Passage (if RC) */}
                                {currentQuestion.passageText && (
                                    <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200 shadow-inner max-h-[350px] overflow-y-auto">
                                        <h3 className="font-bold text-brand-purple text-sm uppercase tracking-wider mb-4 border-b border-purple-100 pb-2">Read the following passage:</h3>
                                        <p className="text-text-body leading-relaxed whitespace-pre-wrap font-serif text-lg">
                                            {currentQuestion.passageText}
                                        </p>
                                    </div>
                                )}

                                {/* Question Text */}
                                <div className="mb-8">
                                    <p className="text-xl text-text-dark leading-relaxed font-semibold">
                                        {currentQuestion.questionText}
                                    </p>
                                </div>

                                {/* Options */}
                                <div className="space-y-4">
                                    {currentQuestion.options.map((option, index) => {
                                        const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                                        const isSelected = answers[currentQuestion._id] === optionLetter;

                                        return (
                                            <label
                                                key={index}
                                                className={`
                          group flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer
                          ${isSelected
                                                        ? 'bg-purple-50 border-brand-purple ring-1 ring-brand-purple'
                                                        : 'bg-white border-gray-100 hover:border-brand-purple hover:bg-gray-50'}
                        `}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${currentQuestion._id}`}
                                                    value={optionLetter}
                                                    checked={isSelected}
                                                    onChange={() => handleAnswerSelect(optionLetter)}
                                                    className="hidden"
                                                />
                                                <div className={`
                          w-8 h-8 rounded-lg flex items-center justify-center font-bold mr-4 transition-colors
                          ${isSelected ? 'bg-brand-purple text-white' : 'bg-gray-100 text-text-dark group-hover:bg-purple-100 group-hover:text-brand-purple'}
                        `}>
                                                    {optionLetter}
                                                </div>
                                                <span className={`text-lg transition-colors ${isSelected ? 'text-brand-purple font-bold' : 'text-text-body'}`}>
                                                    {option}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>

                                {/* Navigation Buttons */}
                                <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-100">
                                    <button
                                        onClick={previousQuestion}
                                        disabled={currentQuestionIndex === 0}
                                        className="btn-outline flex items-center gap-2 py-3 px-6 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        <span>←</span> Previous
                                    </button>

                                    <div className="hidden md:flex flex-col items-center">
                                        <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                                            <div
                                                className="h-full bg-brand-purple transition-all duration-500"
                                                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                                            Progress: {answeredCount} / {questions.length} Answered
                                        </span>
                                    </div>

                                    {currentQuestionIndex < questions.length - 1 ? (
                                        <button
                                            onClick={nextQuestion}
                                            className="btn-primary flex items-center gap-2 py-3 px-8 rounded-lg shadow-md"
                                        >
                                            Next Question <span>→</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSubmitClick}
                                            className="btn-primary bg-success-green hover:bg-green-700 py-3 px-10 rounded-lg shadow-md flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Final Submission
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Question Navigation Grid */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24">
                            <h3 className="font-bold text-text-dark text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                                <div className="w-2 h-2 bg-brand-purple rounded-full"></div>
                                Question Navigator
                            </h3>

                            <div className="grid grid-cols-5 gap-3 mb-8">
                                {questions.map((q, index) => {
                                    const isAnswered = answers[q._id];
                                    const isCurrent = index === currentQuestionIndex;

                                    return (
                                        <button
                                            key={q._id}
                                            onClick={() => goToQuestion(index)}
                                            className={`
                        w-11 h-11 rounded-lg font-bold text-sm transition-all relative
                        ${isCurrent
                                                    ? 'bg-brand-purple text-white shadow-lg ring-2 ring-brand-purple ring-offset-2'
                                                    : isAnswered
                                                        ? 'bg-success-green text-white hover:bg-green-700 hover:scale-105'
                                                        : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                                                }
                      `}
                                        >
                                            {index + 1}
                                            {isAnswered && !isCurrent && (
                                                <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full flex items-center justify-center -mr-0.5 -mt-0.5">
                                                    <div className="w-1.5 h-1.5 bg-success-green rounded-full"></div>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div className="space-y-3 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-tight">
                                    <div className="w-4 h-4 bg-success-green rounded shadow-sm"></div>
                                    <span>Answered</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-tight">
                                    <div className="w-4 h-4 bg-gray-100 rounded shadow-sm border border-gray-200"></div>
                                    <span>Not Answered</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-tight">
                                    <div className="w-4 h-4 bg-brand-purple rounded shadow-sm ring-1 ring-brand-purple ring-offset-1"></div>
                                    <span>Current Question</span>
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-100">
                                <p className="text-[10px] text-brand-purple font-medium text-center uppercase tracking-wider">
                                    System auto-saves all responses
                                </p>
                            </div>

                            <button
                                onClick={handleSubmitClick}
                                className="w-full btn-primary bg-brand-purple py-4 mt-6 flex items-center justify-center gap-2 rounded-lg shadow-lg"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Submit Exam
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit Confirmation Modal */}
            <ConfirmationModal
                isOpen={showSubmitModal}
                onClose={() => setShowSubmitModal(false)}
                onConfirm={confirmSubmit}
                loading={submitting}
                title="Final Submission"
                message={`You have answered ${answeredCount} out of ${questions.length} questions.\n\nAre you sure you want to finish the exam? This action cannot be undone.`}
                confirmText="Yes, Submit My Exam"
                cancelText="Return to Exam"
                icon={AlertTriangle}
                variant="warning"
            />
        </div>
    );
};

export default ExamPage;
