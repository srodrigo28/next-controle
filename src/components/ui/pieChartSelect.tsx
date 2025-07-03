'use client';

import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase"; // Importar o cliente Supabase
import { useRouter } from "next/navigation"; // Para redirecionar se não houver sessão

export const description = "An interactive pie chart";

// Dados estáticos para os meses (mantidos para as fatias do gráfico, se aplicável)
const desktopData = [
  { month: "january", desktop: 186, fill: "var(--color-january)" },
  { month: "february", desktop: 305, fill: "var(--color-february)" },
  { month: "march", desktop: 237, fill: "var(--color-march)" },
  { month: "april", desktop: 173, fill: "var(--color-april)" },
  { month: "may", desktop: 209, fill: "var(--color-may)" },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
  },
  mobile: {
    label: "Mobile",
  },
  january: {
    label: "Janeiro",
    color: "var(--chart-1)",
  },
  february: {
    label: "Fevereiro",
    color: "var(--chart-2)",
  },
  march: {
    label: "Março",
    color: "var(--chart-3)",
  },
  april: {
    label: "Abril",
    color: "var(--chart-4)",
  },
  may: {
    label: "Maio",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function ChartPieInteractive() {
  const id = "pie-interactive";
  const [activeMonth, setActiveMonth] = React.useState(desktopData[0].month);
  const [totalReceita, setTotalReceita] = React.useState<number | null>(null); // Novo estado para o total de receitas
  const [chartLoading, setChartLoading] = React.useState<boolean>(true); // Estado de carregamento para os dados do gráfico
  const [chartError, setChartError] = React.useState<string | null>(null); // Estado de erro para os dados do gráfico

  const router = useRouter(); // Inicializa o router

  // Função auxiliar para formatar o valor como moeda
  const formatCurrency = (value: number | null): string => {
    if (value === null || isNaN(value)) {
      return "R$ 0,00";
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Efeito para buscar o total de receitas do usuário logado
  React.useEffect(() => {
    const fetchTotalReceita = async () => {
      setChartLoading(true);
      setChartError(null);
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.error("Sessão não encontrada. Redirecionando para login.");
          router.push("/login"); // Redireciona para a página de login se não houver sessão
          return;
        }

        const userId = session.user.id;

        // Buscar todos os lançamentos do tipo 'receita' para o usuário
        const { data: lancamentos, error: fetchError } = await supabase
          .from("lancamentos_diarios")
          .select("valor")
          .eq("user_id", userId)
          .eq("tipo", "receita");

        if (fetchError) {
          throw fetchError;
        }

        // Somar os valores das receitas
        const sumReceita = lancamentos.reduce((sum, entry) => sum + entry.valor, 0);
        setTotalReceita(sumReceita);

      } catch (err: any) {
        console.error("Erro ao buscar total de receitas:", err.message);
        setChartError("Erro ao carregar dados de receita.");
        setTotalReceita(0); // Garante que o valor seja 0 em caso de erro
      } finally {
        setChartLoading(false);
      }
    };

    fetchTotalReceita();
  }, [router]); // Dependência do router para garantir que o efeito seja re-executado se a rota mudar (embora aqui seja mais para o push inicial)

  const months = React.useMemo(() => desktopData.map((item) => item.month), []);

  return (
    <Card data-chart={id} className="flex flex-col h-[30rem]">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Gráfico resumo</CardTitle>
          <CardDescription>Selecione o mês</CardDescription>
        </div>
        <Select value={activeMonth} onValueChange={setActiveMonth}>
          <SelectTrigger
            className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {months.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig];

              if (!config) {
                return null;
              }

              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{
                        backgroundColor: `var(----foreground-${key})`,
                      }}
                    />
                    {config?.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        {chartLoading ? (
          <div className="flex items-center justify-center h-full text-white">Carregando dados...</div>
        ) : chartError ? (
          <div className="flex items-center justify-center h-full text-red-500">{chartError}</div>
        ) : (
          <ChartContainer
            id={id}
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={desktopData} // Mantém os dados estáticos para as fatias do gráfico
                dataKey="desktop"
                nameKey="month"
                innerRadius={60}
                strokeWidth={5}
                activeShape={({
                  outerRadius = 0,
                  ...props
                }: PieSectorDataItem) => (
                  <g>
                    <Sector {...props} outerRadius={outerRadius + 10} />
                    <Sector
                      {...props}
                      outerRadius={outerRadius + 25}
                      innerRadius={outerRadius + 12}
                    />
                  </g>
                )}
              >
                <Label
                  content={() => (
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        fontSize="24"
                        fontWeight="bold"
                        fill="#F0F0F0" // Cor do texto
                      >
                        {formatCurrency(totalReceita)} {/* Exibe o total de receitas formatado */}
                      </tspan>
                      <tspan
                        x="50%"
                        dy="1.5em"
                        fontSize="12"
                        fill="#F0F0F0" // Cor do texto
                      >
                        Total de Receitas
                      </tspan>
                    </text>
                  )}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
