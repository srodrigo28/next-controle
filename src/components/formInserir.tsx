'use client';

import React, { useState, FormEvent } from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Input } from "@/components/ui/input"; // Importado o Input do shadcn/ui
import { supabase } from "@/lib/supabase"; // Importado o cliente Supabase

// Tipos para a nova estrutura de dados de lançamento
type TipoLancamento = "receita" | "despesa";

interface LancamentoDiaData {
  user_id: string;
  data: string; // Formato YYYY-MM-DD
  descricao: string;
  valor: number;
  categoria: string;
  tipo: TipoLancamento;
  observacoes: string;
}

export default function FormInserir() {
  // Estados para os campos do formulário
  const [descricao, setDescricao] = useState<string>("");
  const [tipo, setTipo] = useState<TipoLancamento | "">(""); // 'receita' ou 'despesa'
  const [categoria, setCategoria] = useState<string>(""); // Ex: "Serviço", "Vendas", "Outros"
  const [valor, setValor] = useState<string>(""); // Valor do lançamento, como string de dígitos para formatação
  const [observacoes, setObservacoes] = useState<string>("");
  const [data, setData] = useState<Date | undefined>(undefined); // Estado para a data selecionada
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false); // Estado para controlar a abertura do Popover do calendário

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false); // Estado para controlar a abertura/fechamento do Drawer

  // Função para formatar o valor como moeda (R$ X.XXX,XX) para EXIBIÇÃO
  const formatCurrency = (digits: string): string => {
    if (!digits) return "";

    // Converte a string de dígitos para um número, assumindo 2 casas decimais
    // Ex: "12345" se torna 123.45
    const number = parseFloat(digits) / 100;

    if (isNaN(number)) {
      return "";
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number);
  };

  // Handler para o input de valor: armazena APENAS DÍGITOS no estado
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove tudo que não for dígito
    const rawDigits = e.target.value.replace(/\D/g, '');
    setValor(rawDigits); // Armazena apenas os dígitos no estado
  };

  // Função para lidar com a submissão do formulário
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Validação de campos obrigatórios
    if (!descricao || !tipo || !categoria || !valor || !data) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      setIsLoading(false);
      return;
    }

    // Tenta converter o valor (que está em dígitos) para número float
    // Ex: "12345" se torna 123.45
    const parsedValor = parseFloat(valor) / 100; 
    if (isNaN(parsedValor)) {
      setError("O valor inserido não é um número válido.");
      setIsLoading(false);
      return;
    }

    try {
      // Obter a sessão do usuário para pegar o user_id
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setError("Sessão não encontrada. Por favor, faça login novamente.");
        setIsLoading(false);
        return;
      }

      const userId = session.user.id;

      // Dados a serem inseridos na tabela lancamentos_diarios, usando a nova interface
      const newEntry: LancamentoDiaData = {
        user_id: userId,
        data: format(data, "yyyy-MM-dd"), // Formata a data para o padrão do banco de dados
        descricao: descricao,
        valor: parsedValor, // Salva como número
        categoria: categoria,
        tipo: tipo,
        observacoes: observacoes,
      };

      // *** CONSOLE.LOG ADICIONADO AQUI ***
      console.log("Dados a serem inseridos no Supabase:", newEntry);

      const { error: insertError } = await supabase
        .from("lancamentos_diarios") // Nome da tabela
        .insert([newEntry]);

      if (insertError) {
        throw insertError;
      }

      setSuccess("Registro adicionado com sucesso!");

      // Limpar o formulário após a submissão bem-sucedida
      setDescricao("");
      setTipo("");
      setCategoria("");
      setValor("");
      setObservacoes("");
      setData(undefined);
      setIsCalendarOpen(false); // Fecha o calendário

      // Fechar o Drawer após 1 segundo (1000 ms)
      setTimeout(() => {
        setIsDrawerOpen(false); // Fecha o componente Drawer
      }, 1000); 

    } catch (err: any) {
      console.error("Erro ao adicionar registro:", err.message);
      setError("Erro ao adicionar registro: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <Button>Novo</Button>
      </DrawerTrigger>
      <DrawerContent className="h-full max-h-[90vh] md:max-w-[50%] w-full mx-auto bg-slate-900 flex flex-col">
        <DrawerHeader>
          <DrawerTitle className="text-2xl text-white">Adicionar um registro?</DrawerTitle>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto px-4 py-4 text-white">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-2">{success}</p>}

            <Label htmlFor="descricao">Nome ou descrição</Label>
            <Input
              id="descricao"
              type="text"
              placeholder="Nome ou descrição"
              className="border-slate-700 border-2 p-2 rounded-md bg-slate-800 text-white placeholder-gray-400"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              disabled={isLoading}
            />

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
              <div className="element md:flex-1 w-full">
                <Label htmlFor="data-picker">Data</Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="data-picker"
                      className="w-full justify-between font-normal bg-slate-800 text-white border-slate-700"
                      disabled={isLoading}
                    >
                      {data ? format(data, "PPP", { locale: ptBR }) : "Selecione a data"}
                      <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0 bg-slate-800 border-slate-700" align="start">
                    <Calendar
                      mode="single"
                      selected={data}
                      captionLayout="dropdown"
                      onSelect={(selectedDate) => {
                        setData(selectedDate);
                        setIsCalendarOpen(false);
                      }}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="element md:flex-1 w-full">
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={tipo} onValueChange={(value) => setTipo(value as TipoLancamento)} disabled={isLoading}>
                  <SelectTrigger id="tipo" className="w-full bg-slate-800 text-white border-slate-700">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 text-white border-slate-700">
                    <SelectGroup>
                      <SelectLabel>Tipo</SelectLabel>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="despesa">Despesa</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="element md:flex-1 w-full">
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={categoria} onValueChange={setCategoria} disabled={isLoading}>
                  <SelectTrigger id="categoria" className="w-full bg-slate-800 text-white border-slate-700">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 text-white border-slate-700">
                    <SelectGroup>
                      <SelectLabel>Categorias</SelectLabel>
                      <SelectItem value="servico">Serviço</SelectItem>
                      <SelectItem value="vendas">Vendas</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                      {/* Você pode adicionar mais categorias aqui */}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="element md:flex-1 w-full">
                <Label htmlFor="valor">Valor</Label>
                <Input
                  id="valor"
                  placeholder="R$ 0,00"
                  className="border-slate-700 border-2 p-2 rounded-md bg-slate-800 text-white placeholder-gray-400"
                  value={formatCurrency(valor)} // Exibe o valor formatado
                  onChange={handleValorChange}
                  type="text" // Usar text para permitir a formatação
                  inputMode="numeric" // Sugere teclado numérico em mobile
                  disabled={isLoading}
                />
              </div>
            </div>

            <Label htmlFor="observacoes" className="mt-4">Observações detalhes adicional</Label>
            <Input
              id="observacoes"
              type="text"
              placeholder="Observações detalhes adicional"
              className="border-slate-700 border-2 p-2 rounded-md bg-slate-800 text-white placeholder-gray-400"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              disabled={isLoading}
            />
          </form>
        </div>

        <DrawerFooter className="bg-slate-900 p-4 border-t border-slate-700">
          <Button type="submit" onClick={handleSubmit} className="mb-2 bg-violet-500 hover:bg-violet-600 text-white" disabled={isLoading}>
            {isLoading ? "Adicionando..." : "Adicionar"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full bg-red-500 hover:bg-red-600 text-white" disabled={isLoading}>Cancelar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
