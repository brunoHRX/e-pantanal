const isDev = process.env.NODE_ENV === 'development';
export const API_BASE = isDev ? 'http://localhost:5132' : (process.env.NEXT_PUBLIC_API_URL ?? 'https://api.apiepantanal.com.br');
export const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
})

// IDs de especialidade
export const ESPECIALIDADE_ADMIN_ID = 2
export const ESPECIALIDADE_ODONTO_ID = 4

// IDs de usuário reservados
export const USUARIO_ADMIN_ID = 1