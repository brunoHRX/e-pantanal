import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import MedicamentosField from '@/app/(privado)/atendimento/gerencial/components/MedicamentosField'
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

const mockMedicamentos = [
  { id: 1, nome: 'Dipirona 500mg' },
  { id: 2, nome: 'Amoxicilina 500mg' },
]

function Wrapper({ children }: { children: React.ReactNode }) {
  const form = useForm<AtendimentoGerencialFormType>({
    defaultValues: {
      atendimentos: [{ procedimentos: [], medicamentos: [] }],
    },
  })
  return <FormProvider {...form}>{children}</FormProvider>
}

describe('MedicamentosField', () => {
  it('renderiza cabeçalho "Medicamentos"', () => {
    render(
      <Wrapper>
        <MedicamentosField atendimentoIndex={0} medicamentos={mockMedicamentos} />
      </Wrapper>
    )

    expect(screen.getByText('Medicamentos')).toBeInTheDocument()
  })

  it('exibe botão "+" para adicionar medicamento', () => {
    render(
      <Wrapper>
        <MedicamentosField atendimentoIndex={0} medicamentos={mockMedicamentos} />
      </Wrapper>
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('adiciona linha de medicamento ao clicar em "+"', async () => {
    render(
      <Wrapper>
        <MedicamentosField atendimentoIndex={0} medicamentos={mockMedicamentos} />
      </Wrapper>
    )

    const addButton = screen.getByRole('button')
    await userEvent.click(addButton)

    expect(screen.getByPlaceholderText(/medicamento/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/frequência/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/duração/i)).toBeInTheDocument()
  })

  it('remove medicamento ao clicar no botão de exclusão', async () => {
    render(
      <Wrapper>
        <MedicamentosField atendimentoIndex={0} medicamentos={mockMedicamentos} />
      </Wrapper>
    )

    const addButton = screen.getAllByRole('button')[0]
    await userEvent.click(addButton)

    expect(screen.getByPlaceholderText(/medicamento/i)).toBeInTheDocument()

    // Clica no botão de exclusão (último botão)
    const buttons = screen.getAllByRole('button')
    await userEvent.click(buttons[buttons.length - 1])

    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/medicamento/i)).not.toBeInTheDocument()
    })
  })

  it('alterna entre autocomplete e input manual ao clicar em "Novo"', async () => {
    render(
      <Wrapper>
        <MedicamentosField atendimentoIndex={0} medicamentos={mockMedicamentos} />
      </Wrapper>
    )

    // Adiciona um medicamento
    const addButton = screen.getAllByRole('button')[0]
    await userEvent.click(addButton)

    // Clica em "Novo"
    await userEvent.click(screen.getByRole('button', { name: /^novo$/i }))

    // Deve aparecer input de texto ao invés do autocomplete
    expect(screen.getByLabelText('Medicamento')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/medicamento/i)).not.toBeInTheDocument()

    // Clica em "Buscar" para voltar
    await userEvent.click(screen.getByRole('button', { name: /^buscar$/i }))

    expect(screen.getByPlaceholderText(/medicamento/i)).toBeInTheDocument()
  })

  it('mantém índices corretos ao remover item do meio', async () => {
    render(
      <Wrapper>
        <MedicamentosField atendimentoIndex={0} medicamentos={mockMedicamentos} />
      </Wrapper>
    )

    const addButton = screen.getAllByRole('button')[0]
    // Adiciona 3 medicamentos
    await userEvent.click(addButton)
    await userEvent.click(addButton)
    await userEvent.click(addButton)

    expect(screen.getAllByPlaceholderText(/medicamento/i)).toHaveLength(3)

    // Remove o segundo (índice 1) — cada linha tem: [autocomplete, Novo, freq, dur, trash]
    // Encontramos os botões trash (sem texto)
    const buttons = screen.getAllByRole('button')
    // Botão add é o primeiro; depois para cada linha temos 2 botões (Novo + Trash)
    // Linha 1: buttons[1] = Novo, buttons[2] = Trash
    // Linha 2: buttons[3] = Novo, buttons[4] = Trash
    // Linha 3: buttons[5] = Novo, buttons[6] = Trash
    // Clica no Trash da linha 2
    await userEvent.click(buttons[4])

    await waitFor(() => {
      expect(screen.getAllByPlaceholderText(/medicamento/i)).toHaveLength(2)
    })
  })
})
