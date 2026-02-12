import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getQuestions, saveAnswer as saveAnswerAPI, submitExam as submitExamAPI } from '../api/examApi';

const ExamContext = createContext();

export const useExam = () => {
    const context = useContext(ExamContext);
    if (!context) {
        throw new Error('useExam must be used within ExamProvider');
    }
    return context;
};

export const ExamProvider = ({ children }) => {
    const [sessionData, setSessionData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [remainingTime, setRemainingTime] = useState(0);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Load session from localStorage on mount
    useEffect(() => {
        const savedSession = localStorage.getItem('examSession');
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                setSessionData(session);

                // Calculate remaining time
                const endTime = new Date(session.endTime);
                const now = new Date();
                const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
                setRemainingTime(remaining);
            } catch (err) {
                console.error('Error loading session:', err);
                localStorage.removeItem('examSession');
            }
        }
    }, []);

    // Timer countdown
    useEffect(() => {
        if (remainingTime <= 0) return;

        const timer = setInterval(() => {
            setRemainingTime((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [remainingTime]);

    // Initialize exam
    const initializeExam = useCallback(async (session) => {
        try {
            setLoading(true);
            setSessionData(session);
            localStorage.setItem('examSession', JSON.stringify(session));

            // Fetch questions
            const response = await getQuestions();
            setQuestions(response.data.questions);

            // Calculate remaining time
            const endTime = new Date(session.endTime);
            const now = new Date();
            const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
            setRemainingTime(remaining);

            setLoading(false);
        } catch (err) {
            setError(err.message || 'Failed to initialize exam');
            setLoading(false);
        }
    }, []);

    // Save answer with debouncing
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
    }, [sessionData]);

    // Submit exam
    const submitExam = useCallback(async () => {
        if (!sessionData) return;

        try {
            setLoading(true);
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
    }, [sessionData]);

    // Auto-submit when time expires
    const handleAutoSubmit = useCallback(async () => {
        if (!sessionData) return;

        try {
            await submitExamAPI(sessionData.sessionId);
            localStorage.removeItem('examSession');
            window.location.href = '/thank-you';
        } catch (err) {
            console.error('Auto-submit error:', err);
        }
    }, [sessionData]);

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
        loading,
        saving,
        error,
        answeredCount,
        initializeExam,
        saveAnswer,
        submitExam,
        goToQuestion,
        nextQuestion,
        previousQuestion,
    };

    return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
};
