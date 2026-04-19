import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getAll,
  getElementById,
  createElement,
  updateElement,
  deleteElement,
} from '@/services/gerencialService'
import { AtendimentoGerencialFormType } from '@/types/Gerencial'

const mockAtendimento: AtendimentoGerencialFormType = {
  id: 1,
  paciente_id: 10,
  paciente_nome: 'João Silva',
  paciente_data_nascimento: '1990-01-15',
  data_atendimento: '2026-04-13T10:00:00',
  atendimentos: [
    {
      id: 1,
      especialidade_id: 1,
      medico_id: 2,
      medico_nome: 'Dr. Carlos',
      medico_registro: 'CRM 12345',
      procedimentos: [{ id: 1, nome: 'Consulta', dente: '' }],
      medicamentos: [{ id: 1, nome: 'Dipirona', frequencia: '8/8h', duracao: 3 }],
    },
  ],
  triagem: {
    id: 1,
    peso: 70,
    altura: 175,
    temperatura: 36.5,
    fr: '16',
    sato2: '98',
    pa: '120/80',
    fc: '75',
    comorbidades: 'Nenhuma',
    alergias: 'Nenhuma',
    medicacao24h: 'Nenhuma',
    queixa: 'Dor de cabeça',
  },
}

function mockFetch(ok: boolean, body: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(typeof body === 'string' ? body : JSON.stringify(body)),
  })
}

beforeEach(() => {
  localStorage.setItem('authToken', 'test-token')
})

describe('gerencialService — getAll', () => {
  it('retorna lista de atendimentos em caso de sucesso', async () => {
    global.fetch = mockFetch(true, [mockAtendimento])

    const result = await getAll()

    expect(global.fetch).toHaveBeenCalledOnce()
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/Gerencial'),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer test-token' }) })
    )
    expect(result).toHaveLength(1)
    expect(result[0].paciente_nome).toBe('João Silva')
  })

  it('lança erro com mensagem do servidor em caso de falha', async () => {
    global.fetch = mockFetch(false, 'Unauthorized', 401)

    await expect(getAll()).rejects.toThrow('Erro 401 ao buscar atendimentos: Unauthorized')
  })
})

describe('gerencialService — getElementById', () => {
  it('retorna atendimento pelo id em caso de sucesso', async () => {
    global.fetch = mockFetch(true, mockAtendimento)

    const result = await getElementById(1)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/Gerencial/1'),
      expect.anything()
    )
    expect(result.id).toBe(1)
    expect(result.paciente_nome).toBe('João Silva')
  })

  it('lança erro com status em caso de falha', async () => {
    global.fetch = mockFetch(false, 'Not Found', 404)

    await expect(getElementById(999)).rejects.toThrow('Erro 404 ao buscar atendimento: Not Found')
  })
})

describe('gerencialService — createElement', () => {
  it('envia POST com dados corretos em caso de sucesso', async () => {
    global.fetch = mockFetch(true, null, 201)
    const novoAtendimento = { ...mockAtendimento, id: undefined }

    await expect(createElement(novoAtendimento)).resolves.toBeUndefined()

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/Gerencial'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(novoAtendimento),
      })
    )
  })

  it('lança erro em caso de falha no POST', async () => {
    global.fetch = mockFetch(false, 'Bad Request', 400)

    await expect(createElement(mockAtendimento)).rejects.toThrow(
      'Erro 400 ao criar atendimento: Bad Request'
    )
  })
})

describe('gerencialService — updateElement', () => {
  it('envia PUT com id correto em caso de sucesso', async () => {
    global.fetch = mockFetch(true, null, 200)

    await expect(updateElement(mockAtendimento)).resolves.toBeUndefined()

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/Gerencial/1'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(mockAtendimento),
      })
    )
  })

  it('lança erro em caso de falha no PUT', async () => {
    global.fetch = mockFetch(false, 'Internal Server Error', 500)

    await expect(updateElement(mockAtendimento)).rejects.toThrow(
      'Erro 500 ao atualizar atendimento: Internal Server Error'
    )
  })
})

describe('gerencialService — deleteElement', () => {
  it('envia DELETE com id correto em caso de sucesso', async () => {
    global.fetch = mockFetch(true, null, 204)

    await expect(deleteElement(1)).resolves.toBeUndefined()

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/Gerencial/1'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('lança erro em caso de falha no DELETE', async () => {
    global.fetch = mockFetch(false, 'Forbidden', 403)

    await expect(deleteElement(1)).rejects.toThrow(
      'Erro 403 ao atualizar atendimento: Forbidden'
    )
  })
})
