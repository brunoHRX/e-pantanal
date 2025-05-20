export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  // acrescente aqui outros campos que sua API retorne, ex: expiresIn?: number
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://www.apiepantanal.kinghost.net';

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/Usuarios/Login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept':       'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  if (!res.ok) {
    // 401 virá aqui: text === "Usuário ou senha inválidos."
    throw new Error(text || `Erro ${res.status}`);
  }

  // se a sua API retornar JSON com { token: '...' }
  try {
    return JSON.parse(text) as LoginResponse;
  } catch {
    throw new Error('Resposta inesperada do servidor');
  }
}
