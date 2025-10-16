import { Consolidado, DashboardTotals, RelatorioFilters } from "@/types/Relatorio"
import { API_BASE, headers } from "@/utils/constants";
const caminho = "Relatorios";
const elemento_singular = "dashboard";
const elemento_plural = "dashboards";

export async function fetchDashboardData(
    filters: RelatorioFilters
): Promise<DashboardTotals> {
    const res = await fetch(`${API_BASE}/api/${caminho}/dashboard`, { method: "POST", headers: headers(), body: JSON.stringify(filters) });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao buscar ${elemento_plural}: ${msg}`);
    }
    return await res.json();
}
export async function fetchConsolidadoData(
    filters: RelatorioFilters
): Promise<Consolidado> {
    const res = await fetch(`${API_BASE}/api/${caminho}/consolidado`, { method: "POST", headers: headers(), body: JSON.stringify(filters) });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao buscar ${elemento_plural}: ${msg}`);
    }
    return await res.json();
}

export type { DashboardTotals, RelatorioFilters }