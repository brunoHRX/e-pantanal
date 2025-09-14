'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm, SubmitHandler } from 'react-hook-form'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { login, LoginPayload } from '@/services/auth'

interface LoginFormValues {
  usuario: string
  password: string
}

export default function LoginPage() {
  const form = useForm<LoginFormValues>({
    defaultValues: { usuario: '', password: '' }
  })
  const {
    control,
    handleSubmit,
    formState: { isSubmitting }
  } = form
  const router = useRouter()

  const onSubmit: SubmitHandler<LoginFormValues> = async values => {
    try {
      const payload: LoginPayload = {
        username: values.usuario,
        password: values.password
      }
      const { token, usuario } = await login(payload)
      localStorage.setItem('authToken', token)
      localStorage.setItem('userData', JSON.stringify(usuario))
      router.push('/home')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Falha na autenticação'
      alert(message)
    }
  }

  return (
    <main className="min-h-screen w-full bg-muted flex items-center justify-center p-4">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-lg md:grid-cols-2">
        {/* Coluna esquerda (form) */}
        <section className="flex items-center justify-center p-8 md:p-12">
          <Card className="w-full max-w-md border-0 shadow-none">
            <CardHeader className="space-y-6 p-0">
              {/* Logo nova */}
              <div className="flex items-center gap-3">
                <Image
                  src="/images/e-pantanal-logo.png" // coloque sua logo aqui
                  alt="Logo e-Pantanal"
                  width={931}
                  height={330}
                  className="h-max w-auto"
                  priority
                />
                <span className="sr-only">e-Pantanal</span>
              </div>

              <div>
                <CardTitle className="text-3xl md:text-4xl leading-tight">
                  Bem-vindo ao{' '}
                  <span className="text-pakistan_green-700">e-Pantanal</span>
                </CardTitle>
                <CardDescription className="mt-1">
                  Faça login na sua conta para continuar
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="mt-6 p-0">
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
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-pakistan_green-600 hover:bg-pakistan_green-700"
                  >
                    {isSubmitting ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </section>

        {/* Coluna direita (arte/gradiente cortada) */}
        <aside className="relative hidden md:block">
          {/* Fundo gradiente */}
          <div className="absolute inset-0 bg-gradient-to-br  from-amber-200 via-lime-300 to-pakistan_green-200" />

          {/* Área arredondada + recorte das bordas */}
          <div className="relative z-10 h-full p-6 rounded-3xl overflow-hidden">
            {/* Stack vertical centralizado */}
            <div className="flex h-full w-full flex-col items-center justify-center gap-8">
              {/* Logo 1 */}
              <div className="relative w-full max-w-[460px] aspect-[16/9]">
                <Image
                  src="/images/alma.png"
                  alt="Logo patrocinadora ALMA"
                  fill
                  className="object-contain"
                  sizes="(min-width: 1024px) 460px, (min-width: 768px) 50vw, 100vw"
                  priority
                />
              </div>

              {/* Logo 2 */}
              <div className="relative w-full max-w-[460px] aspect-[16/9]">
                <Image
                  src="/images/med-pantanal.png"
                  alt="Logo patrocinadora Med Pantanal"
                  fill
                  className="object-contain"
                  sizes="(min-width: 1024px) 460px, (min-width: 768px) 50vw, 100vw"
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
