// src/app/patients/components/PatientCard.tsx

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
  sex: string;
  ultimaAtualizacao: string;   // ISO string
  filiacao1: string;
  filiacao2: string;
  fazendaReferencia: string;
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
            <span className="font-medium">Data de Nascimento:</span>{' '}
            {formatDate(paciente.dataNascimento)}
          </div>
          <div>
            <span className="font-medium">Sexo:</span>{' '}
            {paciente.sex}
          </div>
          <div>
            <span className="font-medium">Nome da Mãe:</span>{' '}
            {paciente.filiacao1}
          </div>
          <div>
            <span className="font-medium">Nome do Pai:</span>{' '}
            {paciente.filiacao2}
          </div>
          <div className="sm:col-span-2">
            <span className="font-medium">Local:</span>{' '}
            {paciente.fazendaReferencia}
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          <span className="font-medium">Última Atualização:</span>{' '}
          {formatDate(paciente.ultimaAtualizacao)}
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
