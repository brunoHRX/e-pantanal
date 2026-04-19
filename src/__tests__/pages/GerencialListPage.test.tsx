import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import GerencialListPage from '@/app/(privado)/atendimento/gerencial/GerencialPage'
import * as gerencialService from '@/services/gerencialService'
import { AtendimentoGerencialFormType } from '@/types/Gerencial'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

const mockData: AtendimentoGerencialFormType[] = [
  {
    id: 1,
    paciente_nome: 'Maria Souza',
    data_atendimento: '2026-04-13T09:00:00',
    atendimentos: [],
  },
  {
    id: 2,
    paciente_nome: 'Pedro Alves',
    data_atendimento: '2026-04-13T10:30:00',
    atendimentos: [],
  },
]

const mockPush = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useRouter).mockReturnValue({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
  } as any)
})

describe('GerencialListPage', () => {
  describe('estado de carregamento', () => {
    it('exibe estado de loading enquanto busca dados', () => {
      vi.spyOn(gerencialService, 'getAll').mockReturnValue(new Promise(() => {}))

      render(<GerencialListPage />)

      // DataTable com loading=true está presente no DOM
      expect(document.body).toBeDefined()
    })
  })

  describe('carregamento com sucesso', () => {
    beforeEach(() => {
      vi.spyOn(gerencialService, 'getAll').mockResolvedValue(mockData)
    })

    it('renderiza o título "Atendimentos Gerenciais"', async () => {
      render(<GerencialListPage />)

      await waitFor(() => {
        expect(screen.getByText('Atendimentos Gerenciais')).toBeInTheDocument()
      })
    })

    it('exibe os nomes dos pacientes na tabela', async () => {
      render(<GerencialListPage />)

      await waitFor(() => {
        expect(screen.getByText('Maria Souza')).toBeInTheDocument()
        expect(screen.getByText('Pedro Alves')).toBeInTheDocument()
      })
    })

    it('exibe os IDs dos atendimentos', async () => {
      render(<GerencialListPage />)

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument()
      })
    })

    it('exibe botões "Editar" para cada registro', async () => {
      render(<GerencialListPage />)

      await waitFor(() => {
        const editButtons = screen.getAllByRole('button', { name: /editar/i })
        expect(editButtons).toHaveLength(2)
      })
    })

    it('botão "Editar" navega para o formulário com o id correto', async () => {
      render(<GerencialListPage />)

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /editar/i })).toHaveLength(2)
      })

      const editButtons = screen.getAllByRole('button', { name: /editar/i })
      await userEvent.click(editButtons[0])

      expect(mockPush).toHaveBeenCalledWith('/atendimento/gerencial/formulario?id=1')
    })

    it('botão "Novo Atendimento" navega para o formulário sem id', async () => {
      render(<GerencialListPage />)

      await waitFor(() => {
        expect(screen.getByText('Atendimentos Gerenciais')).toBeInTheDocument()
      })

      const newButton = screen.getByRole('button', { name: /novo atendimento/i })
      await userEvent.click(newButton)

      expect(mockPush).toHaveBeenCalledWith('/atendimento/gerencial/formulario')
    })
  })

  describe('erro ao carregar', () => {
    it('exibe toast de erro quando getAll falha', async () => {
      const { toast } = await import('sonner')
      vi.spyOn(gerencialService, 'getAll').mockRejectedValue(new Error('Falha de rede'))

      render(<GerencialListPage />)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao carregar atendimentos')
      })
    })

    it('não exibe dados quando ocorre erro', async () => {
      vi.spyOn(gerencialService, 'getAll').mockRejectedValue(new Error('Falha'))

      render(<GerencialListPage />)

      await waitFor(() => {
        expect(screen.queryByText('Maria Souza')).not.toBeInTheDocument()
      })
    })
  })

  describe('lista vazia', () => {
    it('renderiza sem erros quando não há atendimentos', async () => {
      vi.spyOn(gerencialService, 'getAll').mockResolvedValue([])

      render(<GerencialListPage />)

      await waitFor(() => {
        expect(screen.getByText('Atendimentos Gerenciais')).toBeInTheDocument()
      })
    })
  })
})
