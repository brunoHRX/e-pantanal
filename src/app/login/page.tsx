"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login, LoginPayload } from "@/services/auth";

// Tipagem do formulário de login
interface LoginFormValues {
  usuario: string;
  password: string;
}

export default function LoginPage() {
  const form = useForm<LoginFormValues>({ defaultValues: { usuario: "", password: "" } });
  const { control, handleSubmit, formState: { isSubmitting } } = form;
  const router = useRouter();

  async function onSubmit(values: LoginFormValues) {
    try {
      const payload: LoginPayload = {
        username: values.usuario,
        password: values.password,
      };
      const { token } = await login(payload);

      // Armazena o token (você pode usar cookies, Context, etc.)
      localStorage.setItem('authToken', token);

      router.push('/home');
    } catch (error: any) {
      // Exibe mensagem de erro (pode ser melhorada para usar FormMessage)
      alert(error.message || 'Falha na autenticação');
    }
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
          className="max-w-xs md:max-w-full max-h-full md:max-h-full"
        />
      </div>

      {/* Formulário de login ao lado direito em desktop, abaixo em mobile */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-white">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>
              Bem-vindo ao <span className="text-pakistan_green-700">E-Pantanal</span>
            </CardTitle>
            <CardDescription>Faça login na sua conta para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={control}
                  name="usuario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuário</FormLabel>
                      <FormControl>
                        <Input placeholder="admin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
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

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-pakistan_green-600 w-full"
                >
                  {isSubmitting ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
