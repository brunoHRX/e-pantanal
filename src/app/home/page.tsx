"use client";

import Image from "next/image";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function HomePage() {
  const messages = [
    {
      id: 1,
      title: "Bem-vindo ao E-Pantanal",
      description: "Aqui você acompanha as principais notícias e avisos do sistema.",
      image: "/images/home-welcome.png",
    },
    {
      id: 2,
      title: "Novos Pacientes Cadastrados",
      description: "Confira os últimos pacientes adicionados à base de dados.",
      image: "/images/home-patients.png",
    },
    {
      id: 3,
      title: "Relatórios Disponíveis",
      description: "Acesse e exporte relatórios de atendimentos e estatísticas.",
      image: "/images/home-reports.png",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Painel Principal</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {messages.map((msg) => (
          <Card key={msg.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle>{msg.title}</CardTitle>
              <CardDescription>{msg.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <div className="relative h-48 w-auto border rounded-lg overflow-hidden">
                <Image
                  src={msg.image}
                  alt={msg.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
