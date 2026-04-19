import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import {
  maskCPF,
  safeDate,
  safeDateLabel,
  safeDateTimeLabel,
  safeTimeLabel,
  ageFromISO,
  stripDiacritics,
  badgeClass,
  prioridadeColor,
  prioridadeDesc,
} from '@/utils/functions'

// Mock das dependências que usam API_BASE / localStorage
vi.mock('@/utils/constants', () => ({
  API_BASE: 'http://localhost:5132',
  headers: () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer test' }),
}))

describe('maskCPF', () => {
  it('formata CPF com 11 dígitos', () => {
    expect(maskCPF('12345678901')).toBe('123.456.789-01')
  })

  it('retorna "—" para CPF indefinido', () => {
    expect(maskCPF(undefined)).toBe('—')
  })

  it('retorna CPF sem formatação se tiver menos de 11 dígitos', () => {
    expect(maskCPF('12345')).toBe('12345')
  })

  it('remove caracteres não numéricos antes de formatar', () => {
    expect(maskCPF('123.456.789-01')).toBe('123.456.789-01')
  })
})

describe('safeDate', () => {
  it('retorna Date válido para ISO string', () => {
    const result = safeDate('2026-04-13T10:00:00')
    expect(result).not.toBeNull()
    expect(result).toBeInstanceOf(Date)
  })

  it('retorna null para string vazia', () => {
    expect(safeDate('')).toBeNull()
  })

  it('retorna null para undefined', () => {
    expect(safeDate(undefined)).toBeNull()
  })

  it('retorna null para data inválida', () => {
    expect(safeDate('not-a-date')).toBeNull()
  })
})

describe('safeDateLabel', () => {
  it('formata data no padrão dd/MM/yyyy', () => {
    const result = safeDateLabel('2026-04-13T00:00:00')
    expect(result).toBe('13/04/2026')
  })

  it('retorna "—" para data inválida', () => {
    expect(safeDateLabel('invalid')).toBe('—')
  })

  it('retorna "—" para undefined', () => {
    expect(safeDateLabel(undefined)).toBe('—')
  })
})

describe('safeDateTimeLabel', () => {
  it('formata data e hora no padrão dd/MM/yyyy HH:mm', () => {
    const result = safeDateTimeLabel('2026-04-13T10:30:00')
    expect(result).toMatch(/13\/04\/2026 \d{2}:\d{2}/)
  })

  it('retorna "—" para data inválida', () => {
    expect(safeDateTimeLabel('abc')).toBe('—')
  })

  it('retorna "—" para undefined', () => {
    expect(safeDateTimeLabel(undefined)).toBe('—')
  })
})

describe('safeTimeLabel', () => {
  it('formata apenas hora no padrão HH:mm', () => {
    const result = safeTimeLabel('2026-04-13T14:45:00')
    expect(result).toMatch(/\d{2}:\d{2}/)
  })

  it('retorna "—" para undefined', () => {
    expect(safeTimeLabel(undefined)).toBe('—')
  })
})

describe('ageFromISO', () => {
  it('calcula idade corretamente para data passada', () => {
    // Usando data fixada (hoje = 2026-04-13)
    const age = ageFromISO('1990-04-13')
    expect(age).toBe(36)
  })

  it('retorna null para ISO inválido', () => {
    expect(ageFromISO('invalid')).toBeNull()
  })

  it('retorna null para undefined', () => {
    expect(ageFromISO(undefined)).toBeNull()
  })

  it('retorna 0 para nascido hoje', () => {
    const today = new Date().toISOString().split('T')[0]
    const age = ageFromISO(today)
    expect(age).toBe(0)
  })
})

describe('stripDiacritics', () => {
  it('remove acentos de texto', () => {
    expect(stripDiacritics('Ação')).toBe('Acao')
    expect(stripDiacritics('Médico')).toBe('Medico')
    expect(stripDiacritics('Ênfase')).toBe('Enfase')
  })

  it('mantém texto sem acentos', () => {
    expect(stripDiacritics('Hello World')).toBe('Hello World')
  })
})

describe('badgeClass', () => {
  it('retorna classe "active" para status active', () => {
    expect(badgeClass('active')).toContain('bg-black')
  })

  it('retorna classe "expired" para status expired', () => {
    expect(badgeClass('expired')).toContain('opacity-70')
  })

  it('retorna classe "atendendo" para status atendendo', () => {
    expect(badgeClass('atendendo')).toContain('green')
  })

  it('retorna classe "pending" por padrão', () => {
    expect(badgeClass('pending')).toContain('zinc')
  })
})

describe('prioridadeColor', () => {
  it('retorna vermelho para urgente', () => {
    expect(prioridadeColor('urgente')).toContain('red')
  })

  it('retorna laranja para alta', () => {
    expect(prioridadeColor('alta')).toContain('orange')
  })

  it('retorna âmbar para media', () => {
    expect(prioridadeColor('media')).toContain('amber')
  })

  it('retorna verde para prioridade padrão (baixa)', () => {
    expect(prioridadeColor('baixa')).toContain('emerald')
  })
})

describe('prioridadeDesc', () => {
  it('retorna "Urgente" para urgente', () => {
    expect(prioridadeDesc('urgente')).toBe('Urgente')
  })

  it('retorna "Alta" para alta', () => {
    expect(prioridadeDesc('alta')).toBe('Alta')
  })

  it('retorna "Média" para media', () => {
    expect(prioridadeDesc('media')).toBe('Média')
  })

  it('retorna "Baixa" para prioridade desconhecida', () => {
    expect(prioridadeDesc('qualquer')).toBe('Baixa')
  })
})
