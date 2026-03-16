'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { AtendimentoGerencialFormType } from "@/types/Gerencial"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    getAll,
    deleteElement
} from "@/services/gerencialService"
import { toast } from "sonner"

export default function GerencialListPage() {
    const router = useRouter()
    const [data, setData] = useState<AtendimentoGerencialFormType[]>([])
    const [loading, setLoading] = useState(true)

    async function loadData() {
        setLoading(true)
        try {
            const res = await getAll()
            setData(res)
        } catch (err) {
            console.error(err)
            toast.error("Erro ao carregar atendimentos")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    async function handleDelete(id?: number) {
        if (!id) return
        if (!confirm("Deseja realmente excluir este atendimento?")) return
        try {
            await deleteElement(id)
            setData(old => old.filter(x => x.id !== id))
        } catch (err) {
            console.error(err)
            toast.error("Erro ao excluir")
        }
    }

    const columns = [
        {   accessorKey: "id", header: "ID" },
        { accessorKey: "paciente_nome", header: "Paciente" },
        { accessorKey: "data_atendimento", header: "Data" },
        {
            id: "acoes",
            header: "Ações",
            cell: ({ row }: any) => {
                const item = row.original
                return (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={() =>
                                router.push(`/atendimento/gerencial/formulario?id=${item.id}`)
                            }
                        >
                            Editar
                        </Button>

                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(item.id)}
                        >
                            Excluir
                        </Button>
                    </div>
                )
            }
        }
    ]

    return (
        <div className="min-h-screen bg-[#f8f7f7] p-4">
            <div className="max-w-6xl mx-auto">
                <Card>
                    <CardHeader className="flex items-start justify-between gap-4">
                        <CardTitle className="text-2xl">Atendimentos Gerenciais</CardTitle>
                        <Button
                            onClick={() =>
                                router.push("/atendimento/gerencial/formulario")
                            }
                        >
                            Novo Atendimento
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <DataTable
                            columns={columns}
                            data={data}
                            loading={loading}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}