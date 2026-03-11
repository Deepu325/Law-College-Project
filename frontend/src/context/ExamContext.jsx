import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
    getQuestions, 
    saveAnswer as saveAnswerAPI, 
    submitExam as submitExamAPI,
    getSessionStatus,
    startExam as startExamAPI 
} from '../api/examApi';

const ExamContext = createContext();


export const ExamProvider = ({ children }) => {
    const [sessionData, setSessionData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [remainingTime, setRemainingTime] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState(null);

    const isLocked = isSubmitted || remainingTime <= 0;

    const syncWithServer = useCallback(async () => {
        if (!sessionData || isSyncing) return;
        setIsSyncing(true);
        try {
            const response = await getSessionStatus(sessionData.sessionId);

            if (response.success) {
                setRemainingTime(response.data.remainingTime);
                if (response.data.status === 'submitted') {
                    setIsSubmitted(true);
                    localStorage.removeItem('examSession');
                }
            }
        } catch (err) {
            console.error('Time sync failed:', err);
        } finally {
            setIsSyncing(false);
        }
    }, [sessionData, isSyncing]);

    const handleAutoSubmit = useCallback(async () => {
        if (!sessionData || isSubmitted) return;

        try {
            console.log('Automated submission triggered...');
            setIsSubmitted(true); // Lock immediately
            await submitExamAPI(sessionData.sessionId);
            localStorage.removeItem('examSession');

            // Redirect to results with auto-submit flag
            window.location.href = '/thank-you?auto=true';
        } catch (err) {
            console.error('Auto-submit error:', err);
            // Even if API fails, stay locked and tell user
            window.location.href = '/thank-you?auto=error';
        }
    }, [sessionData, isSubmitted]);

    const startExam = useCallback(async () => {
        if (!sessionData) return;

        try {
            const response = await startExamAPI(sessionData.sessionId);

            if (response.success) {
                // Update local session data with new times from server
                setSessionData(prev => ({
                    ...prev,
                    startTime: response.data.startTime,
                    endTime: response.data.endTime
                }));
                setHasStarted(true);
            }
        } catch (err) {
            console.error('Failed to start exam on server:', err);
            // Fallback: start locally if API fails but we have session
            setHasStarted(true);
        }
    }, [sessionData]);

    const initializeExam = useCallback(async (data) => {
        try {
            setLoading(true);
            setSessionData(data);
            localStorage.setItem('examSession', JSON.stringify(data));

            setRemainingTime(data.remainingTime || 0);

            // If resuming an already started exam
            if (data.status === 'in_progress') {
                setHasStarted(true);
            } else {
                setHasStarted(false);
            }

            // Fetch questions
            const response = await getQuestions();
            if (response.success) {
                setQuestions(response.data.questions);
            }

            // Calculate remaining time
            const endTime = new Date(data.endTime);
            const now = new Date();
            const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
            setRemainingTime(remaining);

            setLoading(false);
        } catch (error) {
            console.error('Initialize exam error:', error);
            setError('Failed to initialize exam');
            setLoading(false);
        }
    }, []);

    const saveAnswer = useCallback(async (questionId, selectedOption) => {
        if (!sessionData) return;

        // Update local state immediately
        setAnswers((prev) => ({
            ...prev,
            [questionId]: selectedOption
        }));

        // Debounced API call
        setSaving(true);
        try {
            await saveAnswerAPI({
                sessionId: sessionData.sessionId,
                questionId,
                selectedOption
            });
            setSaving(false);
        } catch (err) {
            console.error('Error saving answer:', err);
            setSaving(false);

            // Check if time expired
            if (err.data?.timeExpired) {
                handleAutoSubmit();
            }
        }
    }, [sessionData, handleAutoSubmit]);

    const submitExam = useCallback(async () => {
        if (!sessionData || isSubmitted) return;

        try {
            setLoading(true);
            setIsSubmitted(true); // Lock early for better UX
            await submitExamAPI(sessionData.sessionId);

            // Clear session
            localStorage.removeItem('examSession');
            setLoading(false);
            return true;
        } catch (err) {
            setError(err.message || 'Failed to submit exam');
            setLoading(false);
            return false;
        }
    }, [sessionData, isSubmitted]);

    // Load session from localStorage on mount
    useEffect(() => {
        const savedSession = localStorage.getItem('examSession');
        if (savedSession) {
            try {
                setLoading(true);
                const session = JSON.parse(savedSession);
                setSessionData(session);

                // Calculate remaining time
                const endTime = new Date(session.endTime);
                const now = new Date();
                const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
                setRemainingTime(remaining);

                // If resuming an already started exam
                if (session.status === 'in_progress') {
                    setHasStarted(true);
                }

                // Fetch questions immediately on restore
                const fetchQuestions = async () => {
                    try {
                        const response = await getQuestions();
                        if (response.success) {
                            setQuestions(response.data.questions);
                        }
                    } catch (err) {
                        console.error('Initial question fetch failed:', err);
                    } finally {
                        setLoading(false);
                    }
                };
                fetchQuestions();
            } catch (err) {
                console.error('Error loading session:', err);
                localStorage.removeItem('examSession');
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    // Timer countdown with system time drift protection
    useEffect(() => {
        if (!sessionData || isLocked || !hasStarted) return;

        let expectedTime = Date.now() + (remainingTime * 1000);

        const timer = setInterval(() => {
            const now = Date.now();
            const distance = expectedTime - now;
            const seconds = Math.max(0, Math.floor(distance / 1000));

            if (seconds <= 0) {
                clearInterval(timer);
                setRemainingTime(0);
                handleAutoSubmit();
            } else {
                setRemainingTime(seconds);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [sessionData, isLocked, hasStarted, remainingTime, handleAutoSubmit]);

    // Fast-fail auto-submit when session is restored already expired
    useEffect(() => {
        if (sessionData && !isSubmitted && hasStarted && remainingTime === 0) {
            handleAutoSubmit();
        }
    }, [sessionData, isSubmitted, hasStarted, remainingTime, handleAutoSubmit]);

    // Periodic Server Sync (every 60 seconds)
    useEffect(() => {
        if (!sessionData || isLocked || !hasStarted) return;

        const syncInterval = setInterval(syncWithServer, 60000);
        return () => clearInterval(syncInterval);
    }, [sessionData, isLocked, hasStarted]);

    // Sync when tab becomes visible again
    useEffect(() => {
        const handleVisibility = () => {
            if (!document.hidden && sessionData && !isLocked && hasStarted) {
                syncWithServer();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [sessionData, isLocked, hasStarted]);


    // Navigation
    const goToQuestion = useCallback((index) => {
        if (index >= 0 && index < questions.length) {
            setCurrentQuestionIndex(index);
        }
    }, [questions.length]);

    const nextQuestion = useCallback(() => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    }, [currentQuestionIndex, questions.length]);

    const previousQuestion = useCallback(() => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    }, [currentQuestionIndex]);

    // Get current question
    const currentQuestion = questions[currentQuestionIndex] || null;

    // Get answered count
    const answeredCount = Object.keys(answers).length;

    const value = {
        sessionData,
        questions,
        answers,
        currentQuestion,
        currentQuestionIndex,
        remainingTime,
        isSubmitted,
        isLocked,
        hasStarted,
        loading,
        saving,
        isSyncing,
        error,
        answeredCount,
        initializeExam,
        startExam,
        saveAnswer,
        submitExam,
        goToQuestion,
        nextQuestion,
        previousQuestion,
        syncWithServer
    };

    return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
};

export const useExam = () => {
    const context = useContext(ExamContext);
    if (!context) {
        throw new Error('useExam must be used within ExamProvider');
    }
    return context;
};
