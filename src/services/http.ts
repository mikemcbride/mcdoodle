import axios from 'axios'

const http = axios.create({
    baseURL: '/api',
    // send the session cookie with API requests
    withCredentials: true,
})

export default http
