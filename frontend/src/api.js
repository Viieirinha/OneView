export const RENDER_URL = "https://oneview-m7x6.onrender.com"; 

export const baseURL = window.location.hostname.includes('localhost')
  ? 'http://127.0.0.1:8000'
  : RENDER_URL;