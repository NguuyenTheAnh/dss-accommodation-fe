import axios from './axios.customize';

const createUserApi = (name, email, password) => {
    const URL_API = "/v1/api/register";
    const data = {
        name, email, password
    }

    return axios.post(URL_API, data)
}

const loginApi = (email, password) => {
    const URL_API = "/v1/api/login";
    const data = {
        email, password
    }

    return axios.post(URL_API, data)
}

const getUserApi = () => {
    const URL_API = "/v1/api/user";
    return axios.get(URL_API)
}

const getRoomDetailApi = (roomId) => {
    const URL_API = `/v1/api/rooms/${roomId}`;
    return axios.get(URL_API)
}

const getRoomsApi = (filters, page = 1, pageSize = 10) => {
    const URL_API = "/v1/api/rooms";
    return axios.get(URL_API, {
        params: {
            ...filters,
            page,
            pageSize
        }
    })
}

export {
    createUserApi, loginApi, getUserApi,
    getRoomDetailApi, getRoomsApi
}