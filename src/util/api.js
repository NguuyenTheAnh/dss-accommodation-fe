import axios from './axios.customize';

// ==========================================
// AUTH APIs
// ==========================================

/**
 * Admin login
 * @param {Object} credentials - { username, password }
 */
const adminLoginApi = (credentials) => {
    const URL_API = "/api/auth/login";
    return axios.post(URL_API, { email: credentials.username, password: credentials.password });
}

/**
 * Register new landlord account
 * @param {Object} userData - { email, password, fullName, phoneNumber }
 */
const registerApi = (userData) => {
    const URL_API = "/api/auth/register";
    return axios.post(URL_API, userData);
}

// ==========================================
// ROOM APIs - Admin/Management
// ==========================================

/**
 * Get all rooms with pagination (Admin)
 * @param {number} pageNumber - 0-based
 * @param {number} pageSize 
 */
const getAllRoomsApi = (pageNumber = 0, pageSize = 20) => {
    const URL_API = "/api/rooms/all";
    return axios.post(URL_API, { pageNumber, pageSize });
}

/**
 * Get room detail by ID
 * @param {number} roomId 
 */
const getRoomDetailApi = (roomId) => {
    const URL_API = "/api/rooms/detail";
    return axios.post(URL_API, { id: roomId });
}

/**
 * Create new room
 * @param {object} roomData - { surveyAnswers, roomNotCoverImageIds, roomCoverImageId, landlordUserId, title, description, address, latitude, longitude, priceVnd, areaSqm, roomType, status, areaTypeId }
 */
const createRoomApi = (roomData) => {
    const URL_API = "/api/rooms/create";
    return axios.post(URL_API, roomData);
}

/**
 * Update existing room
 * @param {object} roomData - { id, surveyAnswers, roomNotCoverImageIds, roomCoverImageId, landlordUserId, title, description, address, latitude, longitude, priceVnd, areaSqm, roomType, status, areaTypeId }
 */
const updateRoomApi = (roomData) => {
    const URL_API = "/api/rooms/update";
    return axios.post(URL_API, roomData);
}

/**
 * Delete rooms
 * @param {number[]} ids 
 */
const deleteRoomsApi = (ids) => {
    const URL_API = "/api/rooms/delete";
    return axios.post(URL_API, { ids });
}

// ==========================================
// AREA TYPE APIs
// ==========================================

/**
 * Get all area types
 */
const getAllAreaTypesApi = () => {
    const URL_API = "/area-types/all";
    return axios.post(URL_API, {});
}

// ==========================================
// SCHOOL APIs
// ==========================================

/**
 * Get all schools
 * @param {string} name - optional search keyword
 */
const getAllSchoolsApi = (name = "") => {
    const URL_API = "/schools/all";
    return axios.post(URL_API, { name });
}

// ==========================================
// SURVEY APIs
// ==========================================

/**
 * Get all surveys
 */
const getAllSurveysApi = () => {
    const URL_API = "/surveys/all";
    return axios.post(URL_API, {});
}

// ==========================================
// SURVEY QUESTION APIs
// ==========================================

/**
 * Get all questions of a survey
 * @param {number} surveyId 
 */
const getAllSurveyQuestionsApi = (surveyId) => {
    const URL_API = "/survey-questions/all";
    return axios.post(URL_API, { surveyId });
}

/**
 * Create survey question
 * @param {object} data - { surveyId, questionText }
 */
const createSurveyQuestionApi = (data) => {
    const URL_API = "/survey-questions/create";
    return axios.post(URL_API, data);
}

/**
 * Update survey question
 * @param {object} data - { id, surveyId, questionText, questionOrder }
 */
const updateSurveyQuestionApi = (data) => {
    const URL_API = "/survey-questions/update";
    return axios.post(URL_API, data);
}

/**
 * Delete survey questions
 * @param {number[]} ids 
 */
const deleteSurveyQuestionsApi = (ids) => {
    const URL_API = "/survey-questions/delete";
    return axios.post(URL_API, { ids });
}

/**
 * Reorder survey questions (for drag & drop)
 * @param {object} data - { surveyId, orders: [{id, questionOrder}] }
 */
const reorderSurveyQuestionsApi = (data) => {
    const URL_API = "/survey-questions/reorder";
    return axios.post(URL_API, data);
}

// ==========================================
// FILE APIs
// ==========================================

/**
 * Upload files
 * @param {FormData} formData - with 'files' field
 * @returns {Promise} Response format: { code: "00", message: null, data: [{id: Long, url: String, isDeleted: Boolean}] }
 * BE returns AttachFile entity: { id, url, isDeleted }
 */
const uploadFilesApi = (formData) => {
    const URL_API = "/api/files/upload";
    return axios.post(URL_API, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

// ==========================================
// PUBLIC APIs - For Students (TODO: implement when backend ready)
// ==========================================

/**
 * Search rooms with filters (Public)
 * @param {object} filter - { areaTypeId, roomType, maxPriceVnd, minAreaSqm }
 * @param {number} pageNumber 
 * @param {number} pageSize 
 */
const searchRoomsApi = (filter = {}, pageNumber = 0, pageSize = 10) => {
    const URL_API = "/api/rooms/all"; // TODO: Backend cần implement
    return axios.post(URL_API, { pageNumber, pageSize, filter });
}

/**
 * Get featured rooms (Public)
 */
const getFeaturedRoomsApi = () => {
    const URL_API = "/api/rooms/featured";
    return axios.post(URL_API, {});
}

/**
 * DSS Decision Table
 * @param {Array<Array<number>>} initMatrix - 2D array of normalized values
 * @param {object} filter - same filter object the user applied in search
 */
const getDecisionTableApi = (initMatrix = [], filter = {}) => {
    const URL_API = "/dss/decision-table";
    return axios.post(URL_API, { initMatrix, filter });
}

/**
 * Normalize decision table (R matrix)
 * @param {Array<Array<number>>} xMatrix
 */
const getNormalizeDecisionTableApi = (xMatrix = []) => {
    const URL_API = "/dss/normalize-decision-table";
    return axios.post(URL_API, { xMatrix });
}

/**
 * Weight calculation (V matrix)
 * @param {number[]} weights
 * @param {Array<Array<number>>} rMatrix
 */
const getWeightCalculateApi = (weights = [], rMatrix = []) => {
    const URL_API = "/dss/weight-caculate";
    return axios.post(URL_API, { weights, rMatrix });
}

const getRoomRouteMapApi = (schoolId, roomId) => {
    const URL_API = "/rooms/view-map";
    return axios.post(URL_API, { schoolId, roomId });
}

/**
 * Get public room detail (Public)
 * @param {number} roomId 
 */
const getPublicRoomDetailApi = (roomId) => {
    const URL_API = "/api/rooms/detail"; // TODO: Backend cần implement
    return axios.post(URL_API, { id: roomId });
}

// ==========================================
// LEGACY APIs (keep for compatibility)
// ==========================================

const createUserApi = (name, email, password) => {
    const URL_API = "/v1/api/register";
    return axios.post(URL_API, { name, email, password });
}

const loginApi = (email, password) => {
    const URL_API = "/v1/api/login";
    return axios.post(URL_API, { email, password });
}

const getUserApi = () => {
    const URL_API = "/v1/api/user";
    return axios.post(URL_API, {});
}

export {
    // Auth
    adminLoginApi,
    registerApi,

    // Room Management
    getAllRoomsApi,
    getRoomDetailApi,
    createRoomApi,
    updateRoomApi,
    deleteRoomsApi,

    // Area Type
    getAllAreaTypesApi,
    // Schools
    getAllSchoolsApi,

    // Survey
    getAllSurveysApi,

    // Survey Question
    getAllSurveyQuestionsApi,
    createSurveyQuestionApi,
    updateSurveyQuestionApi,
    deleteSurveyQuestionsApi,
    reorderSurveyQuestionsApi,

    // File
    uploadFilesApi,

    // Public - Student
    searchRoomsApi,
    getFeaturedRoomsApi,
    getPublicRoomDetailApi,
    getRoomRouteMapApi,
    getDecisionTableApi,
    getNormalizeDecisionTableApi,
    getWeightCalculateApi,

    // Legacy
    createUserApi,
    loginApi,
    getUserApi
}
