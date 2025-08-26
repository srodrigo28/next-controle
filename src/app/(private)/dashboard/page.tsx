import FormInserir from "@/components/formInserir";
import HeaderAuth from "@/components/headerAuth";
import { LancamentosTable } from "@/components/listagem";
import { DailyEntriesBarChart } from "@/components/ui/barUpChart2";
import { FaturamentoAreaChart } from "@/components/ui/pieAreaChart";

import { TotalRevenueRadialChart } from "@/components/ui/radialChart1";
import { FaturamentoAreaChart2 } from "@/components/userHistory";
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
            <button className="px-3 w-20 text-white rounded-sm cursor-pointer">
              <FormInserir />
            </button>
            <button className="bg-green-500 px-3 w-20 text-slate-700 rounded-sm cursor-pointer">Entrada</button>
            <button className="bg-red-500 px-3 w-20 rounded-sm cursor-pointer">Saída</button>
          </div>
        </div>
        
      </div>

      <div className="flex-1 min-w-[100%] mx-auto">
          <LancamentosTable />
      </div>

      <div className="flex flex-col md:flex-row gap-5 mb-2 mt-2">
        
        <div className="flex-1 min-w-[46%]">
          <DailyEntriesBarChart />
        </div>
        <div className="flex-1 min-w-[46%]">
          <TotalRevenueRadialChart />
        </div>
      </div>

      <div className="">
        <FaturamentoAreaChart />
      </div>

      <div className="">
        <FaturamentoAreaChart2 />
      </div>
    </div>
  );
}
