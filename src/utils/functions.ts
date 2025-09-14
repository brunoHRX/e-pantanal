import { differenceInYears, format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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