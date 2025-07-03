import HeaderAuth from "@/components/headerAuth";
import { ChartLineLabel } from "@/components/lineChart";
import { ChartBarInteractive } from "@/components/ui/barFull";
import { ChartBarLabelCustom } from "@/components/ui/barRightChart";
import { ChartBarMultiple } from "@/components/ui/barUpChart";
import { ChartBarLabel } from "@/components/ui/barUpChart2";
import { ChartAreaInteractive } from "@/components/ui/pieAreaChart";
import { PieCharGrafic } from "@/components/ui/pieCharGrafic";

import { ChartPieInteractive } from "@/components/ui/pieChartSelect";
import { ChartRadialShape } from "@/components/ui/radialChart1";
import { ChartRadialLabel } from "@/components/ui/radialChart2";
import { ChartRadialStacked } from "@/components/ui/radialChartMidium";
export default function Home() {

  return (
    <div className="flex gap-3 flex-col h-screen p-3">

      <HeaderAuth />

      <div className="flex px-3 md:px-0 items-center justify-between">
        <div className="w-62 flex flex-col">
          <h1 className="text-zinc-200 text-3xl">Dashbord</h1>
          <p className="text-zinc-500">Bem vindo ao Painel de controle</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-5">
        <div className="flex-1 min-w-[33%]">
          <ChartPieInteractive />
        </div>
        <div className="flex-1 min-w-[33%]">
          <ChartRadialLabel />
        </div>

        <div className="flex-1 min-w-[33%]">
          <PieCharGrafic />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-5">
        <div className="flex-1 min-w-[33%]">
          <ChartRadialStacked />
        </div>
        <div className="flex-1 min-w-[33%]">
          <ChartBarMultiple />
        </div>
        <div className="flex-1 min-w-[33%]">
          <ChartBarLabel />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-5 mb-5 mt-3">

        <div className="flex-1 min-w-[33%]">
          <ChartBarLabelCustom />
        </div>

        <div className="flex-1 min-w-[33%]">
          <ChartRadialShape />
        </div>

        <div className="flex-1 min-w-[33%]">
          <ChartLineLabel />
        </div>
      </div>

      <div className="mt-20 mb-20 hidden" > </div>

      <div className="">
        <ChartAreaInteractive />
      </div>

      <div className="">
        <ChartBarInteractive />
      </div>
    </div>
  );
}
