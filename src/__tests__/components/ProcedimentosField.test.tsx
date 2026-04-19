import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import ProcedimentosField from '@/app/(privado)/atendimento/gerencial/components/ProcedimentosField'
import { AtendimentoGerencialFormType } from '@/types/Gerencial'

vi.mock('@/components/autocomplete-portal', () => ({
  default: ({ placeholder, onSelect, items, labelField }: any) => (
    <input
      placeholder={placeholder}
      onChange={(e) => {
        const found = items?.find((i: any) => i[labelField] === e.target.value)
        if (found) onSelect(found)
      }}
    />
  ),
}))

const mockProcedimentos = [
  { id: 1, nome: 'Consulta Clínica' },
  { id: 2, nome: 'Extração Dentária' },
]

function Wrapper({ children, tipo = 1 }: {
  children?: React.ReactNode
  tipo?: number
}) {
  const form = useForm<AtendimentoGerencialFormType>({
    defaultValues: {
      atendimentos: [{ especialidade_id: tipo, procedimentos: [], medicamentos: [] }],
    },
  })
  return (
    <FormProvider {...form}>
      <ProcedimentosField atendimentoIndex={0} procedimentos={mockProcedimentos} tipo={tipo} />
    </FormProvider>
  )
}

describe('ProcedimentosField', () => {
  it('renderiza cabeçalho "Procedimentos"', () => {
    render(<Wrapper />)

    expect(screen.getByText('Procedimentos')).toBeInTheDocument()
  })

  it('exibe botão "+" para adicionar procedimento', () => {
    render(<Wrapper />)

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('adiciona linha de procedimento ao clicar em "+"', async () => {
    render(<Wrapper />)

    // O único botão inicial é o "+"
    await userEvent.click(screen.getAllByRole('button')[0])

    expect(screen.getByPlaceholderText(/procedimento/i)).toBeInTheDocument()
  })

  it('exibe campo "Dentes" somente para odontologia (tipo=4)', async () => {
    render(<Wrapper tipo={4} />)

    await userEvent.click(screen.getAllByRole('button')[0])

    await waitFor(() => {
      expect(screen.getByLabelText(/dentes/i)).toBeInTheDocument()
    })
  })

  it('não exibe campo "Dentes" para especialidades não odontológicas', async () => {
    render(<Wrapper tipo={1} />)

    await userEvent.click(screen.getAllByRole('button')[0])

    expect(screen.queryByLabelText(/dentes/i)).not.toBeInTheDocument()
  })

  it('remove procedimento ao clicar no botão destrutivo', async () => {
    render(<Wrapper />)

    // Adiciona um procedimento
    await userEvent.click(screen.getAllByRole('button')[0])

    expect(screen.getByPlaceholderText(/procedimento/i)).toBeInTheDocument()

    // Botões após adicionar: [+(add), Novo, Trash-destructive]
    // O botão de exclusão é o último
    const buttons = screen.getAllByRole('button')
    const trashButton = buttons[buttons.length - 1]
    await userEvent.click(trashButton)

    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/procedimento/i)).not.toBeInTheDocument()
    })
  })

  it('alterna entre autocomplete e input manual ao clicar em "Novo"', async () => {
    render(<Wrapper />)

    // Adiciona um procedimento
    await userEvent.click(screen.getAllByRole('button')[0])

    // Clica em "Novo"
    await userEvent.click(screen.getByRole('button', { name: /^novo$/i }))

    // Deve aparecer Input de texto (label visível)
    expect(screen.getByLabelText('Procedimento')).toBeInTheDocument()
    // Autocomplete não deve estar visível
    expect(screen.queryByPlaceholderText(/procedimento/i)).not.toBeInTheDocument()

    // Clica em "Buscar" para voltar ao autocomplete
    await userEvent.click(screen.getByRole('button', { name: /^buscar$/i }))

    expect(screen.getByPlaceholderText(/procedimento/i)).toBeInTheDocument()
  })

  it('adiciona múltiplos procedimentos', async () => {
    render(<Wrapper />)

    const addBtn = screen.getAllByRole('button')[0]
    await userEvent.click(addBtn)
    await userEvent.click(addBtn)

    expect(screen.getAllByPlaceholderText(/procedimento/i)).toHaveLength(2)
  })
})
