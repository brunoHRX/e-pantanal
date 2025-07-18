'use client'

import React, { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Save,
  FileText,
  Printer,
  RotateCcw,
  User,
  HeartPulse,
  Meh,
  FileText as FileTextIcon,
  ClipboardSignature
} from 'lucide-react'
import Odontograma from './componentes/Odontograma'

// Tipos para os dados usados na página
interface Paciente {
  nome: string
  dataNascimento: string
  cpf: string
  contato: string
}

interface Triagem {
  pa: string
  hipertensao: string
  diabetes: string
  alergia: string
}

const AtendimentoOdontologicoPage: React.FC = () => {
  // Mock: dados do paciente e triagem (você pode buscar esses dados da API no futuro)
  const [dadosPaciente] = useState<Paciente>({
    nome: 'Maria Oliveira',
    dataNascimento: '1990-05-12',
    cpf: '123.456.789-00',
    contato: '(67) 99999-8888'
  })

  const [triagem] = useState<Triagem>({
    pa: '120x80',
    hipertensao: 'não',
    diabetes: 'sim',
    alergia: 'não'
  })

  // Campos do atendimento odontológico
  const [evolucao, setEvolucao] = useState<string>('')
  const [prescricao, setPrescricao] = useState<string>('')
  const [assinatura, setAssinatura] = useState<string | null>(null) // tipo string ou qualquer tipo que seu componente de assinatura usar

  // Alternância odontograma
  const [tipoOdontograma, setTipoOdontograma] = useState<
    'permanente' | 'deciduos'
  >('permanente')

  // Funções de ação
  const handleSalvar = () => toast.success('Atendimento salvo!')
  const handleImprimir = () => {
    window.print()
    toast.success('Enviando para impressão...')
  }
  const handleGerarPDF = () => toast.success('PDF gerado!')
  const handleNovoAtendimento = () => {
    setEvolucao('')
    setPrescricao('')
    setAssinatura(null)
    toast.success('Novo atendimento iniciado!')
  }

  return (
    <div className="min-h-screen bg-[#f8f7f7] p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-3xl font-bold text-slate-800 mb-1">
            Atendimento Odontológico
          </h1>
          <p className="text-slate-600">Ficha clínica do paciente</p>
        </div>

        {/* Accordion geral */}
        <Accordion type="multiple" className="w-full space-y-4">
          {/* Dados do Paciente */}
          <AccordionItem value="paciente">
            <Card>
              <AccordionTrigger className="text-base font-semibold flex items-center gap-2 px-6 py-4">
                <User className="text-blue-500" size={20} />
                <span>Dados do Paciente</span>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Nome</Label>
                    <Input value={dadosPaciente.nome} readOnly disabled />
                  </div>
                  <div>
                    <Label>Data de Nascimento</Label>
                    <Input
                      value={dadosPaciente.dataNascimento}
                      readOnly
                      disabled
                    />
                  </div>
                  <div>
                    <Label>CPF</Label>
                    <Input value={dadosPaciente.cpf} readOnly disabled />
                  </div>
                  <div>
                    <Label>Contato</Label>
                    <Input value={dadosPaciente.contato} readOnly disabled />
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Triagem */}
          <AccordionItem value="triagem">
            <Card>
              <AccordionTrigger className="text-base font-semibold flex items-center gap-2 px-6 py-4">
                <HeartPulse className="text-rose-500" size={20} />
                <span>Triagem</span>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>PA</Label>
                    <Input value={triagem.pa} readOnly disabled />
                  </div>
                  <div>
                    <Label>Hipertensão</Label>
                    <Input value={triagem.hipertensao} readOnly disabled />
                  </div>
                  <div>
                    <Label>Diabetes</Label>
                    <Input value={triagem.diabetes} readOnly disabled />
                  </div>
                  <div>
                    <Label>Alergia</Label>
                    <Input value={triagem.alergia} readOnly disabled />
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Odontograma */}
          <AccordionItem value="odontograma">
            <Card>
              <AccordionTrigger className="text-base font-semibold flex items-center gap-2 px-6 py-4">
                <Meh className="text-teal-500" size={20} />
                <span>Odontograma</span>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="p-6 flex flex-col items-center space-y-4">
                  <Odontograma />
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Evolução/Tratamento */}
          <AccordionItem value="evolucao">
            <Card>
              <AccordionTrigger className="text-base font-semibold flex items-center gap-2 px-6 py-4">
                <FileTextIcon className="text-indigo-500" size={20} />
                <span>Evolução / Tratamento</span>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="p-6">
                  <Label htmlFor="evolucao">
                    Descrição da evolução, condutas, procedimentos, materiais
                    usados
                  </Label>
                  <Textarea
                    id="evolucao"
                    className="mt-2 min-h-[120px]"
                    value={evolucao}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setEvolucao(e.target.value)
                    }
                    placeholder="Detalhe a evolução do caso, procedimentos realizados..."
                  />
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Prescrição/Orientações */}
          <AccordionItem value="prescricao">
            <Card>
              <AccordionTrigger className="text-base font-semibold flex items-center gap-2 px-6 py-4">
                <FileTextIcon className="text-purple-500" size={20} />
                <span>Prescrição / Orientações</span>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="p-6">
                  <Label htmlFor="prescricao">
                    Medicamentos prescritos, orientações pós-procedimento...
                  </Label>
                  <Textarea
                    id="prescricao"
                    className="mt-2 min-h-[100px]"
                    value={prescricao}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setPrescricao(e.target.value)
                    }
                    placeholder="Digite orientações e prescrições, se houver..."
                  />
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Assinatura Digital */}
          <AccordionItem value="assinatura">
            <Card>
              <AccordionTrigger className="text-base font-semibold flex items-center gap-2 px-6 py-4">
                <ClipboardSignature className="text-rose-400" size={20} />
                <span>Assinatura Digital</span>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="p-6">
                  {/* Substitua pelo seu componente de assinatura digital */}
                  <div className="border-2 border-dashed rounded-lg p-10 text-center text-slate-400">
                    Componente de assinatura digital aqui
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>

        {/* Botões de ação */}
        <div className="flex flex-wrap gap-4 justify-center pt-6 pb-10">
          <Button
            onClick={handleSalvar}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar Atendimento
          </Button>
          <Button
            onClick={handleGerarPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FileText className="mr-2 h-4 w-4" />
            Gerar PDF
          </Button>
          <Button
            onClick={handleImprimir}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button
            variant="outline"
            className="border-orange-600 text-orange-600 hover:bg-orange-50"
            onClick={handleNovoAtendimento}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Novo Atendimento
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AtendimentoOdontologicoPage
