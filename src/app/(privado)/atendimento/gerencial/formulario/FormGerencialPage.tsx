"use client";

import {
    Medicamento,
    getAll as getAllMedicamentos
} from "@/services/medicamentoService"
import {
    Procedimento,
    getAll as getAllProcedimentos
} from "@/services/procedimentoService"
import {
    Especialidade,
    getAll as getAllEspecialidades
} from '@/services/especialidadeService'
import {
    Usuario,
    getAll as getAllMedicos
} from "@/services/usuariosService"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Patient } from "@/types/Patient"
import { FormProvider, useForm } from "react-hook-form"
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage
} from '@/components/ui/form'
import { Input } from "@/components/ui/input";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@/components/ui/accordion'
import { getAllPatients } from "@/services/patientService";
import AtendimentoForm from "../components/AtendimentoForm";
import { AtendimentoGerencialFormType } from "@/types/Gerencial";
import AutocompletePortal from "@/components/autocomplete-portal"
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { createElement, getElementById, updateElement } from "@/services/gerencialService";

export default function GerencialPage() {
    const params = useParams()
    const id = params?.id ? Number(params.id) : 0
    const [carregando, setCarregando] = useState(true)
    const router = useRouter()

    // Atendimentos
    const [atendimentos, setAtendimentos] = useState<AtendimentoGerencialFormType | null>(null)

    // Procedimentos
    const [procedimentos, setProcedimentos] = useState<Procedimento[]>([])

    // Pacientes
    const [pacientes, setPacientes] = useState<Patient[]>([])

    // Médicos
    const [medicos, setMedicos] = useState<Usuario[]>([])

    // Medicamentos
    const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])

    // Especialidades
    const [especialidades, setEspecialidades] = useState<Especialidade[]>([])

    const formPaciente = useForm<AtendimentoGerencialFormType>({
        defaultValues: {
            id: 0,
            paciente_id: 0,
            paciente_nome: '',
            paciente_data_nascimento: '',
            atendimentos: [],
            triagem: {
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
                queixa: ''
            }
        }
    });

    const [novoPaciente, setNovoPaciente] = useState<boolean>(false)
    const toggleNovoPaciente = () => {
        setNovoPaciente(!novoPaciente)
    }

    // Carregamento inicial
    useEffect(() => {
        handleSearch()
    }, [])

    useEffect(() => {
        if (id) {
            handleBuscarAtendimento()
        }
    }, [id])

    const handleSearch = async () => {
        setCarregando(true);
        try {
            const [m, p, esp, u, pat] = await Promise.all([
                getAllMedicamentos(),
                getAllProcedimentos(),
                getAllEspecialidades(),
                getAllMedicos(),
                getAllPatients(),
            ])
            setMedicamentos(m)
            setProcedimentos(p)
            setEspecialidades(esp)
            setMedicos(u.filter(u => u.especialidade_id != 5 && u.id != 1))
            setPacientes(pat)
        } catch (err) {
            toast.error((err as Error).message)
        } finally {
            setCarregando(false)
        }
    }

    const handleRegistrarAtendimento = async () => {
        try {
            const data = formPaciente.getValues()

            if (!id || id === 0) {
                await createElement(data)
                toast.success("Atendimento registrado com sucesso")
                router.push(`/atendimento/gerencial/formulario/`)
            } else {
                await updateElement(data)
                toast.success("Atendimento atualizado com sucesso")
            }

        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    const handleBuscarAtendimento = async () => {
        if (!id || id === 0) return

        try {
            const data = await getElementById(id)

            formPaciente.reset(data)
            setAtendimentos(data)

        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    if (carregando) {
        return (
            <div className="min-h-screen bg-[#f8f7f7] p-4">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex items-center gap-3 pt-2">
                        <span className="text-sm text-muted-foreground">
                            Carregando informações…
                        </span>
                    </div>

                    <Card>
                        <CardContent className="p-6">
                            <div className="animate-pulse space-y-4">
                                <div className="h-6 bg-muted rounded w-1/3" />
                                <div className="h-4 bg-muted rounded w-1/2" />
                                <div className="h-48 bg-muted rounded" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f8f7f7] p-4">
            <div className="max-w-6xl mx-auto">
                <Card>
                    <CardHeader className="flex items-start justify-between gap-4">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/atendimento/gerencial/')}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
                        </Button>
                        <CardTitle className="text-2xl">Lançamento de atendimento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                    <FormProvider {...formPaciente}>
                        {/* Section 1 — Info Paciente */}
                        <section className="border rounded-lg overflow-visible">
                            <Accordion type="single" collapsible defaultValue="paciente">
                                <AccordionItem value="paciente" className="border-b overflow-visible">
                                    <AccordionTrigger className="px-4 py-3 text-base font-semibold">
                                        Paciente
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 py-3 text-base font-semibold overflow-visible">
                                        <Form {...formPaciente}>
                                            <form>
                                                <div className={`grid ${novoPaciente ? "grid-cols-[1fr_auto]" : "grid-cols-[1fr_1fr_auto]"} md:grid-cols-4 gap-6`}>
                                                    {!novoPaciente && (<FormField
                                                        control={formPaciente.control}
                                                        name={`paciente_id`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Paciente</FormLabel>
                                                                <FormControl>
                                                                    <AutocompletePortal
                                                                        id={`paciente_id`}
                                                                        items={pacientes}
                                                                        labelField="nome"
                                                                        value={pacientes.find(e => e.id === field.value)?.nome || ""}
                                                                        placeholder="Digite o nome do Paciente"
                                                                        onChange={() => { }}
                                                                        onSelect={(item) => { field.onChange(item.id) }}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />)}

                                                    {novoPaciente && (
                                                        <FormField
                                                            control={formPaciente.control}
                                                            name={`paciente_nome`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Medicamento</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} className="mt-1" />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )}



                                                    {novoPaciente && (
                                                        <FormField
                                                            control={formPaciente.control}
                                                            name={`paciente_data_nascimento`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Data de nascimento</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="date" {...field} className="mt-1" />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )}

                                                    <Button
                                                        type="button"
                                                        className="self-end"
                                                        onClick={() => toggleNovoPaciente()}
                                                    >
                                                        {!novoPaciente ? 'Novo' : 'Buscar'}
                                                    </Button>
                                                </div>
                                            </form>
                                        </Form>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </section>

                        {/* Section 2 — Triagem */}
                        <section className="border rounded-lg">
                            <Accordion type="single" collapsible defaultValue="triagem">
                                <AccordionItem value="triagem" className="border-b">
                                    <AccordionTrigger className="px-4 py-3 text-base font-semibold">
                                        Triagem
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 py-3 text-base font-semibold">
                                        <Form {...formPaciente}>
                                            <form>
                                                <div className="grid grid-cols-6 md:grid-cols-6 gap-6">
                                                    <FormField
                                                        control={formPaciente.control}
                                                        name="triagem.peso"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Peso</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} className="mt-1" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={formPaciente.control}
                                                        name="triagem.temperatura"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Temp °C</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} className="mt-1" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={formPaciente.control}
                                                        name="triagem.fr"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>FR (irpm)</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} className="mt-1" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={formPaciente.control}
                                                        name="triagem.sato2"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Sato² (%)</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} className="mt-1" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={formPaciente.control}
                                                        name="triagem.pa"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>PA (mmHg)</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} className="mt-1" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={formPaciente.control}
                                                        name="triagem.fc"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>FC (bpm)</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} className="mt-1" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={formPaciente.control}
                                                        name="triagem.comorbidades"
                                                        render={({ field }) => (
                                                            <FormItem className="col-span-3">
                                                                <FormLabel>Comorbidades</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} className="mt-1" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={formPaciente.control}
                                                        name="triagem.alergias"
                                                        render={({ field }) => (
                                                            <FormItem className="col-span-3">
                                                                <FormLabel>Alergias</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} className="mt-1" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={formPaciente.control}
                                                        name="triagem.medicacao24h"
                                                        render={({ field }) => (
                                                            <FormItem className="col-span-2">
                                                                <FormLabel>Medicação nas últimas 24h</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} className="mt-1" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={formPaciente.control}
                                                        name="triagem.queixa"
                                                        render={({ field }) => (
                                                            <FormItem className="col-span-4">
                                                                <FormLabel>Queixa</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} className="mt-1" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </form>
                                        </Form>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </section>

                        {/* Section 3 — Atendimento */}
                        <section className="border rounded-lg">
                            <Accordion type="single" collapsible defaultValue="atendimento">
                                <AccordionItem value="atendimento" className="border-b">
                                    <AccordionTrigger className="px-4 py-3 text-base font-semibold">
                                        Atendimentos
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 py-3 text-base font-semibold">
                                        <AtendimentoForm
                                            form={formPaciente}
                                            medicos={medicos}
                                            procedimentos={procedimentos}
                                            medicamentos={medicamentos}
                                            especialidades={especialidades}
                                        />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </section>

                        {/* Section 4 — Finalização */}
                        <section className="border rounded-lg"><Button className="w-full" onClick={() => handleRegistrarAtendimento()} >Registrar atendimento</Button></section>
                        </FormProvider>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}