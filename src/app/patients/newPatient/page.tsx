"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Opções de campos
const COR_RACA_OPCOES = [
  "Branca",
  "Preta",
  "Parda",
  "Amarela",
  "Indígena",
  "Não sabe/Não quis declarar",
];
const GENERO_OPCOES = ["Masculino", "Feminino", "Outro", "Não declarado"];
const TIPO_SANGUINEO = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Não sabe"];
const RELACAO_LOCAL = ["Trabalhador", "Familiar de Trabalhador", "Outro"];
const INSTRUCAO_OPCOES = [
  "Sem Instrução",
  "Alfabetizado",
  "Fundamental",
  "Médio",
  "Superior",
  "Não declarado",
];

type NewPatientForm = {
  nome: string;
  dataNascimento: string;
  cpf: string;
  filiacao1: string;
  filiacao2: string;
  cor: string;
  genero: string;
  tipoSanguineo: string;
  relacaoLocal: string;
  fazendaReferencia?: string;
  escolaridade: string;
  alfabetizado: boolean;
  pne: boolean;
};

export default function NewPatientPage() {
  const router = useRouter();
  const form = useForm<NewPatientForm>({
    defaultValues: {
      nome: "",
      dataNascimento: "",
      cpf: "",
      filiacao1: "",
      filiacao2: "",
      cor: "",
      genero: "Não declarado",
      tipoSanguineo: "",
      relacaoLocal: "Outro",
      fazendaReferencia: "",
      escolaridade: "Não declarado",
      pne: false,
    },
  });

  const relacao = form.watch("relacaoLocal");

  function onCancel() {
    router.back();
  }

  function onSubmit(data: NewPatientForm) {
    console.log("Salvando novo paciente:", data);
    // TODO: integrar com backend
    router.push("/patients");
  }

  return (
    <div className="p-6">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
            <CardHeader >
              <CardTitle className="my-6">Novo Cadastro de Paciente</CardTitle>
            </CardHeader>

            <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-8 my-6">
              {/* Nome (5/6) e Data (1/6) */}
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem className="col-span-6 md:col-span-5">
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataNascimento"
                render={({ field }) => (
                  <FormItem className="col-span-6 md:col-span-1">
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mãe e Pai lado a lado (3/6 cada) */}
              <FormField
                control={form.control}
                name="filiacao1"
                render={({ field }) => (
                  <FormItem className="col-span-6 md:col-span-3">
                    <FormLabel>Mãe/Responsável</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="filiacao2"
                render={({ field }) => (
                  <FormItem className="col-span-6 md:col-span-3">
                    <FormLabel>Pai/Responsável</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Linha única com 6 campos, cada 1/6 */}
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem className="col-span-6 md:col-span-1">
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cor"
                render={({ field }) => (
                  <FormItem className="col-span-6 md:col-span-1">
                    <FormLabel>Raça/Cor</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {COR_RACA_OPCOES.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="genero"
                render={({ field }) => (
                  <FormItem className="col-span-6 md:col-span-1">
                    <FormLabel>Gênero</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENERO_OPCOES.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipoSanguineo"
                render={({ field }) => (
                  <FormItem className="col-span-6 md:col-span-1">
                    <FormLabel>Tipo Sanguíneo</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPO_SANGUINEO.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="escolaridade"
                render={({ field }) => (
                  <FormItem className="col-span-6 md:col-span-1">
                    <FormLabel>Escolaridade</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {INSTRUCAO_OPCOES.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="relacaoLocal"
                render={({ field }) => (
                  <FormItem className="col-span-6 md:col-span-1">
                    <FormLabel>Relação Local</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {RELACAO_LOCAL.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fazenda Referência opcional em nova linha */}
              {relacao === "Trabalhador" || relacao === "Familiar de Trabalhador" ? (
                <FormField
                  control={form.control}
                  name="fazendaReferencia"
                  render={({ field }) => (
                    <FormItem className="col-span-6">
                      <FormLabel>Fazenda Referência</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              {/* Checkboxes: Alfabetizado e PNE */}
              <FormField
                control={form.control}
                name="pne"
                render={({ field }) => (
                  <FormItem className="col-span-6 md:col-span-3 flex items-center">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="ml-2">PNE (Necessidades Especiais)</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex justify-end gap-4 my-2">
              <Button className="w-22" variant="outline" onClick={onCancel}>Cancelar</Button>
              <Button className="w-22" type="submit"> Salvar </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
