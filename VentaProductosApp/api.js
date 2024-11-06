import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.4:3000', // Reemplaza esto con la IP de tu computadora si pruebas desde un dispositivo físico
});

export default api;
