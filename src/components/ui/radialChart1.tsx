"use client"

import * as React from "react"
import {
    Label,
    PolarGrid,
    PolarRadiusAxis,
    RadialBar,
    RadialBarChart,
} from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Interface para os dados do lançamento (repetida para clareza, pode ser importada se estiver em outro arquivo)
interface Lancamento {
    id: string;
    user_id: string;
    data: string; // Formato desolate-MM-DD
    descricao: string;
    valor: number;
    categoria: string;
    tipo: "receita" | "despesa";
    observacoes: string;
}

// Tipo para os dados do gráfico radial de total de receitas
interface TotalRevenueChartDataItem {
    name: string; // Pode ser "Total Receitas"
    value: number; // O valor total das receitas
    fill: string;  // Cor da barra
}

// Configuração do gráfico
const chartConfig = {
    revenue: { // Chave para o nosso dado
        label: "Total Receitas",
        color: "var(--chart-1)", // Usando a primeira cor do shadcn/ui chart
    },
} satisfies ChartConfig;

export function TotalRevenueRadialChart() {
    const [totalRevenue, setTotalRevenue] = React.useState<number>(0);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);

    const router = useRouter();

    // Função auxiliar para formatar o valor como moeda (BRL)
    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    // Função para buscar e processar as receitas totais
    const fetchTotalRevenue = React.useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const {
                data: { session },
                error: sessionError,
            } = await supabase.auth.getSession();

            if (sessionError || !session) {
                console.error("Sessão não encontrada. Redirecionando para login.");
                router.push("/login");
                return;
            }

            const userId = session.user.id;
            const { data, error: fetchError } = await supabase
                .from("lancamentos_diarios")
                .select("valor, tipo") // Seleciona apenas valor e tipo
                .eq("user_id", userId)
                .eq("tipo", "receita"); // Filtra apenas receitas

            if (fetchError) {
                throw fetchError;
            }

            const rawLancamentos = data as Pick<Lancamento, 'valor' | 'tipo'>[];

            // Soma todos os valores de receitas
            const sumOfRevenues = rawLancamentos.reduce((sum, lancamento) => {
                const valorNumerico = typeof lancamento.valor === 'number' ? lancamento.valor : parseFloat(String(lancamento.valor));
                return sum + (isNaN(valorNumerico) ? 0 : valorNumerico);
            }, 0);

            setTotalRevenue(sumOfRevenues);

        } catch (err: any) {
            console.error("Erro ao buscar total de receitas:", err.message);
            setError("Erro ao carregar total de receitas: " + err.message);
            setTotalRevenue(0); // Garante que o valor seja 0 em caso de erro
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    React.useEffect(() => {
        fetchTotalRevenue();
    }, [fetchTotalRevenue]);

    // O chartData agora é dinâmico, baseado no totalRevenue
    const chartData: TotalRevenueChartDataItem[] = [
        {
            name: "Total Receitas",
            value: totalRevenue,
            fill: chartConfig.revenue.color,
        },
    ];

    return (
        <Card className="flex flex-col md:h-[37rem] h-[20rem]">
            <CardHeader className="items-center pb-0"> {/* Removido bg-red-500 */}
                <CardTitle>Total de Receitas</CardTitle>
                <CardDescription>Soma de todas as entradas registradas.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                {isLoading ? (
                    <div className="flex items-center justify-center h-[250px] text-white">Carregando total...</div>
                ) : error ? (
                    <div className="flex items-center justify-center h-[250px] text-red-500">{error}</div>
                ) : totalRevenue === 0 ? (
                    <div className="flex items-center justify-center h-[250px] text-gray-400">Nenhuma receita encontrada.</div>
                ) : (
                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square max-h-[250px]"
                    >
                        <RadialBarChart
                            data={chartData}
                            //endAngle={100} // Ajuste conforme o que deseja representar. Para um valor absoluto, um ângulo fixo pode não ser ideal.
                            // Pode-se calcular um endAngle dinamicamente se houver um "total máximo"
                            // Por exemplo: endAngle={totalRevenue / MAX_EXPECTED_REVENUE * 360}
                            // Por simplicidade, vou manter um ângulo fixo se não houver um máximo definido.
                            // Para exibir apenas uma barra única, talvez seja melhor usar um endAngle fixo como 360
                            // ou um valor que garanta a barra completa se 'value' for sempre o total.
                            endAngle={360} // Para exibir a barra completa como representação do total
                            innerRadius={80}
                            outerRadius={140}
                        >
                            <PolarGrid
                                gridType="circle"
                                radialLines={false}
                                stroke="none"
                                className="first:fill-muted last:fill-background"
                                polarRadius={[86, 74]}
                                
                            />
                            {/* dataKey="value" porque é onde o valor total está no chartData */}
                            <RadialBar dataKey="value" fill={chartConfig.revenue.color} background />
                            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-foreground text-xl md:text-2xl font-bold"
                                                    >
                                                        {formatCurrency(totalRevenue)} {/* Usa o valor dinâmico */}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 24}
                                                        className="fill-muted-foreground"
                                                    >
                                                        Total Recebido
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                    }}
                                />
                            </PolarRadiusAxis>
                        </RadialBarChart>
                    </ChartContainer>
                )}
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 leading-none font-medium">
                    {/* Placeholder para crescimento. Você precisaria de dados históricos para calcular */}
                    Total de receitas: **{formatCurrency(totalRevenue)}**
                    {/* <TrendingUp className="h-4 w-4" /> */}
                </div>
                <div className="text-muted-foreground leading-none">
                    Valor total de todas as receitas registradas.
                </div>
            </CardFooter>
        </Card>
    )
}