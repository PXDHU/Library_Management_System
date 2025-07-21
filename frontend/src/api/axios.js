import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8080', // Spring Boot backend
  withCredentials: false,
});

export default instance; 