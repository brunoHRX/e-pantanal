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
import {
  ageFromISO,
  badgeClass,
  computeFilaStatus,
  safeDateLabel,
  safeDateTimeLabel,
  waitingTime
} from '@/utils/functions'

export function TriagemViewDialog({
  open,
  onOpenChange,
  atendimento
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  atendimento: AtendimentoFluxo
}) {
  const possuiComorbidades =
    atendimento.triagem?.comorbidades !== '' ? true : false
  const possuiAlergias = atendimento.triagem?.alergias !== '' ? true : false

  async function handleEditar() {
    const id = atendimento.paciente.id
    const triagemId = atendimento.triagem?.id ?? 0
    if (triagemId !== 0) {
      const url = `/triagem/novo?id=${id}&triagemId=${triagemId}`;
      window.open(url, '_blank');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* SAFE: largura/altura limitadas + scroll interno + sem overflow horizontal */}
      <DialogContent
        className="
        w-full 
        max-w-[95vw] sm:max-w-4xl 
        p-4 sm:p-6 
        overflow-x-hidden 
        max-h-[85vh] sm:max-h-[80vh] 
        overflow-y-auto 
        overscroll-contain
      "
      >
        <DialogHeader className="min-w-0">
          <DialogTitle className="truncate">Triagem do Paciente</DialogTitle>
          <DialogDescription className="truncate">
            Visualização: somente-leitura
          </DialogDescription>
        </DialogHeader>

        {!atendimento ? (
          <div className="text-sm text-muted-foreground">Carregando…</div>
        ) : (
          <div className="space-y-6 min-w-0">
            {/* ===== Cabeçalho Paciente / Metadados ===== */}
            <section className="space-y-1 min-w-0">
              <div>
                {/* Nome destacado */}
                <div className="font-semibold text-lg truncate">
                  {atendimento.paciente.nome}
                </div>

                {/* Metadados todos na mesma linha (quebrando se precisar) */}
                <div className="text-sm text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 break-words">
                  <span>
                    Nasc.:{' '}
                    {atendimento.paciente.dataNascimento
                      ? safeDateLabel(atendimento.paciente.dataNascimento)
                      : '—'}
                  </span>
                  <span>
                    Idade:{' '}
                    {atendimento.paciente.dataNascimento
                      ? ageFromISO(atendimento.paciente.dataNascimento)
                      : '—'}
                  </span>
                  <span>
                    Prontuário:{' '}
                    <b className="text-foreground">
                      {atendimento.paciente.id ?? '—'}
                    </b>
                  </span>
                  <span>Entrada: {safeDateTimeLabel(atendimento.entrada)}</span>
                  <span>Espera: {waitingTime(atendimento.entrada)}</span>
                </div>
              </div>
            </section>

            {/* ===== Especialidades ===== */}
            {atendimento.filas && (
              <div className="flex flex-wrap gap-2">
                {atendimento.filas.map((f, i) => {
                  const status = computeFilaStatus(atendimento, f)
                  const name = f?.fila?.especialidade?.nome ?? 'Especialidade'
                  return (
                    <Badge
                      key={i}
                      className={`px-2 py-0.5 text-xs whitespace-nowrap ${badgeClass(
                        status
                      )}`}
                    >
                      {name}
                    </Badge>
                  )
                })}
              </div>
            )}

            {/* ===== Situação / Queixa ===== */}
            <FieldIf
              label="Situação / Queixa Principal"
              exists={atendimento.triagem?.queixa}
            >
              <div className="whitespace-pre-wrap break-words">
                {atendimento.triagem?.queixa}
              </div>
            </FieldIf>

            {/* ===== Sinais Vitais ===== */}
            {atendimento.triagem && (
              <section className="min-w-0">
                <SectionTitle>Sinais vitais</SectionTitle>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-sm">
                  {renderVital('peso', String(atendimento.triagem.peso))}
                  {renderVital(
                    'temperatura',
                    String(atendimento.triagem.temperatura)
                  )}
                  {renderVital('fr', atendimento.triagem.fr)}
                  {renderVital('sato2', atendimento.triagem.sato2)}
                  {renderVital('pa', atendimento.triagem.pa)}
                  {renderVital('fc', atendimento.triagem.fc)}
                </div>
              </section>
            )}

            {/* ===== Comorbidades / Medicações / Alergias ===== */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
              {atendimento.triagem && (
                <FieldIf
                  label="Comorbidades"
                  exists={atendimento.triagem.comorbidades}
                >
                  <KeyValue k="Opção" v={possuiComorbidades ? 'Sim' : 'Não'} />
                  {possuiComorbidades && (
                    <KeyValue
                      k="Descrição"
                      v={atendimento.triagem.comorbidades}
                    />
                  )}
                </FieldIf>
              )}

              {atendimento.triagem && (
                <FieldIf
                  label="Medicação nas últimas 24h"
                  exists={atendimento.triagem.medicacao24h}
                >
                  <div className="break-words">
                    {atendimento.triagem.medicacao24h}
                  </div>
                </FieldIf>
              )}

              {atendimento.triagem && (
                <FieldIf label="Alergias" exists={atendimento.triagem.alergias}>
                  <KeyValue
                    k="Possui alergia?"
                    v={possuiAlergias ? 'Sim' : 'Não'}
                  />
                  {possuiAlergias && (
                    <KeyValue k="Quais" v={atendimento.triagem.alergias} />
                  )}
                </FieldIf>
              )}
            </section>

            {/* ===== Informações da Coleta / Usuário ===== */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
              {atendimento.triagem && (
                <FieldIf
                  label="Coleta (informado na triagem)"
                  exists={atendimento.triagem?.usuario}
                >
                  {atendimento.triagem.usuario && (
                    <KeyValue
                      k="Profissional"
                      v={atendimento.triagem.usuario.usuario}
                    />
                  )}
                  {atendimento.triagem.data && (
                    <KeyValue
                      k="Data/Hora"
                      v={safeDateLabel(atendimento.triagem.data)}
                    />
                  )}
                </FieldIf>
              )}

              {atendimento.triagem?.usuario && (
                <FieldIf
                  label="Usuário (sistema)"
                  exists={atendimento.triagem.usuario.usuario}
                >
                  {atendimento.triagem.usuario.usuario}
                </FieldIf>
              )}
            </section>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => handleEditar()}>
                Editar
              </Button>
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
    <div className="rounded p-2">
      <div className="text-muted-foreground">{labelVital(k)}</div>
      <div className="font-medium break-words">{v}</div>
    </div>
  )
}
function renderVital(k: string, v?: string) {
  return <VitalBox key={k} k={k} v={v} />
}

function KeyValue({ k, v }: { k: string; v?: string | number | null }) {
  if (
    v === null ||
    v === undefined ||
    (typeof v === 'string' && v.trim() === '')
  ) {
    return (
      <div className="text-sm">
        <span className="text-muted-foreground">{k}: </span> —
      </div>
    )
  }
  return (
    <div className="text-sm break-words">
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
    <div className="space-y-1 min-w-0">
      <div className="text-sm font-medium">{label}</div>
      <div className="text-sm text-foreground break-words">{children}</div>
    </div>
  )
}
