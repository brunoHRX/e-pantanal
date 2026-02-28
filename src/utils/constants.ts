const isDev = process.env.NODE_ENV === 'development';
export const API_BASE = isDev ? 'http://localhost:5132' : (process.env.NEXT_PUBLIC_API_URL ?? 'https://apiepantanal.com.br');
export const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
})