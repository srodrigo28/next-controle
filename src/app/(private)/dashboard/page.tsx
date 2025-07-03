import FormInserir from "@/components/formInserir";
import HeaderAuth from "@/components/headerAuth";
import { ChartLineLabel } from "@/components/lineChart";
import { ChartBarInteractive } from "@/components/ui/barFull";
import { ChartBarLabelCustom } from "@/components/ui/barRightChart";
import { ChartBarMultiple } from "@/components/ui/barUpChart";
import { ChartBarLabel } from "@/components/ui/barUpChart2";
import { ChartAreaInteractive } from "@/components/ui/pieAreaChart";

import { ChartPieInteractive } from "@/components/ui/pieChartSelect";
import { ChartRadialShape } from "@/components/ui/radialChart1";
import { ChartRadialLabel } from "@/components/ui/radialChart2";
export default function Home() {

  return (
    <div className="flex gap-3 flex-col h-screen p-3">

      <HeaderAuth />

      <div className="flex px-3 md:px-0 items-center justify-between">
        <div className="w-full flex md:flex-row flex-col items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-zinc-200 text-3xl">Dashbord</h1>
          <p className="text-zinc-500">Bem vindo ao Painel de controle</p>
          </div>
          <div className="flex gap-3 py-3">
            <button className="bg-sky-600 px-3 w-20 text-white rounded-sm cursor-pointer">
              <FormInserir />
            </button>
            <button className="bg-green-500 px-3 w-20 text-slate-700 rounded-sm cursor-pointer">Entrada</button>
            <button className="bg-red-500 px-3 w-20 rounded-sm cursor-pointer">Saída</button>
          </div>
        </div>
        
      </div>

      <div className="flex flex-col md:flex-row gap-5 mb-2 mt-2">
        <div className="flex-1 min-w-[46%]">
          <ChartPieInteractive />
        </div>
        <div className="flex-1 min-w-[46%]">
          <ChartRadialLabel />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-5 mb-2">
        <div className="flex-1 min-w-[46%]">
          <ChartBarMultiple />
        </div>
        <div className="flex-1 min-w-[46%]">
          <ChartBarLabel />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-5 mb-2">

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

      <div className="">
        <ChartAreaInteractive />
      </div>

      <div className="">
        <ChartBarInteractive />
      </div>
    </div>
  );
}
