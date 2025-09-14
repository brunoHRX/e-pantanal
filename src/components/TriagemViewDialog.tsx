'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AtendimentoFluxo } from '@/services/fluxoService'
import { ageFromISO, safeDateTimeLabel, waitingTime } from '@/utils/functions'
import { Block } from '@/components/ui/block'

/**
 * Exibe TUDO que temos da triagem:
 * - Dados do paciente (nome, nascimento, idade, prontuário)
 * - Metadados (entrada, tempo de espera)
 * - Filas (especialidades aguardadas pelo fluxo)
 * - Campos da TriagemFormData:
 *    nomePaciente, idade, prontuario
 *    especialidades[] (objetos)
 *    situacao
 *    sinaisVitais: { peso, temperatura, fr, sato2, pa, fc }
 *    comorbidadeOp, comorbidadeDesc
 *    medicacao24h
 *    alergia, quaisAlergias
 *    coletadoPor, dataHora
 */
export function TriagemViewDialog({
  open,
  onOpenChange,
  atendimento
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  atendimento: AtendimentoFluxo | null
}) {
  const tri = atendimento?.triagem
  const pac = atendimento?.paciente

  // Alguns campos podem existir duplicados (ex.: nome/idade no form e no paciente).
  // Mostramos ambos quando fizer sentido, priorizando dados "confiáveis" do paciente
  // e usando os do form como referência visual do que foi escrito na triagem.
  const nomePacienteForm = tri?.nomePaciente
  const idadeTextoForm = tri?.idade // anos e meses (formatado)
  const prontuarioForm = tri?.prontuario

  // Especialidades aguardadas pelo fluxo (filas)
  const filas = atendimento?.filas ?? []
  // Especialidades selecionadas no formulário de triagem (objetos)
  const especialidadesForm = tri?.especialidades ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Triagem do Paciente</DialogTitle>
          <DialogDescription>Visualização: somente-leitura</DialogDescription>
        </DialogHeader>

        {!atendimento ? (
          <div className="text-sm text-muted-foreground">Carregando…</div>
        ) : (
          <div className="space-y-6">
            {/* ===== Cabeçalho Paciente / Metadados ===== */}
            <section className="space-y-1">
              <div>
                {/* Nome destacado */}
                <div className="font-semibold text-lg truncate">
                  {pac?.nome || nomePacienteForm || 'Paciente'}
                </div>

                {/* Metadados todos na mesma linha */}
                <div className="text-sm text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                  <span>
                    Nasc.:{' '}
                    {pac?.dataNascimento
                      ? safeDateTimeLabel(pac.dataNascimento)
                      : '—'}
                  </span>
                  <span>
                    Idade:{' '}
                    {pac?.dataNascimento
                      ? ageFromISO(pac.dataNascimento)
                      : idadeTextoForm || '—'}
                  </span>
                  <span>
                    Prontuário:{' '}
                    <b className="text-foreground">
                      {pac?.id ?? prontuarioForm ?? '—'}
                    </b>
                  </span>
                  <span>Entrada: {safeDateTimeLabel(atendimento.entrada)}</span>
                  <span>Espera: {waitingTime(atendimento.entrada)}</span>
                </div>
              </div>
            </section>

            {/* ===== Especialidades ===== */}
            {(filas.length > 0 || especialidadesForm.length > 0) && (
              <section className="space-y-2">
                {filas.length > 0 && (
                  <Block label="Especialidades em espera (Fila)">
                    <div className="flex flex-wrap gap-2">
                      {filas.map((f, i) => (
                        <Badge
                          key={`fila-${i}`}
                          variant={f.atendido == 0 ? 'default' : 'secondary'}
                          className="whitespace-nowrap"
                        >
                          {f.fila?.especialidade?.nome ?? 'Especialidade'}
                        </Badge>
                      ))}
                    </div>
                  </Block>
                )}

                {especialidadesForm.length > 0 && (
                  <Block label="Especialidades selecionadas na triagem">
                    <div className="flex flex-wrap gap-2">
                      {especialidadesForm.map((esp: any) => (
                        <Badge key={`esp-${esp.id}`} variant="outline">
                          {esp?.nome ?? 'Especialidade'}
                        </Badge>
                      ))}
                    </div>
                  </Block>
                )}
              </section>
            )}

            {/* ===== Situação / Queixa ===== */}
            <FieldIf label="Situação / Queixa Principal" exists={tri?.situacao}>
              {tri?.situacao}
            </FieldIf>

            {/* ===== Sinais Vitais ===== */}
            {tri?.sinaisVitais && (
              <section>
                <SectionTitle>Sinais vitais</SectionTitle>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-sm">
                  {renderVital('peso', tri.sinaisVitais.peso)}
                  {renderVital('temperatura', tri.sinaisVitais.temperatura)}
                  {renderVital('fr', tri.sinaisVitais.fr)}
                  {renderVital('sato2', tri.sinaisVitais.sato2)}
                  {renderVital('pa', tri.sinaisVitais.pa)}
                  {renderVital('fc', tri.sinaisVitais.fc)}
                </div>
              </section>
            )}

            {/* ===== Comorbidades / Medicações / Alergias ===== */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldIf
                label="Comorbidades"
                exists={tri?.comorbidadeOp || tri?.comorbidadeDesc}
              >
                <KeyValue k="Opção" v={tri?.comorbidadeOp} />
                {tri?.comorbidadeOp === 'Sim' && (
                  <KeyValue k="Descrição" v={tri?.comorbidadeDesc} />
                )}
              </FieldIf>

              <FieldIf
                label="Medicação nas últimas 24h"
                exists={tri?.medicacao24h}
              >
                {tri?.medicacao24h}
              </FieldIf>

              <FieldIf label="Alergias" exists={true}>
                <KeyValue
                  k="Possui alergia?"
                  v={
                    tri?.alergia === 'sim'
                      ? 'Sim'
                      : tri?.alergia === 'não'
                      ? 'Não'
                      : '—'
                  }
                />
                {tri?.alergia === 'sim' && (
                  <KeyValue k="Quais" v={tri?.quaisAlergias} />
                )}
              </FieldIf>
            </section>

            {/* ===== Informações da Coleta / Usuário ===== */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldIf
                label="Coleta (informado na triagem)"
                exists={tri?.coletadoPor || tri?.dataHora}
              >
                {tri?.coletadoPor && (
                  <KeyValue k="Profissional" v={tri.coletadoPor} />
                )}
                {tri?.dataHora && <KeyValue k="Data/Hora" v={tri.dataHora} />}
              </FieldIf>

              <FieldIf label="Usuário (sistema)" exists={tri?.usuario?.usuario}>
                {tri?.usuario?.usuario}
              </FieldIf>
            </section>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ==================== Helpers visuais ==================== */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-medium mb-2">{children}</div>
}

function labelVital(key: string) {
  const map: Record<string, string> = {
    peso: 'Peso (kg)',
    temperatura: 'Temperatura (°C)',
    fr: 'FR (irpm)',
    sato2: 'SpO₂ (%)',
    pa: 'PA (mmHg)',
    fc: 'FC (bpm)'
  }
  return map[key] ?? key
}

function VitalBox({ k, v }: { k: string; v?: string }) {
  if (!v || String(v).trim() === '') return null
  return (
    <div className="rounded  p-2">
      <div className="text-muted-foreground">{labelVital(k)}</div>
      <div className="font-medium">{v}</div>
    </div>
  )
}
function renderVital(k: string, v?: string) {
  return <VitalBox key={k} k={k} v={v} />
}

function KeyValue({ k, v }: { k: string; v?: string | number | null }) {
  if (v === null || v === undefined || String(v).trim?.() === '') {
    return (
      <div className="text-sm">
        <span className="text-muted-foreground">{k}: </span> —
      </div>
    )
  }
  return (
    <div className="text-sm">
      <span className="text-muted-foreground">{k}: </span>
      <span className="font-medium text-foreground">{String(v)}</span>
    </div>
  )
}

function FieldIf({
  label,
  exists,
  children
}: {
  label: string
  exists?: unknown
  children: React.ReactNode
}) {
  const has =
    exists !== null &&
    exists !== undefined &&
    (typeof exists !== 'string' || String(exists).trim() !== '')

  const childHasContent =
    !!children &&
    (typeof children !== 'string' || String(children).trim() !== '')

  if (!has && !childHasContent) return null

  return (
    <div className="space-y-1">
      <div className="text-sm font-medium">{label}</div>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  )
}
