"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

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

export const description = "A bar chart with a label"

const chartData = [
  { month: "Janeiro", desktop: 186 },
  { month: "Fevereiro", desktop: 220 },
  { month: "Março", desktop: 237 },
  { month: "Abril", desktop: 270 },
  { month: "Maio", desktop: 209 },
  { month: "Junho", desktop: 290 },
  { month: "Julho", desktop: 214 },
  { month: "Agosto", desktop: 170 },
  { month: "Setembro", desktop: 320 },
  { month: "Novembro", desktop: 420 },
  { month: "Dezembro", desktop: 520 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ChartBarLabel() {
  return (
    <Card className="h-[30rem]">
      <CardHeader className="flex justify-between">

        <div>
          
        <CardTitle>Relatório anual</CardTitle>
        <CardDescription>2024</CardDescription>
        </div>

        <div>
          <div className="flex gap-2 leading-none font-medium">
          Crescimento anual 5.2%. <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Soma de todos lançamento do ano.
        </div>
        </div>
      </CardHeader>
      <CardContent className="mt-20">
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
