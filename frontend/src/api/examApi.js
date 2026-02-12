import apiClient from './apiClient';

// ============================================
// EXAM APIs
// ============================================

export const registerStudent = async (formData) => {
    const response = await apiClient.post('/register', formData);
    return response.data;
};

export const getQuestions = async () => {
    const response = await apiClient.get('/questions');
    return response.data;
};

export const saveAnswer = async (answerData) => {
    const response = await apiClient.post('/save-answer', answerData);
    return response.data;
};

export const submitExam = async (sessionId) => {
    const response = await apiClient.post('/submit', { sessionId });
    return response.data;
};

export const getSessionStatus = async (sessionId) => {
    const response = await apiClient.get(`/session/${sessionId}`);
    return response.data;
};

// ============================================
// ADMIN APIs
// ============================================

export const adminLogin = async (credentials) => {
    const response = await apiClient.post('/admin/login', credentials);
    return response.data;
};

export const getCandidates = async (params = {}) => {
    const response = await apiClient.get('/admin/candidates', { params });
    return response.data;
};

export const getCandidateDetails = async (sessionId) => {
    const response = await apiClient.get(`/admin/candidate/${sessionId}`);
    return response.data;
};

export const exportCandidates = async () => {
    const response = await apiClient.get('/admin/export', {
        responseType: 'blob'
    });
    return response.data;
};

export const getDashboardStats = async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
};
