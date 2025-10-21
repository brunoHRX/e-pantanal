import { API_BASE, headers } from "@/utils/constants";

export async function ValidadeBearer(): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/api/Validate`, { headers: headers() });
        return res.ok
    } catch (error) {
        console.error("Erro ao validar token:", error);
        return false
    }
}