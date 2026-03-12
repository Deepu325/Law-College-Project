import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../context/ExamContext';
import { Clock, CheckCircle, AlertTriangle, Menu, X, Save, FileText } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import AntiCheatAlert from '../components/AntiCheatAlert';
import InstructionsModal from '../components/InstructionsModal';

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
        isSubmitted,
        isLocked,
        isSyncing,
        hasStarted,
        startExam,
        examConfig,
        configError
    } = useExam();

    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [isNavOpen, setIsNavOpen] = useState(false);

    const now = new Date();
    const startTime = examConfig ? new Date(examConfig.startTime) : null;
    const stopTime = examConfig ? new Date(examConfig.stopTime) : null;

    const isBefore = startTime && now < startTime;
    const isAfter = stopTime && now > stopTime;

    // Debug logs
    useEffect(() => {
        if (examConfig) {
            console.log('[ExamPage] Initialization Check:', {
                configLoaded: !!examConfig,
                hasSession: !!sessionData,
                questionsCount: questions.length,
                startTime: startTime?.toISOString(),
                stopTime: stopTime?.toISOString(),
                currentTime: now.toISOString(),
                status: isBefore ? 'BEFORE' : isAfter ? 'AFTER' : 'ACTIVE'
            });
        }
    }, [examConfig, sessionData, questions, startTime, stopTime, now, isBefore, isAfter]);

    // Redirect if no session
    useEffect(() => {
        if (!sessionData && !loading) {
            console.warn('[ExamPage] No session found, redirecting to register');
            navigate('/register');
        }
    }, [sessionData, loading, navigate]);

    // Format time display
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Helper to get timer CSS class
    const getTimerClass = () => {
        if (remainingTime <= 60) return 'text-error-red animate-pulse';
        if (remainingTime <= 300) return 'text-brand-gold';
        return 'text-brand-purple';
    };

    // Handle option selection
    const handleAnswerSelect = useCallback((option) => {
        if (isLocked || !currentQuestion) return;
        saveAnswer(currentQuestion._id, option);
    }, [isLocked, currentQuestion, saveAnswer]);

    // Submission handlers
    const handleSubmitClick = () => {
        setShowSubmitModal(true);
    };

    const confirmSubmit = async () => {
        setSubmitting(true);
        try {
            const success = await submitExam();
            if (success) {
                navigate('/thank-you');
            }
        } catch (err) {
            console.error('Submission failed:', err);
        } finally {
            setSubmitting(false);
            setShowSubmitModal(false);
        }
    };

    // Anti-cheat: Tab switching and Focus loss detection
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && hasStarted && !isLocked) {
                setTabSwitchCount(prev => prev + 1);
            }
        };

        const handleBlur = () => {
            if (hasStarted && !isLocked) {
                setTabSwitchCount(prev => prev + 1);
            }
        };

        // Prevent right click
        const handleContextMenu = (e) => e.preventDefault();

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [hasStarted, isLocked]);

    // Prevent navigation during exam
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasStarted && !isSubmitted && !isLocked) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasStarted, isSubmitted, isLocked]);

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-exam flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-text-body font-bold animate-pulse">Initializing Secure Container...</p>
                </div>
            </div>
        );
    }

    if (configError) {
        return (
            <div className="min-h-screen bg-bg-exam flex items-center justify-center p-4">
                <div className="card-exam max-w-md w-full p-8 text-center border-t-4 border-error-red">
                    <AlertTriangle className="w-16 h-16 text-error-red mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-text-dark mb-2">Configuration Error</h2>
                    <p className="text-text-body mb-6">{configError}</p>
                    <button onClick={() => window.location.reload()} className="btn-primary w-full py-3">Try Again</button>
                </div>
            </div>
        );
    }

    if (isBefore) {
        return (
            <div className="min-h-screen bg-bg-exam flex items-center justify-center p-4">
                <div className="card-exam max-w-md w-full p-8 text-center border-t-4 border-brand-purple">
                    <Clock className="w-16 h-16 text-brand-purple mx-auto mb-4 animate-bounce" />
                    <h2 className="text-2xl font-bold text-text-dark mb-2">Exam Not Started</h2>
                    <p className="text-text-body mb-6">The examination session has not started yet. Please check the scheduled time.</p>
                    <button onClick={() => navigate('/')} className="btn-outline w-full py-3">Back to Home</button>
                </div>
            </div>
        );
    }

    if (isAfter) {
        return (
            <div className="min-h-screen bg-bg-exam flex items-center justify-center p-4">
                <div className="card-exam max-w-md w-full p-8 text-center border-t-4 border-error-red">
                    <AlertTriangle className="w-16 h-16 text-error-red mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-text-dark mb-2">Exam Ended</h2>
                    <p className="text-text-body mb-6">The examination window for this session has closed.</p>
                    <button onClick={() => navigate('/')} className="btn-outline w-full py-3">Back to Home</button>
                </div>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="min-h-screen bg-bg-exam flex items-center justify-center p-4">
                <div className="card-exam max-w-md w-full p-8 text-center border-t-4 border-brand-gold">
                    <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-xl font-bold text-text-dark mb-2">Loading Questions...</h2>
                    <p className="text-text-body mb-4">Establishing secure connection to question bank.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-exam select-none flex flex-col font-body">
            {/* Anti-Cheat Alert Overlay */}
            <AntiCheatAlert count={tabSwitchCount} />

            {/* Top Bar */}
            <div className="bg-white shadow-md sticky top-0 z-40 border-b border-gray-200 safe-top">
                <div className="container mx-auto px-4 py-3 md:py-4">
                    <div className="flex items-center justify-between">
                        
                        {/* Mobile Menu Toggle & Title */}
                        <div className="flex items-center gap-3 md:gap-4">
                            <button
                                onClick={() => setIsNavOpen(true)}
                                className="lg:hidden p-2 rounded-lg bg-purple-50 text-brand-purple hover:bg-purple-100 transition-colors focus:ring-2 focus:ring-brand-purple focus:outline-none"
                                aria-label="Open Navigation"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            
                            <div className="hidden md:flex bg-brand-purple text-white w-10 h-10 rounded-lg items-center justify-center font-bold text-xl uppercase tracking-tighter shadow-sm flex-shrink-0">
                                Sc
                            </div>
                            
                            <div className="flex flex-col justify-center">
                                <h1 className="text-lg md:text-xl font-heading font-bold text-brand-purple leading-tight truncate max-w-[150px] sm:max-w-xs md:max-w-none">
                                    SLET Exam
                                </h1>
                                <p className="hidden md:block text-xs text-text-body font-semibold uppercase tracking-wider truncate">
                                    {sessionData?.fullName}
                                </p>
                            </div>
                        </div>

                        {/* Status & Timer */}
                        <div className="flex items-center gap-4 md:gap-8">
                            
                            {/* Auto-save Indicator Desktop + Mobile Info */}
                            <div className="flex items-center gap-2">
                                {isSyncing ? (
                                    <div className="flex items-center gap-1 mt-1 text-brand-purple text-xs md:text-sm font-bold bg-purple-50 px-2 py-1 rounded-full border border-purple-100 shadow-inner">
                                        <div className="w-3 h-3 border-2 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
                                        <span className="hidden sm:inline">Syncing</span>
                                    </div>
                                ) : saving ? (
                                    <div className="flex items-center gap-1 mt-1 text-success-green text-xs md:text-sm font-bold bg-green-50 px-2 py-1 rounded-full border border-green-100 shadow-inner">
                                        <Save className="w-3 h-3 animate-bounce" />
                                        <span className="hidden sm:inline">Saving</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 mt-1 text-gray-500 text-xs md:text-sm font-bold bg-gray-50 px-2 py-1 rounded-full border border-gray-100 shadow-inner">
                                        <CheckCircle className="w-3 h-3 text-success-green" />
                                        <span className="hidden sm:inline">Saved</span>
                                    </div>
                                )}
                            </div>

                            {/* Timer Block */}
                            <div className="flex flex-col items-end">
                                <div className={`flex items-center gap-2 bg-gray-50 px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-gray-200 shadow-sm min-w-[90px] md:min-w-[120px] justify-center transition-colors ${isLocked ? 'opacity-50' : ''} ${remainingTime <= 60 ? 'bg-red-50 border-red-200' : ''}`}>
                                    <Clock className={`w-4 h-4 md:w-5 md:h-5 ${remainingTime <= 60 ? 'text-error-red animate-pulse' : 'text-brand-purple'}`} />
                                    <span className={`text-lg md:text-xl font-mono tabular-nums leading-none ${getTimerClass()}`}>
                                        {isLocked ? '00:00' : formatTime(remainingTime)}
                                    </span>
                                </div>
                                {remainingTime > 0 && remainingTime <= 300 && !isLocked && (
                                    <span className="absolute top-16 right-4 sm:static sm:top-auto sm:right-auto text-[10px] sm:text-xs font-bold text-white sm:text-error-red bg-error-red sm:bg-transparent px-3 py-1 sm:p-0 rounded-full sm:rounded-none mt-2 sm:mt-1 animate-pulse uppercase tracking-tight shadow-md sm:shadow-none z-50">
                                        End in {Math.ceil(remainingTime / 60)}m
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Nav Overlay */}
            {isNavOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[90] lg:hidden transition-opacity duration-300"
                    onClick={() => setIsNavOpen(false)}
                ></div>
            )}

            {/* Main Content Area */}
            <div className={`container mx-auto px-2 sm:px-4 py-6 md:py-8 flex-1 flex flex-col relative ${isLocked ? 'pointer-events-none grayscale-[0.5]' : ''}`}>
                <div className="grid lg:grid-cols-4 gap-6 flex-1 items-start">
                    
                    {/* Question Area (Left / Main) */}
                    <div className="lg:col-span-3 h-full flex flex-col max-w-4xl mx-auto w-full">
                        
                        {/* Mobile Progress Bar (Visible only on small screens) */}
                        <div className="lg:hidden w-full bg-white p-3 rounded-t-xl border-t border-x border-gray-200 flex flex-col gap-2">
                             <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase">
                                 <span>Q {currentQuestionIndex + 1} of {questions.length}</span>
                                 <span className="text-brand-purple">{Math.round((answeredCount/questions.length)*100)}% Done</span>
                             </div>
                             <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                 <div 
                                    className="h-full bg-success-green transition-all duration-300"
                                    style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                                 ></div>
                             </div>
                        </div>

                        <div className="card-exam bg-white shadow-xl rounded-b-xl lg:rounded-xl overflow-hidden border-b-4 border-brand-purple flex-1 flex flex-col p-0 sm:p-0 md:p-0">
                            
                            {/* Section Header */}
                            <div className="bg-gradient-to-r from-purple-50 to-white px-4 py-4 md:px-8 md:py-6 border-b border-purple-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 relative overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/5 rounded-full -mr-10 -mt-10 pointer-events-none"></div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-5 relative z-10 w-full">
                                    <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-4">
                                        <span className="bg-brand-purple text-white px-3 md:px-5 py-1.5 md:py-2 text-[10px] md:text-sm font-black uppercase tracking-[0.1em] shadow-md flex-shrink-0 relative overflow-hidden group">
                                            <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500 rounded"></span>
                                            Section {currentQuestion.section}
                                        </span>
                                        <div className="hidden lg:block bg-purple-100 text-purple-800 px-4 py-1.5 rounded-lg border border-purple-200 text-sm font-bold shadow-sm whitespace-nowrap">
                                            Q {currentQuestionIndex + 1} / {questions.length}
                                        </div>
                                    </div>
                                    <div className="h-6 w-px bg-purple-200 hidden sm:block"></div>
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-text-dark tracking-tight leading-snug">
                                        {
                                            currentQuestion.section === 'GK' ? 'Current Affairs & General Knowledge' :
                                                currentQuestion.section === 'LOGICAL' ? 'Logical Reasoning' :
                                                    currentQuestion.section === 'QUANT' ? 'Quantitative Aptitude' :
                                                        currentQuestion.section === 'LEGAL' ? 'Legal Reading Comprehension' :
                                                            currentQuestion.section === 'RC' ? 'Reading Comprehension' : 'Examination'
                                        }
                                    </h2>
                                </div>
                            </div>

                            {/* Question Content */}
                            <div className="p-4 sm:p-6 md:p-8 flex-1 flex flex-col">
                                {/* Passage (if RC or Legal) */}
                                {currentQuestion.passageText && (
                                    <div className="bg-white p-4 md:p-6 rounded-xl mb-6 md:mb-8 border border-gray-200 shadow-inner max-h-[250px] md:max-h-[350px] overflow-y-auto relative custom-scrollbar">
                                        <div className="sticky top-0 bg-white pb-2 text-brand-purple text-xs font-bold uppercase tracking-widest border-b border-gray-200 mb-3 flex items-center gap-2 z-10">
                                            <FileText className="w-4 h-4"/>
                                            Reference Passage
                                        </div>
                                        <p className="text-gray-800 leading-[1.8] whitespace-pre-wrap font-serif text-base md:text-[17px]">
                                            {currentQuestion.passageText}
                                        </p>
                                    </div>
                                )}

                                {/* Question Text */}
                                <div className="mb-6 md:mb-8">
                                    <p className="text-lg md:text-[22px] text-gray-900 leading-[1.6] font-semibold">
                                        {currentQuestion.questionText}
                                    </p>
                                </div>

                                {/* Options List */}
                                <div className="space-y-3 md:space-y-4">
                                    {currentQuestion.options.map((option, index) => {
                                        const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                                        const isSelected = answers[currentQuestion._id] === optionLetter;

                                        return (
                                            <label
                                                key={index}
                                                className={`
                                                    group flex items-start sm:items-center p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 min-h-[60px] cursor-pointer touch-manipulation
                                                    ${isLocked ? 'pointer-events-none' : 'hover:-translate-y-0.5 hover:shadow-sm'}
                                                    ${isSelected
                                                        ? 'bg-purple-50/80 border-brand-purple shadow-[0_0_0_1px_#4B2E83]'
                                                        : 'bg-white border-gray-100 hover:border-purple-300 hover:bg-gray-50/50'}
                                                `}
                                                onClick={(e) => {
                                                   // Allow clicking anywhere inside the label 
                                                   e.stopPropagation();
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${currentQuestion._id}`}
                                                    value={optionLetter}
                                                    checked={isSelected}
                                                    onChange={() => !isLocked && handleAnswerSelect(optionLetter)}
                                                    disabled={isLocked}
                                                    className="sr-only"
                                                />
                                                <div className={`
                                                    flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold mr-3 sm:mr-4 transition-all duration-300 mt-0.5 sm:mt-0 shadow-sm
                                                    ${isSelected 
                                                        ? 'bg-brand-purple text-white shadow-brand-purple/40 scale-105' 
                                                        : 'bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-brand-purple'}
                                                `}>
                                                    {optionLetter}
                                                </div>
                                                <span className={`text-base md:text-lg transition-colors leading-relaxed pt-1 sm:pt-0 ${isSelected ? 'text-gray-900 font-bold' : 'text-gray-700 font-medium'}`}>
                                                    {option}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>

                                {/* Flexible Space filler */}
                                <div className="flex-1 min-h-[30px] md:min-h-[50px]"></div>

                                {/* Navigation Footer */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-8 pt-6 md:mt-10 md:pt-8 border-t border-gray-100">
                                    <button
                                        onClick={previousQuestion}
                                        disabled={currentQuestionIndex === 0 || isLocked}
                                        className="btn-outline flex items-center justify-center gap-2 py-3 md:py-4 px-4 sm:px-6 w-full sm:w-auto disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-50 text-brand-purple font-bold tracking-wide rounded-xl"
                                    >
                                        <span className="text-xl leading-none -mt-0.5 mb-0.5">&larr;</span> Prev
                                    </button>

                                    {/* Desktop Progress Bar */}
                                    <div className="hidden lg:flex flex-col items-center w-64">
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2 border border-gray-200">
                                            <div
                                                className="h-full bg-success-green transition-all duration-500 shadow-[0_0_10px_rgba(46,125,50,0.5)]"
                                                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            {answeredCount} of {questions.length} Answered
                                        </span>
                                    </div>

                                    {currentQuestionIndex < questions.length - 1 ? (
                                        <button
                                            onClick={nextQuestion}
                                            disabled={isLocked}
                                            className="relative inline-flex items-center justify-center min-h-[56px] px-8 overflow-hidden font-bold text-white bg-brand-purple rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 text-base sm:text-lg w-full sm:w-auto mt-2 sm:mt-0"
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-2 w-full">
                                                Next Question 
                                                <span className="text-xl leading-none -mt-0.5 mb-0.5">&rarr;</span>
                                            </span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSubmitClick}
                                            disabled={isLocked}
                                            className="relative inline-flex items-center justify-center min-h-[56px] px-8 overflow-hidden font-bold text-white bg-success-green hover:bg-green-700 rounded-xl shadow-[0_0_15px_rgba(46,125,50,0.4)] transition-all duration-300 transform hover:-translate-y-1 active:scale-95 text-base sm:text-lg w-full sm:w-auto mt-2 sm:mt-0"
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-2 w-full">
                                                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                                Finish Exam
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Question Nav Drawer (Responsive) */}
                    <div className={`
                        fixed lg:static top-0 right-0 h-full w-[85vw] max-w-[360px] lg:w-auto lg:h-auto z-[100] lg:z-auto bg-gray-50 lg:bg-transparent shadow-2xl lg:shadow-none transform transition-transform duration-300 ease-in-out lg:transform-none lg:col-span-1 overflow-hidden flex flex-col
                        ${isNavOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                    `}>
                        {/* Drawer Header (Mobile Only) */}
                        <div className="flex items-center justify-between p-5 bg-white border-b border-gray-200 lg:hidden safe-top">
                            <h3 className="font-extrabold text-brand-purple text-sm uppercase tracking-widest flex items-center gap-2">
                                <Menu className="w-5 h-5"/>
                                Navigation
                            </h3>
                            <button 
                                onClick={() => setIsNavOpen(false)}
                                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-error-red transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-error-red"
                                aria-label="Close Navigation"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto px-4 py-6 lg:p-0 custom-scrollbar pb-24 lg:pb-0">
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-6 lg:sticky lg:top-24">
                                <h3 className="hidden lg:flex font-extrabold text-brand-purple text-xs uppercase tracking-[0.2em] mb-6 items-center gap-2 border-b border-purple-50 pb-3">
                                    <div className="w-2 h-2 bg-brand-purple rounded-full"></div>
                                    Question Map
                                </h3>

                                <div className="grid grid-cols-5 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 mb-8">
                                    {questions.map((q, index) => {
                                        const isAnswered = answers[q._id];
                                        const isCurrent = index === currentQuestionIndex;

                                        return (
                                            <button
                                                key={q._id}
                                                disabled={isLocked}
                                                onClick={() => {
                                                    goToQuestion(index);
                                                    if(window.innerWidth < 1024) setIsNavOpen(false); // Map breakpoint lg
                                                }}
                                                className={`
                                                    aspect-square rounded-xl font-bold text-sm sm:text-base flex items-center justify-center transition-all duration-200 relative transform active:scale-95 touch-manipulation
                                                    ${isCurrent
                                                        ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/40 ring-2 ring-brand-purple ring-offset-2 z-10'
                                                        : isAnswered
                                                            ? 'bg-green-50 text-success-green border border-green-200 hover:bg-green-100 hover:border-green-300'
                                                            : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                                                    }
                                                    ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                                `}
                                            >
                                                {index + 1}
                                                
                                                {/* Checkmark indicator */}
                                                {(isAnswered && !isCurrent) && (
                                                    <div className="absolute -top-1 -right-1 bg-white rounded-full p-px shadow-sm">
                                                        <CheckCircle className="w-3 h-3 text-success-green fill-current" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Legend */}
                                <div className="space-y-3 pt-6 border-t border-gray-100 bg-gray-50/50 p-4 rounded-xl">
                                    <div className="flex items-center gap-3 text-xs font-bold text-gray-600 uppercase tracking-wide">
                                        <div className="w-5 h-5 bg-green-50 border border-green-200 rounded-md flex items-center justify-center relative">
                                            <div className="absolute -top-1 -right-1 bg-white rounded-full p-px"><CheckCircle className="w-2 h-2 text-success-green fill-current" /></div>
                                        </div>
                                        <span>Answered</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-bold text-gray-600 uppercase tracking-wide">
                                        <div className="w-5 h-5 bg-gray-50 border border-gray-200 rounded-md"></div>
                                        <span>Not Answered</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-bold text-gray-600 uppercase tracking-wide">
                                        <div className="w-5 h-5 bg-brand-purple rounded-md shadow-[0_0_0_2px_white,0_0_0_4px_#4B2E83]"></div>
                                        <span>Current</span>
                                    </div>
                                </div>

                                {/* Final Submit Trigger inside Drawer */}
                                {currentQuestionIndex === questions.length - 1 && (
                                    <button
                                        onClick={() => {
                                           if(window.innerWidth < 1024) setIsNavOpen(false);
                                           handleSubmitClick(); 
                                        }}
                                        disabled={isLocked}
                                        className="w-full relative overflow-hidden bg-gradient-to-r from-success-green to-green-700 py-4 mt-6 flex items-center justify-center gap-2 rounded-xl shadow-lg text-white font-bold text-sm uppercase tracking-widest disabled:opacity-50 transition-transform active:scale-95"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Submit Exam
                                    </button>
                                )}
                                
                                <div className="mt-4 text-center">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                                        <Save className="w-3 h-3" /> Auto-save active
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Auto-Submit Full Screen Overlay */}
            {isSubmitted && !showSubmitModal && (
                <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-[200] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                    <div className="relative mb-8">
                       <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
                       <div className="w-20 h-20 border-4 border-brand-purple border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                       <div className="absolute inset-0 flex items-center justify-center">
                           <Clock className="w-8 h-8 text-brand-purple animate-pulse" />
                       </div>
                    </div>
                    <h2 className="text-3xl font-heading font-extrabold text-brand-purple mb-3 shadow-sm rounded-lg">Time Expired!</h2>
                    <p className="text-text-body text-lg font-medium px-4 max-w-sm mx-auto">Your examination is being automatically finalized. Please do not close the browser.</p>
                </div>
            )}

            {/* Submit Confirmation Modal */}
            <ConfirmationModal
                isOpen={showSubmitModal}
                onClose={() => setShowSubmitModal(false)}
                onConfirm={confirmSubmit}
                loading={submitting}
                title="Final Submission"
                message={`You have answered ${answeredCount} out of ${questions.length} questions.\n\nAre you sure you want to finish the exam? This action cannot be undone.`}
                confirmText="Yes, Complete Exam"
                cancelText="Return to Assessment"
                icon={AlertTriangle}
                variant="warning"
            />

            {/* Rules & Instructions Modal */}
            <InstructionsModal
                isOpen={!hasStarted && !loading}
                onAccept={startExam}
            />
        </div>
    );
};

export default ExamPage;
