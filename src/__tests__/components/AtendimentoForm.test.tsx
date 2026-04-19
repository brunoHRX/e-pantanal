import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import AtendimentoForm from '@/app/(privado)/atendimento/gerencial/components/AtendimentoForm'
import { AtendimentoGerencialFormType } from '@/types/Gerencial'

vi.mock('@/components/autocomplete-portal', () => ({
  default: ({ placeholder }: any) => (
    <input placeholder={placeholder} />
  ),
}))

const mockMedicos = [{ id: 1, usuario: 'Dr. Carlos', especialidade_id: 1 }] as any
const mockProcedimentos = [{ id: 1, nome: 'Consulta' }] as any
const mockMedicamentos = [{ id: 1, nome: 'Dipirona' }] as any
const mockEspecialidades = [{ id: 1, nome: 'Clínica Geral' }] as any

// Wrapper that renders AtendimentoForm with a connected form context
function FormWithAtendimentos() {
  const form = useForm<AtendimentoGerencialFormType>({
    defaultValues: {
      id: 0,
      paciente_id: 0,
      paciente_nome: '',
      paciente_data_nascimento: '',
      atendimentos: [],
      triagem: {
        id: 0,
        peso: 0,
        altura: 0,
        temperatura: 0,
        fr: '',
        sato2: '',
        pa: '',
        fc: '',
        comorbidades: '',
        alergias: '',
        medicacao24h: '',
        queixa: '',
      },
    },
  })

  return (
    <FormProvider {...form}>
      <AtendimentoForm
        form={form}
        medicos={mockMedicos}
        procedimentos={mockProcedimentos}
        medicamentos={mockMedicamentos}
        especialidades={mockEspecialidades}
      />
    </FormProvider>
  )
}

describe('AtendimentoForm', () => {
  it('renderiza botão "Adicionar Especialidade"', () => {
    render(<FormWithAtendimentos />)

    expect(screen.getByRole('button', { name: /adicionar especialidade/i })).toBeInTheDocument()
  })

  it('inicia sem cards de atendimento', () => {
    render(<FormWithAtendimentos />)

    // Sem cards, não há título "Atendimento"
    expect(screen.queryByText('Atendimento')).not.toBeInTheDocument()
  })

  it('adiciona um card ao clicar em "Adicionar Especialidade"', async () => {
    render(<FormWithAtendimentos />)

    await userEvent.click(screen.getByRole('button', { name: /adicionar especialidade/i }))

    expect(screen.getByText('Atendimento')).toBeInTheDocument()
  })

  it('adiciona múltiplos cards ao clicar várias vezes', async () => {
    render(<FormWithAtendimentos />)

    const btn = screen.getByRole('button', { name: /adicionar especialidade/i })
    await userEvent.click(btn)
    await userEvent.click(btn)
    await userEvent.click(btn)

    expect(screen.getAllByText('Atendimento')).toHaveLength(3)
  })

  it('cada card tem botão "Remover"', async () => {
    render(<FormWithAtendimentos />)

    const btn = screen.getByRole('button', { name: /adicionar especialidade/i })
    await userEvent.click(btn)
    await userEvent.click(btn)

    expect(screen.getAllByRole('button', { name: /remover/i })).toHaveLength(2)
  })
})
