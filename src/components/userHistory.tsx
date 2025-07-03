"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase" // Importe o cliente Supabase

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip } from "recharts"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"

// Definição de dados fictícios (você usaria os dados do Supabase aqui)
const chartData = [
  { date: "2024-01-01", entrada: 180, saida: 170 },
  { date: "2024-01-02", entrada: 210, saida: 160 },
  { date: "2024-01-03", entrada: 199, saida: 220 },
  // Mais dados...
]

const chartConfig: ChartConfig = {
  views: {
    label: "Page Views",
  },
  desktop: {
    label: "Vendas À vista",
    color: "var(--chart-2)",
  },
  mobile: {
    label: "Vendas Crédito",
    color: "var(--chart-1)",
  },
}

export function ChartBarInteractive() {
  const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>("desktop")
  const [user, setUser] = useState<any>(null)  // Estado para armazenar o usuário
  const [loading, setLoading] = useState(true)  // Estado de loading

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession()

      if (data?.session) {
        setUser(data.session.user)
      } else {
        setUser(null)
      }

      setLoading(false)  // Finaliza o loading após a resposta
    }

    fetchSession()  // Chama a função para obter a sessão
  }, [])

  // Condicional para renderizar o conteúdo enquanto o estado de loading está ativo
  if (loading) {
    return <div>Carregando...</div>
  }

  // Se não houver usuário, mostra mensagem de não autenticado
  if (!user) {
    return <div>Você não está autenticado.</div>
  }

  // Se o usuário estiver autenticado, renderiza o gráfico
  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle>Resumo de vendas</CardTitle>
          <CardDescription>
            Total de vendas últimos 3 meses - Usuário: {user.email}
          </CardDescription>
        </div>
        <div className="flex">
          {["desktop", "mobile"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {chartData.reduce((acc, curr) => acc + curr[chart], 0).toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <Tooltip />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}