import axios from 'axios';

const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
console.log('[Axios] Using baseURL:', baseURL); // Debug log

const instance = axios.create({
  baseURL,
  withCredentials: false,
});

export default instance; 