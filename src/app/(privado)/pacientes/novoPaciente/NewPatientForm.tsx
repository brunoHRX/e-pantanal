'use client'

import { useForm } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { useEffect, useState } from 'react'
import { Patient, createPatient, getPatientById, updatePatient } from '@/services/patientService'

const SEX_OPTIONS = ['Masculino', 'Feminino', 'Outro']
const COR_RACA_OPCOES = [
  'Branca',
  'Preta',
  'Parda',
  'Amarela',
  'Indígena',
  'Não sabe/Não quis declarar'
]
const ESTADO_CIVIL_OPCOES = [
  'Solteiro(a)',
  'Casado(a)',
  'Divorciado(a)',
  'Viúvo(a)',
  'União estável'
]
const TIPO_SANGUINEO = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
  'Não sabe'
]
const INSTRUCAO_OPCOES = [
  'Sem Instrução',
  'Alfabetizado',
  'Fundamental',
  'Médio',
  'Superior',
  'Não declarado'
]
const RELACAO_LOCAL = ['Trabalhador', 'Familiar de Trabalhador', 'Outro']
const UF = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO'
]
const LOGRADOURO_TIPOS = [
  'Rua',
  'Avenida',
  'Travessa',
  'Alameda',
  'Praça',
  'Estrada',
  'Rodovia',
  'Outro'
]
const PAISES = ['Brasil', 'Argentina', 'Paraguai', 'Estados Unidos', 'Outro']

export default function NovoPacientePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get('id')
  const [loading, setLoading] = useState(false)
  const form = useForm<Patient & { [key: string]: any }>({
    defaultValues: {
      nome: '',
      nomeSocial: '',
      dataNascimento: '',
      cpf: '',
      sex: '',
      cor: '',
      etnia: '',
      filiacao1: '',
      desconheceMae: false,
      filiacao2: '',
      desconhecePai: false,
      pne: false,
      nacionalidade: 'Brasileira',
      paisNascimento: 'Brasil',
      municipioNascimento: '',
      paisResidencia: 'Brasil',
      cep: '',
      uf: '',
      municipio: '',
      bairro: '',
      tipoLogradouro: '',
      logradouro: '',
      numero: '',
      semNumero: false,
      complemento: '',
      pontoReferencia: '',
      infoComplementar: '',
      relacaoLocal: '',
      fazendaReferencia: '',
      estadoCivil: '',
      tipoSanguineo: '',
      ocupacao: '',
      escolaridade: ''
    }
  })

  // const nacionalidade = form.watch('nacionalidade')
  // const paisResidencia = form.watch('paisResidencia')
  const desconheceMae = form.watch('desconheceMae')
  const desconhecePai = form.watch('desconhecePai')
  const semNumero = form.watch('semNumero')
  // const relacaoLocal = form.watch('relacaoLocal')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getPatientById(id)
      .then(data => {
        console.log(data);
        
        form.reset(data)
      })
      .finally(() => setLoading(false))
  }, [id])

  async function onSubmit(data: Patient) {
    setLoading(true)
    try {
      console.log(data);      
      if (id) await updatePatient(data.id, data)
      else await createPatient(data)
      router.push('/pacientes')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function onCancel() {
    router.back()
  }

  return (
    <div className="p-6 flex justify-center">
      <Card className="w-full max-w-6xl shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="text-2xl font-bold mb-4 my-3">
                Cadastro de Paciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* DADOS PESSOAIS */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Dados Pessoais</h3>
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input {...field} className="mt-1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nomeSocial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Social</FormLabel>
                        <FormControl>
                          <Input {...field} className="mt-1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mt-4 items-center">
                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem className="w-full flex flex-col items-center">
                        <FormLabel className="mb-1 text-center w-full">
                          CPF
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="mt-1 w-full text-center"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dataNascimento"
                    render={({ field }) => (
                      <FormItem className="w-full flex flex-col items-center">
                        <FormLabel className="mb-1 text-center w-full">
                          Data de Nascimento
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="mt-1 w-full text-center"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sexo"
                    render={({ field }) => (
                      <FormItem className="w-full flex flex-col items-center">
                        <FormLabel className="mb-1 text-center w-full">
                          Sexo
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="mt-1 w-full text-center truncate">
                              <SelectValue
                                placeholder="Selecione"
                                className="truncate"
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SEX_OPTIONS.map(opt => (
                              <SelectItem
                                key={opt}
                                value={opt}
                                className="truncate"
                              >
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cor"
                    render={({ field }) => (
                      <FormItem className="w-full flex flex-col items-center">
                        <FormLabel className="mb-1 text-center w-full">
                          Raça/Cor
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="mt-1 w-full text-center truncate">
                              <SelectValue
                                placeholder="Selecione"
                                className="truncate"
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COR_RACA_OPCOES.map(opt => (
                              <SelectItem
                                key={opt}
                                value={opt}
                                className="truncate"
                              >
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="etnia"
                    render={({ field }) => (
                      <FormItem className="w-full flex flex-col items-center">
                        <FormLabel className="mb-1 text-center w-full">
                          Etnia
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="mt-1 w-full text-center"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pne"
                    render={({ field }) => (
                      <FormItem className="w-full flex flex-col mt-6">
                        <FormControl>
                          <div className="flex w-full gap-2">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="scale-110"
                            />
                            <FormLabel className="text-center">PNE</FormLabel>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {/* Nome da Mãe */}
                  <FormField
                    control={form.control}
                    name="filiacao1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Mãe</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="mt-1"
                            disabled={desconheceMae}
                          />
                        </FormControl>
                        <div className="flex items-center gap-2 mt-1">
                          <Checkbox
                            checked={desconheceMae}
                            onCheckedChange={v =>
                              form.setValue('desconheceMae', !!v)
                            }
                          />
                          <Label>Desconhece essa informação</Label>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Nome do Pai */}
                  <FormField
                    control={form.control}
                    name="filiacao2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Pai</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="mt-1"
                            disabled={desconhecePai}
                          />
                        </FormControl>
                        <div className="flex items-center gap-2 mt-1">
                          <Checkbox
                            checked={desconhecePai}
                            onCheckedChange={v =>
                              form.setValue('desconhecePai', !!v)
                            }
                          />
                          <Label>Desconhece essa informação</Label>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* ENDEREÇO */}
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Endereço / Residência
                </h3>
                <Separator className="mb-4" />

                {/* País de Residência - UF - Município - CEP */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <FormField
                    control={form.control}
                    name="paisResidencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>País de Residência</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="mt-1 min-w-[170px] w-full">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PAISES.map(opt => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="uf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UF</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="mt-1 w-full">
                              <SelectValue placeholder="UF" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {UF.map(opt => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="municipio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Município</FormLabel>
                        <FormControl>
                          <Input {...field} className="mt-1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input {...field} className="mt-1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Bairro - Tipo de Logradouro - Logradouro - Número [+ sem número] */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
                  <FormField
                    control={form.control}
                    name="bairro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input {...field} className="mt-1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tipoLogradouro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Logradouro</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="mt-1 min-w-[120px] w-full">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LOGRADOURO_TIPOS.map(opt => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="logradouro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logradouro</FormLabel>
                        <FormControl>
                          <Input {...field} className="mt-1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="numero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              {...field}
                              className="flex-1"
                              disabled={semNumero}
                            />
                            <Checkbox
                              checked={semNumero}
                              onCheckedChange={v =>
                                form.setValue('semNumero', !!v)
                              }
                            />
                            <span>Sem número</span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Complemento - Ponto de Referência */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField
                    control={form.control}
                    name="complemento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento</FormLabel>
                        <FormControl>
                          <Input {...field} className="mt-1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pontoReferencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ponto de Referência</FormLabel>
                        <FormControl>
                          <Input {...field} className="mt-1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* INFORMAÇÕES ADICIONAIS */}
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Informações Adicionais
                </h3>
                <Separator className="mb-4" />

                {/* Relação local e "Se Familiar ou Outro" na mesma linha */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <FormField
                    control={form.control}
                    name="relacaoLocal"
                    render={({ field }) => (
                      <FormItem className="md:col-span-1">
                        <FormLabel>Relação Local</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="mt-1 w-full">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {RELACAO_LOCAL.map(opt => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="relacaoFamiliar"
                    render={({ field }) => (
                      <FormItem className="md:col-span-3">
                        <FormLabel>
                          Se Familiar ou Outro — especifique a relação
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="mt-1"
                            placeholder="Descreva a relação familiar ou outra relação"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Fazenda de referência, linha inteira */}
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="fazendaReferencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fazenda de Referência</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="mt-1"
                            placeholder="Relacione a fazenda ou local de referência do paciente"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Estado Civil, Tipo Sanguíneo, Escolaridade juntos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 mb-6">
                  <FormField
                    control={form.control}
                    name="estadoCivil"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado Civil</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ESTADO_CIVIL_OPCOES.map(opt => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tipoSanguineo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo Sanguíneo</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIPO_SANGUINEO.map(opt => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="escolaridade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Escolaridade</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {INSTRUCAO_OPCOES.map(opt => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4 mt-10">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : id ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
