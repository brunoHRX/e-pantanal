"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientCard } from "./components/PatientCard";
import { SearchIcon, SquarePlus } from "lucide-react";



export default function PacientesPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const DUMMY_PATIENTS: Patient[] = [
    {
      id: "1",
      nome: "Maria Silva",
      cpf: "123.456.789-00",
      dataNascimento: "1990-05-12",
      sexo: "Feminino",
      ultimaAtualizacao: "2025-04-20",
      nomeMae: "Ana Silva",
      local: "Campo Grande",
    },
    {
      id: "2",
      nome: "João Souza",
      cpf: "987.654.321-00",
      dataNascimento: "1985-11-03",
      sexo: "Masculino",
      ultimaAtualizacao: "2025-02-15",
      nomeMae: "Clara Souza",
      local: "Dourados",
    },
  ];
  
  interface Patient {
    id: string;
    nome: string;
    cpf: string;
    dataNascimento: string;
    sexo: string;
    ultimaAtualizacao: string;
    nomeMae: string;
    local: string;
  }

  async function newRegistration() {
    router.push("/patients/newPatient");
  }

  async function handleSearch() {
    setLoading(true);
    setError(null);
  
    if (process.env.NODE_ENV === "development") {
      // Simula atraso de rede
      await new Promise((r) => setTimeout(r, 500));
      setResults(
        DUMMY_PATIENTS.filter((p) =>
          p.nome.toLowerCase().includes(query.toLowerCase())
        )
      );
    } else {
      // sua chamada real ao Supabase
      // const { data, error } = await supabase
      //   .from("pacientes")
      //   .select(/*…*/)
      //   .ilike("nome", `%${query}%`);
      // // …mesma lógica de map / error
      console.log("Chamada real ao Supabase", query);
    }
  
    setSearched(true);
    setLoading(false);
  }

  return (
    <div className="p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl ">Painel de Pacientes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-2 ">
            <Input
              placeholder="Pesquise por nome ou prontuário"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
          <Button onClick={handleSearch} className="flex items-center py-2 px-4">
            <SearchIcon className="mr-1 h-4 w-4" /> Buscar
          </Button>
          <Button onClick={newRegistration} className="flex items-center bg-pakistan_green-600">
            <SquarePlus className="mr-1 h-4 w-4" /> Novo Cadastro
          </Button>
        </CardContent>
      </Card>

      {searched && results.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">Nenhum paciente encontrado.</p>
      )}

      <div className="grid gap-4">
        {results.map((paciente) => (
          <PatientCard key={paciente.id} paciente={paciente} />
        ))}
      </div>
    </div>
  );
}
function setLoading(arg0: boolean) {
  throw new Error("Function not implemented.");
}

function setError(arg0: null) {
  throw new Error("Function not implemented.");
}

