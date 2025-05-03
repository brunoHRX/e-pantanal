"use client";

import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
// Tipagem do formulário de login
type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const form = useForm<LoginFormValues>({ defaultValues: { email: "", password: "" } });
  const router = useRouter();
  function onSubmit(values: LoginFormValues) {
    // TODO: integrar autenticação com Supabase
    console.log('Dados do login:', values);
    router.push("/home");
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen">
      {/* Ilustração responsiva ao lado esquerdo em desktop, acima em mobile */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-amber-50 fixed md:relative md:top-0 top-0 left-0 m-0 p-0">
        <Image
          src="/images/logo-sistema.svg"
          alt="Logo do sistema"
          width={1500}
          height={1500}
          priority
          className="max-w-xs md:max-w-full max-h-full md:max-h-full "
        />
      </div>

      {/* Formulário de login ao lado direito em desktop, abaixo em mobile */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Bem-vindo ao <span className="text-pakistan_green-700">E-Pantanal</span> </CardTitle>
            <CardDescription>Faça login na sua conta para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="usuario@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="bg-pakistan_green-600 w-full">
                  Entrar
                </Button>
              </form>
            </Form>

            {/* <p className="text-sm text-center mt-4">
              Não tem uma conta?{' '}
              <Link href="/signup" className="text-blue-600 hover:underline">
                Cadastre-se
              </Link>
            </p> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}