"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import React from "react";

// Interface do paciente (mesma do contexto de busca)
export interface Patient {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: string;      // ISO string (YYYY-MM-DD)
  sexo: string;
  ultimaAtualizacao: string;   // ISO string
  nomeMae: string;
  local: string;
}

interface PatientCardProps {
  paciente: Patient;
  onUpdate?: (id: string) => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({ paciente, onUpdate }) => {
  // Formatação de datas
  const formatDate = (isoDate: string) => {
    try {
      return format(parseISO(isoDate), 'dd/MM/yyyy');
    } catch {
      return isoDate;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{paciente.nome}</CardTitle>
        <p className="text-sm text-muted-foreground">CPF: {paciente.cpf}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">Data de Nasc.:</span>{' '}
            {formatDate(paciente.dataNascimento)}
          </div>
          <div>
            <span className="font-medium">Sexo:</span>{' '}
            {paciente.sexo}
          </div>
          <div>
            <span className="font-medium">Última Atualização:</span>{' '}
            {formatDate(paciente.ultimaAtualizacao)}
          </div>
          <div>
            <span className="font-medium">Nome da Mãe:</span>{' '}
            {paciente.nomeMae}
          </div>
          <div className="sm:col-span-2">
            <span className="font-medium">Local:</span>{' '}
            {paciente.local}
          </div>
        </div>

        <Button
          variant="outline"
          className="mt-4"
          onClick={() => onUpdate && onUpdate(paciente.id)}
        >
          Atualizar Cadastro
        </Button>
      </CardContent>
    </Card>
  );
};