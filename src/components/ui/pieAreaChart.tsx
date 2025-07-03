"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { Card, CardContent,  CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const description = "An interactive area chart"

const chartData = [
  
  { date: "2024-01-01", entrada: 180, saida: 170 },
  { date: "2024-01-02", entrada: 210, saida: 160 },
  { date: "2024-01-03", entrada: 199, saida: 220 },

  
  { date: "2024-02-01", entrada: 223, saida: 167 },
  { date: "2024-02-02", entrada: 199, saida: 120 },
  { date: "2024-02-03", entrada: 225, saida: 180 },

  
  { date: "2024-03-01", entrada: 199, saida: 177 },
  { date: "2024-03-02", entrada: 220, saida: 188 },
  { date: "2024-03-03", entrada: 217, saida: 199 },

  { date: "2024-04-01", entrada: 222, saida: 150 },
  { date: "2024-04-02", entrada: 97, saida: 180 },
  { date: "2024-04-03", entrada: 167, saida: 120 },
  { date: "2024-04-04", entrada: 242, saida: 260 },
  { date: "2024-04-05", entrada: 373, saida: 290 },
  { date: "2024-04-06", entrada: 301, saida: 340 },
  { date: "2024-04-07", entrada: 245, saida: 180 },
  { date: "2024-04-08", entrada: 409, saida: 320 },
  { date: "2024-04-09", entrada: 59, saida: 110 },
  { date: "2024-04-10", entrada: 261, saida: 190 },
  { date: "2024-04-11", entrada: 327, saida: 350 },
  { date: "2024-04-12", entrada: 292, saida: 210 },
  { date: "2024-04-13", entrada: 342, saida: 380 },
  { date: "2024-04-14", entrada: 137, saida: 220 },
  { date: "2024-04-15", entrada: 120, saida: 170 },
  { date: "2024-04-16", entrada: 138, saida: 190 },
  { date: "2024-04-17", entrada: 446, saida: 360 },
  { date: "2024-04-18", entrada: 364, saida: 410 },
  { date: "2024-04-19", entrada: 243, saida: 180 },
  { date: "2024-04-20", entrada: 89, saida: 150 },
  { date: "2024-04-21", entrada: 137, saida: 200 },
  { date: "2024-04-22", entrada: 224, saida: 170 },
  { date: "2024-04-23", entrada: 138, saida: 230 },
  { date: "2024-04-24", entrada: 387, saida: 290 },
  { date: "2024-04-25", entrada: 215, saida: 250 },
  { date: "2024-04-26", entrada: 75, saida: 130 },
  { date: "2024-04-27", entrada: 383, saida: 420 },
  { date: "2024-04-28", entrada: 122, saida: 180 },
  { date: "2024-04-29", entrada: 315, saida: 240 },
  { date: "2024-04-30", entrada: 454, saida: 380 },
  { date: "2024-05-01", entrada: 165, saida: 220 },
  { date: "2024-05-02", entrada: 293, saida: 310 },
  { date: "2024-05-03", entrada: 247, saida: 190 },
  { date: "2024-05-04", entrada: 385, saida: 420 },
  { date: "2024-05-05", entrada: 481, saida: 390 },
  { date: "2024-05-06", entrada: 498, saida: 520 },
  { date: "2024-05-07", entrada: 388, saida: 300 },
  { date: "2024-05-08", entrada: 149, saida: 210 },
  { date: "2024-05-09", entrada: 227, saida: 180 },
  { date: "2024-05-10", entrada: 293, saida: 330 },
  { date: "2024-05-11", entrada: 335, saida: 270 },
  { date: "2024-05-12", entrada: 197, saida: 240 },
  { date: "2024-05-13", entrada: 197, saida: 160 },
  { date: "2024-05-14", entrada: 448, saida: 490 },
  { date: "2024-05-15", entrada: 473, saida: 380 },
  { date: "2024-05-16", entrada: 338, saida: 400 },
  { date: "2024-05-17", entrada: 499, saida: 420 },
  { date: "2024-05-18", entrada: 315, saida: 350 },
  { date: "2024-05-19", entrada: 235, saida: 180 },
  { date: "2024-05-20", entrada: 177, saida: 230 },
  { date: "2024-05-21", entrada: 82, saida: 140 },
  { date: "2024-05-22", entrada: 81, saida: 120 },
  { date: "2024-05-23", entrada: 252, saida: 290 },
  { date: "2024-05-24", entrada: 294, saida: 220 },
  { date: "2024-05-25", entrada: 201, saida: 250 },
  { date: "2024-05-26", entrada: 213, saida: 170 },
  { date: "2024-05-27", entrada: 420, saida: 460 },
  { date: "2024-05-28", entrada: 233, saida: 190 },
  { date: "2024-05-29", entrada: 78, saida: 130 },
  { date: "2024-05-30", entrada: 340, saida: 280 },
  { date: "2024-05-31", entrada: 178, saida: 230 },
  { date: "2024-06-01", entrada: 178, saida: 200 },
  { date: "2024-06-02", entrada: 470, saida: 410 },
  { date: "2024-06-03", entrada: 103, saida: 160 },
  { date: "2024-06-04", entrada: 439, saida: 380 },
  { date: "2024-06-05", entrada: 88, saida: 140 },
  { date: "2024-06-06", entrada: 294, saida: 250 },
  { date: "2024-06-07", entrada: 323, saida: 370 },
  { date: "2024-06-08", entrada: 385, saida: 320 },
  { date: "2024-06-09", entrada: 438, saida: 480 },
  { date: "2024-06-10", entrada: 155, saida: 200 },
  { date: "2024-06-11", entrada: 92, saida: 150 },
  { date: "2024-06-12", entrada: 492, saida: 420 },
  { date: "2024-06-13", entrada: 81, saida: 130 },
  { date: "2024-06-14", entrada: 426, saida: 380 },
  { date: "2024-06-15", entrada: 307, saida: 350 },
  { date: "2024-06-16", entrada: 371, saida: 310 },
  { date: "2024-06-17", entrada: 475, saida: 520 },
  { date: "2024-06-18", entrada: 107, saida: 170 },
  { date: "2024-06-19", entrada: 341, saida: 290 },
  { date: "2024-06-20", entrada: 408, saida: 450 },
  { date: "2024-06-21", entrada: 169, saida: 210 },
  { date: "2024-06-22", entrada: 317, saida: 270 },
  { date: "2024-06-23", entrada: 480, saida: 530 },
  { date: "2024-06-24", entrada: 132, saida: 180 },
  { date: "2024-06-25", entrada: 141, saida: 190 },
  { date: "2024-06-26", entrada: 434, saida: 380 },
  { date: "2024-06-27", entrada: 448, saida: 490 },
  { date: "2024-06-28", entrada: 149, saida: 200 },
  { date: "2024-06-29", entrada: 103, saida: 160 },
  { date: "2024-06-30", entrada: 446, saida: 400 },
]

const chartConfig = {
  visitors: { label: "Visitors" },
  entrada: { label: "entrada", color: "var(--chart-1)" },
  saida: { label: "saida", color: "var(--chart-2)" },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState("180d")

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 180
    if (timeRange === "90d") {
      daysToSubtract = 90
    } else if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Faturamento por Período</CardTitle>
          <CardDescription>
            Resumo em barras faturamento
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Último 3 meses" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="180d" className="rounded-lg"> Último 6 meses </SelectItem> {/** 30 dia  */}
            <SelectItem value="90d" className="rounded-lg"> Último 3 meses </SelectItem> {/** 15 dia  */}
            <SelectItem value="30d" className="rounded-lg"> Último 30 dias </SelectItem> {/** 7 dia  */}
            <SelectItem value="7d" className="rounded-lg"> Últimos 7 dias </SelectItem>  {/** 1 dia  */} 
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
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
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
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
              stackId="a"
            />
            <Area
              dataKey="entrada"
              type="natural"
              fill="url(#fillentrada)"
              stroke="var(--color-entrada)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}