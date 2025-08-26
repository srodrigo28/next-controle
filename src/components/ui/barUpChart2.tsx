"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis, ResponsiveContainer } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { format, parseISO, subDays, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interface para os dados do lançamento
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

// Tipo para os dados do gráfico de barras diárias
interface DailyChartDataItem {
    date: string; // Data formatada como string 'yyyy-MM-dd'
    entrada: number; // Total de entrada para aquele dia
}

// Configuração do gráfico  
const chartConfig = { /*** comentar aqui */
    entrada: {
        label: " Entradas Diárias",
        color: "var(--chart-1)", // Usando a primeira cor do shadcn/ui chart
    },
} satisfies ChartConfig;

export function DailyEntriesBarChart() {
    const [chartData, setChartData] = React.useState<DailyChartDataItem[]>([]);
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

    // Função para buscar e processar os dados do Supabase
    const fetchAndProcessDailyEntries = React.useCallback(async () => {
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

            // --- Gerenciamento de Datas Otimizado para Tipagem ---
            const todayDate = new Date(); // Objeto Date atual
            const thirtyDaysAgoDate = subDays(todayDate, 30); // Objeto Date 30 dias atrás

            // Formatar para string ISO para a query do Supabase
            const startDateString = format(thirtyDaysAgoDate, 'yyyy-MM-dd');
            const endDateString = format(todayDate, 'yyyy-MM-dd');

            const { data, error: fetchError } = await supabase
                .from("lancamentos_diarios")
                .select("data, valor, tipo")
                .eq("user_id", userId)
                .eq("tipo", "receita")
                .gte("data", startDateString) // Usar string formatada para Supabase
                .lte("data", endDateString)
                .order("data", { ascending: true });

            if (fetchError) {
                throw fetchError;
            }

            const rawLancamentos = data as Pick<Lancamento, 'data' | 'valor' | 'tipo'>[];

            const aggregatedData: { [key: string]: number } = {};
            rawLancamentos.forEach((lancamento) => {
                const valorNumerico = typeof lancamento.valor === 'number' ? lancamento.valor : parseFloat(String(lancamento.valor));
                if (isNaN(valorNumerico)) {
                    console.warn(`Valor inválido para lançamento: ${lancamento.valor}`);
                    return;
                }
                aggregatedData[lancamento.data] = (aggregatedData[lancamento.data] || 0) + valorNumerico;
            });

            // Preenche lacunas de dias sem entradas com valor 0
            const allDaysInPeriod = eachDayOfInterval({
                start: thirtyDaysAgoDate, // Passar objetos Date para date-fns
                end: todayDate           // Passar objetos Date para date-fns
            });

            const processedChartData: DailyChartDataItem[] = allDaysInPeriod.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd'); // Formatar para a chave no objeto
                return {
                    date: dateKey,
                    entrada: aggregatedData[dateKey] || 0,
                };
            });

            setChartData(processedChartData);

        } catch (err: any) {
            console.error("Erro ao buscar ou processar entradas diárias:", err.message);
            setError("Erro ao carregar dados do gráfico: " + err.message);
            setChartData([]);
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    React.useEffect(() => {
        fetchAndProcessDailyEntries();
    }, [fetchAndProcessDailyEntries]);

    const totalEntradas = React.useMemo(() => {
        return chartData.reduce((acc, item) => acc + item.entrada, 0);
    }, [chartData]);

    return (
        <Card className="h-[33rem] mb-2 flex flex-col">
            <CardHeader className="flex flex-row justify-between items-start pb-0">
                <div className="grid flex-1 gap-1">
                    <CardTitle className="text-sm md:text-xl">Entradas Diárias</CardTitle>
                    <CardDescription className="hidden md:block">Visão geral das entradas dos últimos 30 dias.</CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2 text-sm">
                    <div className="flex gap-2 leading-none font-medium text-right">
                        Total no período: {formatCurrency(totalEntradas)}
                    </div>
                    <div className="text-muted-foreground leading-none text-right md:text-xl">
                        Soma de todas as entradas dos últimos 30 dias.
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 mt-2 pb-10 mb-3 ">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-white">Carregando dados do gráfico...</div>
                ) : error ? (
                    <div className="flex items-center justify-center h-full text-red-500">{error}</div>
                ) : chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">Nenhuma entrada encontrada para o período selecionado.</div>
                ) : (
                    <ChartContainer config={chartConfig} className="h-full w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                accessibilityLayer
                                data={chartData}
                                className="h-[20rem]"
                                height={200}
                                margin={{
                                    top: 10,
                                    right: 0,
                                    left: 0,
                                    bottom: 10,
                                }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    tickFormatter={(value) => format(parseISO(value), 'dd/MM', { locale: ptBR })}
                                    minTickGap={20}
                                    className="pb-10"
                                />
                                <YAxis
                                    tickFormatter={(value: any) => formatCurrency(value)}
                                    axisLine={false}
                                    tickLine={false}
                                    tickMargin={8}
                                    className="text-xs h-44 bg-violet-600"
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                        className="flex flex-col bg-blue-600 h-52"
                                            labelFormatter={(value) => {
                                                const dateValue = typeof value === 'string' ? parseISO(value) : new Date(value);
                                                return format(dateValue, 'dd/MM/yyyy', { locale: ptBR });
                                            }}
                                            formatter={(value: any, name: any) => {
                                                const formattedValue = typeof value === 'number' ? formatCurrency(value) : String(value);
                                                const chartLabel = chartConfig[name as keyof typeof chartConfig]?.label || String(name);
                                                return [formattedValue, chartLabel];
                                            }}
                                            indicator="dot"
                                        />
                                    }
                                />
                                <Bar
                                    dataKey="entrada"
                                    fill="var(--color-entrada)"
                                    radius={8}
                                    className="bg-red-500"
                                >
                                <LabelList
                                    position="top"
                                    offset={12}
                                    className="fill-foreground !hidden"
                                    fontSize={12}
                                    formatter={(value: any) => formatCurrency(value)}
                                />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}