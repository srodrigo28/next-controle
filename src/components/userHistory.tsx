'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interface para os dados do lançamento
interface Lancamento {
    id: string;
    user_id: string;
    data: string; // Formato YYYY-MM-DD
    descricao: string;
    valor: number;
    categoria: string;
    tipo: 'receita' | 'despesa';
    observacoes: string;
}

// Tipo para os dados do gráfico
interface ChartDataItem {
    date: string;
    receita: number;
    despesa: number;
}

// Configuração do gráfico
const chartConfig = {
    valor: {
        label: 'Valor',
    },
    receita: {
        label: 'Receitas',
        color: 'var(--chart-1)', // Cor para receitas (verde)
    },
    despesa: {
        label: 'Despesas',
        color: 'var(--chart-2)', // Cor para despesas (vermelho)
    },
} satisfies ChartConfig;

export function FaturamentoAreaChart2() {
    const [chartData, setChartData] = React.useState<ChartDataItem[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);
    const [activeChart, setActiveChart] =
        React.useState<keyof typeof chartConfig>('receita'); // Começa com receitas ativas

    const router = useRouter();

    // Função para buscar e processar os dados
    const fetchAndProcessLancamentos = React.useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const {
                data: { session },
                error: sessionError,
            } = await supabase.auth.getSession();

            if (sessionError || !session) {
                console.error('Sessão não encontrada. Redirecionando para login.');
                router.push('/login');
                return;
            }

            const userId = session.user.id;
            const { data, error: fetchError } = await supabase
                .from('lancamentos_diarios')
                .select('*')
                .eq('user_id', userId)
                .order('data', { ascending: true }); // Ordena por data para o gráfico

            if (fetchError) {
                throw fetchError;
            }

            const rawLancamentos = data as Lancamento[];

            // Processa os lançamentos para agrupar por data e somar receitas/despesas
            const aggregatedData: { [key: string]: { receita: number; despesa: number } } = {};

            rawLancamentos.forEach((lancamento) => {
                const dateKey = lancamento.data; // A data já está no formato YYYY-MM-DD
                if (!aggregatedData[dateKey]) {
                    aggregatedData[dateKey] = { receita: 0, despesa: 0 };
                }

                if (lancamento.tipo === 'receita') {
                    aggregatedData[dateKey].receita += lancamento.valor;
                } else {
                    aggregatedData[dateKey].despesa += lancamento.valor;
                }
            });

            // Converte o objeto agregado em um array para o gráfico
            const processedChartData: ChartDataItem[] = Object.keys(aggregatedData)
                .map((date) => ({
                    date: date,
                    receita: aggregatedData[date].receita,
                    despesa: aggregatedData[date].despesa,
                }))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Garante a ordem cronológica

            setChartData(processedChartData);
        } catch (err: any) {
            console.error('Erro ao buscar ou processar lançamentos para o gráfico:', err.message);
            setError('Erro ao carregar dados do gráfico: ' + err.message);
            setChartData([]);
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    React.useEffect(() => {
        fetchAndProcessLancamentos();
    }, [fetchAndProcessLancamentos]);

    // Calcula os totais para exibir nos botões
    const total = React.useMemo(
        () => ({
            receita: chartData.reduce((acc, curr) => acc + curr.receita, 0),
            despesa: chartData.reduce((acc, curr) => acc + curr.despesa, 0),
        }),
        [chartData]
    );

    // Formata o valor para exibição em moeda (BRL)
    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    return (
        <Card className="py-0">
            <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
                    <CardTitle>Balanço de Lançamentos</CardTitle>
                    <CardDescription>Visão geral das Receitas e Despesas por data</CardDescription>
                </div>
                <div className="flex">
                    {['receita', 'despesa'].map((key) => {
                        const chart = key as keyof typeof chartConfig;
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
                                    {formatCurrency(total[key as keyof typeof total])}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                {isLoading ? (
                    <div className="flex items-center justify-center h-[250px] text-white">Carregando dados do gráfico...</div>
                ) : error ? (
                    <div className="flex items-center justify-center h-[250px] text-red-500">{error}</div>
                ) : chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-[250px] text-gray-400">Nenhum lançamento encontrado para exibir no gráfico.</div>
                ) : (
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[250px] w-full"
                    >
                        <ResponsiveContainer width="100%" height="100%">
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
                                        // Formata a data para dd/MM
                                        return format(parseISO(value), 'dd/MM', { locale: ptBR });
                                    }}
                                />
                                <YAxis
                                    tickFormatter={(value: any) => formatCurrency(value)}
                                    axisLine={false}
                                    tickLine={false}
                                    tickMargin={8}
                                    className="text-xs"
                                />
                                <Tooltip content={
                                    <ChartTooltipContent
                                        className="w-[180px]"
                                        nameKey="valor" // A tooltip mostrará "Valor" com a formatação de moeda
                                        // CORREÇÃO AQUI: 'name: any' para ser compatível com Recharts NameType
                                        formatter={(value: any, name: any) => {
                                            const formattedValue = typeof value === 'number' ? formatCurrency(value) : String(value);
                                            // Garante que 'name' é tratado como string para acesso ao chartConfig
                                            const chartLabel = chartConfig[name as keyof typeof chartConfig]?.label || String(name);
                                            return [formattedValue, chartLabel];
                                        }}
                                        labelFormatter={(value) => {
                                            const dateValue = typeof value === 'string' ? parseISO(value) : new Date(value);
                                            return format(dateValue, 'dd/MM/yyyy', { locale: ptBR });
                                        }}
                                    />
                                } />
                                <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} radius={8} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}