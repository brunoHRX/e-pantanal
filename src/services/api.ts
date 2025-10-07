import { API_BASE, headers } from "@/utils/constants";

export async function ValidadeBearer(): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/api/Validate`, { headers: headers() });
        if (!res.ok) {
            return false
        }
    } catch (error) {
        console.error("Erro ao validar token:", error);
        return false
    } finally {
        return true
    }
}