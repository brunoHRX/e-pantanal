export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://apiepantanal.com.br';
// export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5132';

export const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
})