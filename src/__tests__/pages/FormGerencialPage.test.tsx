import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter, useSearchParams } from 'next/navigation'
import FormGerencialPage from '@/app/(privado)/atendimento/gerencial/formulario/FormGerencialPage'
import * as gerencialService from '@/services/gerencialService'
import * as medicamentoService from '@/services/medicamentoService'
import * as procedimentoService from '@/services/procedimentoService'
import * as especialidadeService from '@/services/especialidadeService'
import * as usuariosService from '@/services/usuariosService'
import * as patientService from '@/services/patientService'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

// Mock AutocompletePortal to avoid portal complexity
vi.mock('@/components/autocomplete-portal', () => ({
  default: ({ placeholder, onSelect, items, labelField, value }: any) => (
    <input
      placeholder={placeholder}
      defaultValue={value}
      onChange={(e) => {
        const found = items?.find((i: any) => i[labelField] === e.target.value)
        if (found) onSelect(found)
      }}
    />
  ),
}))

const mockMedicos = [
  { id: 1, usuario: 'Dr. Ana Lima', especialidade_id: 1 },
  { id: 2, usuario: 'Dr. Bruno Costa', especialidade_id: 3 },
]

const mockProcedimentos = [
  { id: 1, nome: 'Consulta Clínica' },
  { id: 2, nome: 'Eletrocardiograma' },
]

const mockMedicamentos = [
  { id: 1, nome: 'Dipirona 500mg' },
  { id: 2, nome: 'Amoxicilina 500mg' },
]

const mockEspecialidades = [
  { id: 1, nome: 'Clínica Geral' },
  { id: 4, nome: 'Odontologia' },
]

const mockPacientes = [
  { id: 1, nome: 'Ana Paula' },
  { id: 2, nome: 'Carlos Roberto' },
]

const mockAtendimento = {
  id: 5,
  paciente_id: 1,
  paciente_nome: 'Ana Paula',
  paciente_data_nascimento: '1985-03-10',
  data_atendimento: '2026-04-13T09:00:00',
  atendimentos: [],
  triagem: {
    id: 1,
    peso: 65,
    altura: 165,
    temperatura: 36.8,
    fr: '16',
    sato2: '99',
    pa: '110/70',
    fc: '72',
    comorbidades: 'Hipertensão',
    alergias: 'Penicilina',
    medicacao24h: 'Losartana',
    queixa: 'Dor lombar',
  },
}

const mockPush = vi.fn()

function setupReferenceDataMocks() {
  vi.spyOn(medicamentoService, 'getAll').mockResolvedValue(mockMedicamentos as any)
  vi.spyOn(procedimentoService, 'getAll').mockResolvedValue(mockProcedimentos as any)
  vi.spyOn(especialidadeService, 'getAll').mockResolvedValue(mockEspecialidades as any)
  vi.spyOn(usuariosService, 'getAll').mockResolvedValue(mockMedicos as any)
  vi.spyOn(patientService, 'getAllPatients').mockResolvedValue(mockPacientes as any)
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useRouter).mockReturnValue({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
  } as any)
  vi.mocked(useSearchParams).mockReturnValue({
    get: vi.fn().mockReturnValue(null),
  } as any)
  setupReferenceDataMocks()
})

describe('FormGerencialPage — modo criação (sem id)', () => {
  it('exibe loading enquanto carrega dados de referência', () => {
    vi.spyOn(medicamentoService, 'getAll').mockReturnValue(new Promise(() => {}))

    render(<FormGerencialPage />)

    expect(screen.getByText(/carregando informações/i)).toBeInTheDocument()
  })

  it('exibe o formulário após carregar dados', async () => {
    render(<FormGerencialPage />)

    await waitFor(() => {
      expect(screen.getByText('Lançamento de atendimento')).toBeInTheDocument()
    })
  })

  it('exibe seções de Paciente, Triagem e Atendimentos', async () => {
    render(<FormGerencialPage />)

    await waitFor(() => {
      // "Paciente" aparece como accordion trigger e como label — basta confirmar presença
      expect(screen.getAllByText('Paciente').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Triagem')).toBeInTheDocument()
      expect(screen.getByText('Atendimentos')).toBeInTheDocument()
    })
  })

  it('exibe botão "Voltar"', async () => {
    render(<FormGerencialPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /voltar/i })).toBeInTheDocument()
    })
  })

  it('botão "Voltar" navega para lista', async () => {
    render(<FormGerencialPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /voltar/i })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /voltar/i }))

    expect(mockPush).toHaveBeenCalledWith('/atendimento/gerencial/')
  })

  it('botão "Novo" alterna para campos manuais de paciente', async () => {
    render(<FormGerencialPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^novo$/i })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /^novo$/i }))

    expect(screen.getByLabelText(/nome do paciente/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/data de nascimento/i)).toBeInTheDocument()
  })

  it('botão "Buscar" aparece ao alternar para novo paciente', async () => {
    render(<FormGerencialPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^novo$/i })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /^novo$/i }))

    expect(screen.getByRole('button', { name: /^buscar$/i })).toBeInTheDocument()
  })

  it('botão "Buscar" volta ao modo autocomplete', async () => {
    render(<FormGerencialPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^novo$/i })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /^novo$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^buscar$/i }))

    expect(screen.getByPlaceholderText(/nome do paciente/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/nome do paciente/i)).not.toBeInTheDocument()
  })

  it('exibe botão "Registrar atendimento"', async () => {
    render(<FormGerencialPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /registrar atendimento/i })).toBeInTheDocument()
    })
  })

  it('chama createElement e navega ao registrar atendimento novo', async () => {
    vi.spyOn(gerencialService, 'createElement').mockResolvedValue(undefined)
    const { toast } = await import('sonner')

    render(<FormGerencialPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /registrar atendimento/i })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /registrar atendimento/i }))

    await waitFor(() => {
      expect(gerencialService.createElement).toHaveBeenCalledOnce()
      expect(toast.success).toHaveBeenCalledWith('Atendimento registrado com sucesso')
      expect(mockPush).toHaveBeenCalledWith('/atendimento/gerencial/')
    })
  })

  it('exibe toast de erro quando createElement falha', async () => {
    vi.spyOn(gerencialService, 'createElement').mockRejectedValue(new Error('Erro ao criar'))
    const { toast } = await import('sonner')

    render(<FormGerencialPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /registrar atendimento/i })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /registrar atendimento/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao criar')
    })
  })

  it('exibe toast de erro quando carregamento de dados falha', async () => {
    vi.spyOn(medicamentoService, 'getAll').mockRejectedValue(new Error('Serviço indisponível'))
    const { toast } = await import('sonner')

    render(<FormGerencialPage />)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Serviço indisponível')
    })
  })
})

describe('FormGerencialPage — modo edição (com id)', () => {
  beforeEach(() => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn().mockReturnValue('5'),
    } as any)
    vi.spyOn(gerencialService, 'getElementById').mockResolvedValue(mockAtendimento as any)
  })

  it('carrega dados do atendimento pelo id', async () => {
    render(<FormGerencialPage />)

    await waitFor(() => {
      expect(gerencialService.getElementById).toHaveBeenCalledWith(5)
    })
  })

  it('preenche campos de triagem com dados carregados', async () => {
    render(<FormGerencialPage />)

    await waitFor(() => {
      const pesoInput = screen.getByLabelText(/peso/i) as HTMLInputElement
      expect(pesoInput.value).toBe('65')
    })
  })

  it('chama updateElement ao salvar no modo edição', async () => {
    vi.spyOn(gerencialService, 'updateElement').mockResolvedValue(undefined)
    const { toast } = await import('sonner')

    render(<FormGerencialPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /registrar atendimento/i })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /registrar atendimento/i }))

    await waitFor(() => {
      expect(gerencialService.updateElement).toHaveBeenCalledOnce()
      expect(toast.success).toHaveBeenCalledWith('Atendimento atualizado com sucesso')
    })
  })

  it('não navega para lista após atualizar (permanece na tela de edição)', async () => {
    vi.spyOn(gerencialService, 'updateElement').mockResolvedValue(undefined)

    render(<FormGerencialPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /registrar atendimento/i })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /registrar atendimento/i }))

    await waitFor(() => {
      expect(gerencialService.updateElement).toHaveBeenCalled()
    })

    expect(mockPush).not.toHaveBeenCalledWith('/atendimento/gerencial/')
  })

  it('exibe toast de erro quando getElementById falha', async () => {
    vi.spyOn(gerencialService, 'getElementById').mockRejectedValue(
      new Error('Atendimento não encontrado')
    )
    const { toast } = await import('sonner')

    render(<FormGerencialPage />)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Atendimento não encontrado')
    })
  })
})

// ---------------------------------------------------------------------------
// Cenário A — Criação com paciente existente
// ---------------------------------------------------------------------------
describe('FormGerencialPage — criação com paciente existente', () => {
  it('envia paciente_id correto ao selecionar paciente existente via autocomplete', async () => {
    const createSpy = vi.spyOn(gerencialService, 'createElement').mockResolvedValue(undefined)

    render(<FormGerencialPage />)

    // Aguarda o formulário carregar
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /registrar atendimento/i })).toBeInTheDocument()
    })

    // Seleciona paciente existente "Ana Paula" (id=1) via input mock do AutocompletePortal
    const autocompleteInput = screen.getByPlaceholderText(/nome do paciente/i)
    fireEvent.change(autocompleteInput, { target: { value: 'Ana Paula' } })

    // Envia o formulário
    await userEvent.click(screen.getByRole('button', { name: /registrar atendimento/i }))

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledOnce()
    })

    // Verifica que o payload contém paciente_id=1 (paciente existente)
    const payload = createSpy.mock.calls[0][0]
    expect(payload.paciente_id).toBe(1)
    expect(payload.paciente_nome).toBe('')      // não preenchido no modo autocomplete
  })

  it('envia triagem com valores informados junto ao paciente existente', async () => {
    const createSpy = vi.spyOn(gerencialService, 'createElement').mockResolvedValue(undefined)

    render(<FormGerencialPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /registrar atendimento/i })).toBeInTheDocument()
    })

    // Seleciona paciente "Carlos Roberto" (id=2)
    const autocompleteInput = screen.getByPlaceholderText(/nome do paciente/i)
    fireEvent.change(autocompleteInput, { target: { value: 'Carlos Roberto' } })

    // Preenche peso e queixa na triagem
    await userEvent.clear(screen.getByLabelText(/peso/i))
    await userEvent.type(screen.getByLabelText(/peso/i), '80')
    await userEvent.clear(screen.getByLabelText(/queixa/i))
    await userEvent.type(screen.getByLabelText(/queixa/i), 'Dor de cabeça')

    await userEvent.click(screen.getByRole('button', { name: /registrar atendimento/i }))

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledOnce()
    })

    const payload = createSpy.mock.calls[0][0]
    expect(payload.paciente_id).toBe(2)
    expect(payload.triagem?.queixa).toBe('Dor de cabeça')
  })

  it('navega para a lista após registrar com paciente existente', async () => {
    vi.spyOn(gerencialService, 'createElement').mockResolvedValue(undefined)

    render(<FormGerencialPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /registrar atendimento/i })).toBeInTheDocument()
    })

    const autocompleteInput = screen.getByPlaceholderText(/nome do paciente/i)
    fireEvent.change(autocompleteInput, { target: { value: 'Ana Paula' } })

    await userEvent.click(screen.getByRole('button', { name: /registrar atendimento/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/atendimento/gerencial/')
    })
  })
})

// ---------------------------------------------------------------------------
// Cenário B — Criação com todas as informações novas (novo paciente)
// ---------------------------------------------------------------------------
describe('FormGerencialPage — criação com todas as informações novas', () => {
  it('envia paciente_nome e paciente_data_nascimento ao registrar novo paciente', async () => {
    const createSpy = vi.spyOn(gerencialService, 'createElement').mockResolvedValue(undefined)

    render(<FormGerencialPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^novo$/i })).toBeInTheDocument()
    })

    // Alterna para modo de novo paciente
    await userEvent.click(screen.getByRole('button', { name: /^novo$/i }))

    // Preenche nome e data de nascimento do novo paciente
    await userEvent.type(screen.getByLabelText(/nome do paciente/i), 'João da Silva')
    await userEvent.type(screen.getByLabelText(/data de nascimento/i), '1990-05-15')

    await userEvent.click(screen.getByRole('button', { name: /registrar atendimento/i }))

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledOnce()
    })

    const payload = createSpy.mock.calls[0][0]
    expect(payload.paciente_nome).toBe('João da Silva')
    expect(payload.paciente_data_nascimento).toBe('1990-05-15')
    // paciente_id permanece 0 pois não foi selecionado via autocomplete
    expect(payload.paciente_id).toBe(0)
  })

  it('envia triagem completa ao criar ficha com novo paciente', async () => {
    const createSpy = vi.spyOn(gerencialService, 'createElement').mockResolvedValue(undefined)

    render(<FormGerencialPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^novo$/i })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /^novo$/i }))

    // Novo paciente
    await userEvent.type(screen.getByLabelText(/nome do paciente/i), 'Maria Nova')
    await userEvent.type(screen.getByLabelText(/data de nascimento/i), '2000-01-20')

    // Triagem
    await userEvent.clear(screen.getByLabelText(/peso/i))
    await userEvent.type(screen.getByLabelText(/peso/i), '70')
    await userEvent.clear(screen.getByLabelText(/altura/i))
    await userEvent.type(screen.getByLabelText(/altura/i), '168')
    await userEvent.type(screen.getByLabelText(/comorbidades/i), 'Diabetes')
    await userEvent.type(screen.getByLabelText(/alergias/i), 'Dipirona')
    await userEvent.type(screen.getByLabelText(/queixa/i), 'Febre alta')

    await userEvent.click(screen.getByRole('button', { name: /registrar atendimento/i }))

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledOnce()
    })

    const payload = createSpy.mock.calls[0][0]
    expect(payload.paciente_nome).toBe('Maria Nova')
    expect(payload.paciente_data_nascimento).toBe('2000-01-20')
    expect(payload.triagem?.comorbidades).toBe('Diabetes')
    expect(payload.triagem?.alergias).toBe('Dipirona')
    expect(payload.triagem?.queixa).toBe('Febre alta')
  })

  it('exibe toast de sucesso ao registrar nova ficha com novo paciente', async () => {
    vi.spyOn(gerencialService, 'createElement').mockResolvedValue(undefined)
    const { toast } = await import('sonner')

    render(<FormGerencialPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^novo$/i })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /^novo$/i }))
    await userEvent.type(screen.getByLabelText(/nome do paciente/i), 'Novo Paciente Teste')
    await userEvent.type(screen.getByLabelText(/data de nascimento/i), '1985-08-22')

    await userEvent.click(screen.getByRole('button', { name: /registrar atendimento/i }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Atendimento registrado com sucesso')
    })
  })

  it('navega para a lista após registrar nova ficha com novo paciente', async () => {
    vi.spyOn(gerencialService, 'createElement').mockResolvedValue(undefined)

    render(<FormGerencialPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^novo$/i })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /^novo$/i }))
    await userEvent.type(screen.getByLabelText(/nome do paciente/i), 'Paciente Navegação')
    await userEvent.type(screen.getByLabelText(/data de nascimento/i), '1975-03-10')

    await userEvent.click(screen.getByRole('button', { name: /registrar atendimento/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/atendimento/gerencial/')
    })
  })

  it('não envia paciente_id ao criar ficha com novo paciente', async () => {
    const createSpy = vi.spyOn(gerencialService, 'createElement').mockResolvedValue(undefined)

    render(<FormGerencialPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^novo$/i })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /^novo$/i }))
    await userEvent.type(screen.getByLabelText(/nome do paciente/i), 'Sem ID')
    await userEvent.type(screen.getByLabelText(/data de nascimento/i), '1999-12-31')

    await userEvent.click(screen.getByRole('button', { name: /registrar atendimento/i }))

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledOnce()
    })

    const payload = createSpy.mock.calls[0][0]
    // paciente_id deve ser 0 (valor default) — backend ignora se paciente_nome estiver preenchido
    expect(payload.paciente_id).toBe(0)
    expect(payload.paciente_nome).toBe('Sem ID')
  })
})
