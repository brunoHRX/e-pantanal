import { AtendimentoFilas, AtendimentoFluxo } from '@/types/Fluxo'
import { differenceInYears, format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { API_BASE, headers } from "@/utils/constants";

export type BadgeStatus = 'active' | 'pending' | 'expired' | 'atendendo'

export function stripDiacritics(s: string) {
    return s.normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

export function maskCPF(cpf?: string) {
    if (!cpf) return '—'
    const d = cpf.replace(/\D/g, '')
    if (d.length < 11) return cpf
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`
}

export function safeDate(iso?: string) {
    if (!iso) return null
    try {
      const dt = parseISO(iso)
      return isValid(dt) ? dt : null
    } catch {
      return null
    }
}

export function safeDateLabel(iso?: string) {
    const dt = safeDate(iso)
    return dt ? format(dt, 'dd/MM/yyyy', { locale: ptBR }) : '—'
}

export function safeDateTimeLabel(iso?: string) {
    const dt = safeDate(iso);
    return dt ? format(dt, "dd/MM/yyyy HH:mm", { locale: ptBR }) : "—";
}

export function safeTimeLabel(iso?: string) {
    const dt = safeDate(iso);
    return dt ? format(dt, "HH:mm", { locale: ptBR }) : "—";
}

export function ageFromISO(iso?: string) {
    const dt = safeDate(iso)
    if (!dt) return null
    const age = differenceInYears(new Date(), dt)
    return age >= 0 ? age : null
}

export function waitingTime(iso?: string) {
    const dt = safeDate(iso);
    if (!dt) return "—";

    const now = new Date();
    const diffMs = now.getTime() - dt.getTime();

    // converte em minutos
    const diffMin = Math.floor(diffMs / 1000 / 60);
    const hours = Math.floor(diffMin / 60);
    const minutes = diffMin % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
}

export function badgeClass(status: BadgeStatus): string {
    switch (status) {
        case 'active':
            return 'bg-black text-white border-black hover:bg-black'
        case 'expired':
            return 'bg-zinc-100 text-zinc-500 border-zinc-200 opacity-70'
        case 'atendendo':
            return 'border border-green-800 text-green-800 bg-green-100'
        case 'pending':
        default:
            return 'border border-zinc-500 text-zinc-700 bg-transparent'
    }
}

export function computeFilaStatus(
    at: AtendimentoFluxo,
    f: AtendimentoFilas
  ): BadgeStatus {
    let response: BadgeStatus = 'pending'
    if (at.fila_id == f?.fila_id) {
        response = 'active'                 
    }
    if (at.usuario_id != null) {
        if (at.usuario?.filas?.includes(f.fila_id)) response = 'atendendo'
    }
    if (f?.atendido == 1) response = 'expired'
    return response
}

export function prioridadeColor(prioridade:string): string {
    let cor = "";
    switch (prioridade) {
        case "urgente":
            cor = "bg-red-600";
            break;
        case "alta":
            cor = "bg-orange-600";
            break;
        case "media":
            cor = "bg-amber-600";
            break;
        default:
            cor = "bg-emerald-600";
            break;
    }
    return cor;
}

export function prioridadeDesc(prioridade:string): string {
    let cor = "";
    switch (prioridade) {
        case "urgente":
            cor = "Urgente";
            break;
        case "alta":
            cor = "Alta";
            break;
        case "media":
            cor = "Média";
            break;
        default:
            cor = "Baixa";
            break;
    }
    return cor;
}
export async function generateAndDownload(
    endpoint: string,
    payload: any,
    prefix: string
  ) {
    console.log(endpoint);
    
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error ?? `Erro ao gerar ${prefix}`)
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${prefix}_${Date.now()}.pdf`
    a.click()
    URL.revokeObjectURL(url)
}