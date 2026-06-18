const BASE_URL = import.meta.env.VITE_API_URL || 'https://subarctic-referable-strainer.ngrok-free.dev/api';

const getHeaders = (body) => {
    const token = localStorage.getItem('token');
    const headers = {};

    // Only set JSON content type if we're not sending FormData
    if (!(body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Add ngrok header to bypass warning page
    headers['ngrok-skip-browser-warning'] = 'true';

    return headers;
};

const handleResponse = async (response, url) => {
    const data = await response.json();
    console.log(`[API Response] ${response.status} ${url}:`, data);

    if (!response.ok) {
        const error = new Error(data.message || 'Something went wrong');
        if (data.deviceMismatch) error.deviceMismatch = true;
        throw error;
    }
    return data;
};

const request = async (url, options = {}) => {
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

    const mergedHeaders = {
        ...getHeaders(options.body),
        ...options.headers
    };

    // Safe logging for FormData
    const logBody = options.body instanceof FormData ? '[FormData]' : (options.body ? JSON.parse(options.body) : '');
    
    if (options.method === 'POST') {
        console.log(`[API POST Request] ${fullUrl}`, {
            headers: mergedHeaders,
            body: logBody
        });
    } else {
        console.log(`[API Request] ${options.method || 'GET'} ${fullUrl}`, logBody);
    }

    const response = await fetch(fullUrl, {
        ...options,
        headers: mergedHeaders
    });

    return handleResponse(response, fullUrl);
};

const api = {
    auth: {
        login: (credentials) =>
            request('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials),
            }),

        register: (userData) =>
            request('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData),
            }),

        forgotPassword: (data) =>
            request('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        resetPassword: (data) =>
            request('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        requestDeviceChange: (data) =>
            request('/auth/request-device-change', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        getProfile: () =>
            request('/auth/profile'),

        updateProfile: (formData) =>
            request('/auth/profile', {
                method: 'PUT',
                body: formData, // FormData handles its own headers
            }),
    },

    tests: {
        getAll: () =>
            request('/tests'),

        getById: (id) =>
            request(`/tests/${id}`),

        getQuestions: (id) =>
            request(`/tests/${id}/questions`),
    },

    results: {
        submit: (resultData) =>
            request('/results/submit', {
                method: 'POST',
                body: JSON.stringify(resultData),
            }),

        getMyResults: () =>
            request('/results/me'),

        getById: (id) =>
            request(`/results/${id}`),

        getStats: () =>
            request('/results/stats'),

        reportMalpractice: (data) =>
            request('/results/report-malpractice', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
    },

    violations: {
        log: (data) =>
            request('/log-violation', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        get: (userId, testId) =>
            request(`/violations/${userId}/${testId}`),
    },

    resources: {
        getAll: () =>
            request('/resources'),
    },

    admin: {
        getDashboardStats: () =>
            request('/admin/dashboard'),

        // Test Management
        createTest: (testData) =>
            request('/admin/tests', {
                method: 'POST',
                body: JSON.stringify(testData),
            }),
        updateTest: (testId, testData) =>
            request(`/admin/tests/${testId}`, {
                method: 'PUT',
                body: JSON.stringify(testData),
            }),
        getTestDetails: (testId) =>
            request(`/admin/tests/${testId}`),
        addQuestion: (testId, questionData) =>
            request(`/admin/tests/${testId}/questions`, {
                method: 'POST',
                body: JSON.stringify(questionData),
            }),
        deleteTest: (testId) =>
            request(`/admin/tests/${testId}`, {
                method: 'DELETE',
            }),
        updateQuestion: (questionId, questionData) =>
            request(`/admin/questions/${questionId}`, {
                method: 'PUT',
                body: JSON.stringify(questionData),
            }),
        deleteQuestion: (questionId) =>
            request(`/admin/questions/${questionId}`, {
                method: 'DELETE',
            }),

        // Media Management
        uploadMedia: (formData) =>
            request('/admin/upload', {
                method: 'POST',
                body: formData, // FormData handles its own headers
            }),

        // User Approvals
        getPendingApprovals: () =>
            request('/admin/approvals/pending'),

        approveUser: (userId) =>
            request(`/admin/approvals/${userId}/approve`, {
                method: 'POST'
            }),

        // Device Change Approvals
        getDeviceChangeRequests: () =>
            request('/admin/device-change-requests'),
            
        approveDeviceChange: (userId) =>
            request(`/admin/device-change-requests/${userId}/approve`, {
                method: 'POST'
            }),

        // User & Results Monitoring
        getAllUsers: () =>
            request('/admin/users'),
        getAllResults: () =>
            request('/admin/results'),
        getAllSubscriptions: () =>
            request('/admin/subscriptions'),


        // Study Resources
        createResource: (resourceData) =>
            request('/admin/resources', {
                method: 'POST',
                body: JSON.stringify(resourceData),
            }),
        deleteResource: (resourceId) =>
            request(`/admin/resources/${resourceId}`, {
                method: 'DELETE',
            }),
    },

    subscription: {
        getPlans: () => request('/subscription/plans'),
        getHistory: () => request('/subscription/history'),
        cancel: () => request('/subscription/cancel', { method: 'POST' }),
        upgrade: (plan) => request('/subscription/upgrade', { method: 'POST', body: JSON.stringify({ plan }) }),
        createOrder: (plan) => request('/subscription/order', { method: 'POST', body: JSON.stringify({ plan }) }),
        verifyPayment: (data) => request('/subscription/verify', { method: 'POST', body: JSON.stringify(data) }),
    }
};

export default api;
