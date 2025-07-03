"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts" // Adicionado YAxis, Tooltip, ResponsiveContainer
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
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from '@/lib/supabase'; // Importar o cliente Supabase
import { useRouter } from 'next/navigation'; // Para redirecionar se não houver sessão
import { format, parseISO, subDays } from 'date-fns'; // Adicionado subDays para o filtro de tempo
import { ptBR } from 'date-fns/locale'; // Para localização em português

// Interface para os dados do lançamento (repetida para clareza no arquivo, mas pode ser importada)
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

// Tipo para os dados do gráfico de área
interface ChartDataItem {
    date: string;
    entrada: number; // Receitas
    saida: number;   // Despesas
}

// Configuração do gráfico
const chartConfig = {
    // Mantido 'visitors' por causa da estrutura original, mas pode ser removido se não for usado.
    // É mais limpo ter apenas as chaves que realmente serão usadas como dataKey.
    // visitors: { label: "Visitors" },
    entrada: { label: "Entradas", color: "var(--chart-1)" }, // Receita: Verde
    saida: { label: "Saídas", color: "var(--chart-2)" },   // Despesa: Vermelho
} satisfies ChartConfig

export function FaturamentoAreaChart() {
    const [chartData, setChartData] = React.useState<ChartDataItem[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);
    const [timeRange, setTimeRange] = React.useState("180d"); // Estado para o filtro de tempo

    const router = useRouter();

    // Função auxiliar para formatar o valor como moeda (igual à da tabela/gráfico de barras)
    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    // Função para buscar e processar os dados do Supabase
    const fetchAndProcessFaturamento = React.useCallback(async () => {
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
                .select("*")
                .eq("user_id", userId)
                .order("data", { ascending: true }); // Ordena por data

            if (fetchError) {
                throw fetchError;
            }

            const rawLancamentos = data as Lancamento[];

            // Processa os lançamentos para agrupar por data
            const aggregatedData: { [key: string]: { entrada: number; saida: number } } = {};

            rawLancamentos.forEach((lancamento) => {
                const dateKey = lancamento.data; // Data no formato ISO (e.g., '2024-07-03')
                if (!aggregatedData[dateKey]) {
                    aggregatedData[dateKey] = { entrada: 0, saida: 0 };
                }

                if (lancamento.tipo === 'receita') {
                    aggregatedData[dateKey].entrada += lancamento.valor;
                } else {
                    aggregatedData[dateKey].saida += lancamento.valor;
                }
            });

            // Converte o objeto agregado em um array para o gráfico
            let processedChartData: ChartDataItem[] = Object.keys(aggregatedData)
                .map((date) => ({
                    date: date,
                    entrada: aggregatedData[date].entrada,
                    saida: aggregatedData[date].saida,
                }))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Garante ordem cronológica

            // --- Aplicar filtro de tempo ---
            const today = new Date();
            let daysToSubtract = 180; // Padrão
            if (timeRange === "90d") {
                daysToSubtract = 90;
            } else if (timeRange === "30d") {
                daysToSubtract = 30;
            } else if (timeRange === "7d") {
                daysToSubtract = 7;
            }

            const startDate = subDays(today, daysToSubtract); // Usa subDays do date-fns

            processedChartData = processedChartData.filter((item) => {
                const itemDate = parseISO(item.date); // Converte a string ISO para Date
                return itemDate >= startDate;
            });

            setChartData(processedChartData);

        } catch (err: any) {
            console.error("Erro ao buscar ou processar lançamentos para o gráfico de área:", err.message);
            setError("Erro ao carregar dados do gráfico: " + err.message);
            setChartData([]);
        } finally {
            setIsLoading(false);
        }
    }, [router, timeRange]); // Adiciona timeRange como dependência para re-executar o fetch quando muda

    React.useEffect(() => {
        fetchAndProcessFaturamento();
    }, [fetchAndProcessFaturamento]);

    return (
        <Card className="py-0">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle>Faturamento por Período</CardTitle>
                    <CardDescription>
                        Resumo em barras faturamento
                    </CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger
                        className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex bg-slate-800 text-white border-slate-700"
                        aria-label="Select a value"
                    >
                        <SelectValue placeholder="Último 6 meses" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl bg-slate-800 text-white border-slate-700">
                        <SelectItem value="180d" className="rounded-lg"> Último 6 meses </SelectItem>
                        <SelectItem value="90d" className="rounded-lg"> Último 3 meses </SelectItem>
                        <SelectItem value="30d" className="rounded-lg"> Últimos 30 dias </SelectItem>
                        <SelectItem value="7d" className="rounded-lg"> Últimos 7 dias </SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                {isLoading ? (
                    <div className="flex items-center justify-center h-[250px] text-white">Carregando dados do gráfico...</div>
                ) : error ? (
                    <div className="flex items-center justify-center h-[250px] text-red-500">{error}</div>
                ) : chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-[250px] text-gray-400">Nenhum lançamento encontrado para o período selecionado.</div>
                ) : (
                    <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}> {/* Usar chartData aqui */}
                                <defs>
                                    <linearGradient id="fillentrada" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-entrada)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="var(--color-entrada)" stopOpacity={0.1} />
                                    </linearGradient>
                                    <linearGradient id="fillsaida" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-saida)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="var(--color-saida)" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    minTickGap={32}
                                    tickFormatter={(value) => {
                                        // Formata para dd/MM
                                        return format(parseISO(value), 'dd/MM', { locale: ptBR });
                                    }}
                                />
                                <YAxis
                                    tickFormatter={(value: any) => formatCurrency(value)} // Formata os valores do eixo Y como moeda
                                    axisLine={false}
                                    tickLine={false}
                                    tickMargin={8}
                                    className="text-xs"
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            labelFormatter={(value) => {
                                                // Garante que o valor é uma string antes de parseISO
                                                const dateValue = typeof value === 'string' ? parseISO(value) : new Date(value);
                                                return format(dateValue, 'dd/MM/yyyy', { locale: ptBR });
                                            }}
                                            // Adiciona formatter para os valores de entrada/saída
                                            formatter={(value: any, name: any) => {
                                                const formattedValue = typeof value === 'number' ? formatCurrency(value) : String(value);
                                                const chartLabel = chartConfig[name as keyof typeof chartConfig]?.label || String(name);
                                                return [formattedValue, chartLabel];
                                            }}
                                            indicator="dot"
                                        />
                                    }
                                />
                                <Area
                                    dataKey="saida"
                                    type="natural"
                                    fill="url(#fillsaida)"
                                    stroke="var(--color-saida)"
                                    stackId="a" // Permite empilhar áreas (útil se entrada e saída forem positivas)
                                />
                                <Area
                                    dataKey="entrada"
                                    type="natural"
                                    fill="url(#fillentrada)"
                                    stroke="var(--color-entrada)"
                                    stackId="a" // Permite empilhar áreas
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}