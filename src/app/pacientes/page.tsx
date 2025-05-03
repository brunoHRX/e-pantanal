"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientCard } from "./components/PatientCard";
import { SearchIcon } from "lucide-react";

export default function PacientesPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [searched, setSearched] = useState(false);

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

  async function handleSearch() {
    // TODO: chamar sua API/Supabase para buscar pacientes pelo nome ou prontuário
    // Exemplo:
    // const { data } = await supabase
    //   .from('pacientes')
    //   .select('*')
    //   .ilike('nome', `%${query}%`);
    // setResults(data || []);
    setSearched(true);
  }

  return (
    <div className="p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Pacientes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Pesquise por nome ou prontuário"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSearch} className="flex items-center">
            <SearchIcon className="mr-2 h-4 w-4" /> Buscar
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
