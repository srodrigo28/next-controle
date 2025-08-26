'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/lib/supabase"; // Importar o cliente Supabase
import { useRouter } from "next/navigation"; // Para redirecionar se não houver sessão
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface Lancamento {
    id: string;
    user_id: string;
    data: string; // Formato YYYY-MM-DD
    descricao: string;
    valor: number;
    categoria: string;
    tipo: "receita" | "despesa";
    observacoes: string;
}

type FilterType = "all" | "receita" | "despesa";

export function LancamentosTable() {
    const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
    const [filterType, setFilterType] = useState<FilterType>("all");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLancamento, setSelectedLancamento] = useState<Lancamento | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<Lancamento>>({});

    const router = useRouter();

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    const fetchLancamentos = useCallback(async () => {
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
            let query = supabase.from("lancamentos_diarios").select("*").eq("user_id", userId);

            if (filterType !== "all") {
                query = query.eq("tipo", filterType);
            }

            query = query.order("data", { ascending: false });

            const { data, error: fetchError } = await query;

            if (fetchError) {
                throw fetchError;
            }

            setLancamentos(data as Lancamento[]);
        } catch (err: any) {
            console.error("Erro ao buscar lançamentos:", err.message);
            setError("Erro ao carregar lançamentos: " + err.message);
            setLancamentos([]);
        } finally {
            setIsLoading(false);
        }
    }, [filterType, router]);

    useEffect(() => {
        fetchLancamentos();
    }, [fetchLancamentos]);

    const handleEditClick = (lancamento: Lancamento) => {
        setSelectedLancamento(lancamento);
        // Garante que a data esteja no formato YYYY-MM-DD para o input type="date"
        setEditFormData({ ...lancamento, data: format(new Date(lancamento.data), 'yyyy-MM-dd') });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (lancamento: Lancamento) => {
        setSelectedLancamento(lancamento);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setEditFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setEditFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        if (!selectedLancamento) return;

        try {
            setIsLoading(true);
            const { error: updateError } = await supabase
                .from("lancamentos_diarios")
                .update(editFormData)
                .eq("id", selectedLancamento.id);

            if (updateError) {
                throw updateError;
            }

            // Atualiza a lista de lançamentos localmente
            setLancamentos((prev) =>
                prev.map((l) => (l.id === selectedLancamento.id ? { ...l, ...editFormData as Lancamento } : l))
            );
            setIsModalOpen(false);
            setSelectedLancamento(null);
            setEditFormData({});
            alert("Lançamento atualizado com sucesso!");
        } catch (err: any) {
            console.error("Erro ao atualizar lançamento:", err.message);
            setError("Erro ao atualizar lançamento: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedLancamento) return;

        try {
            setIsLoading(true);
            const { error: deleteError } = await supabase
                .from("lancamentos_diarios")
                .delete()
                .eq("id", selectedLancamento.id);

            if (deleteError) {
                throw deleteError;
            }

            setLancamentos((prev) => prev.filter((l) => l.id !== selectedLancamento.id));
            setIsModalOpen(false);
            setSelectedLancamento(null);
            alert("Lançamento excluído com sucesso!");
        } catch (err: any) {
            console.error("Erro ao excluir lançamento:", err.message);
            setError("Erro ao excluir lançamento: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Meus Lançamentos</CardTitle>
                <div className="flex flex-wrap gap-2 justify-end"> {/* flex-wrap para quebrar linha em telas pequenas */}
                    <Button
                        variant={filterType === "all" ? "default" : "outline"}
                        onClick={() => setFilterType("all")}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                        Todos
                    </Button>
                    <Button
                        variant={filterType === "receita" ? "default" : "outline"}
                        onClick={() => setFilterType("receita")}
                        className="bg-green-500 hover:bg-green-600 text-white"
                    >
                        Receitas
                    </Button>
                    <Button
                        variant={filterType === "despesa" ? "default" : "outline"}
                        onClick={() => setFilterType("despesa")}
                        className="bg-red-500 hover:bg-red-600 text-white"
                    >
                        Despesas
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0"> {/* overflow-hidden no container principal da tabela */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-white">Carregando lançamentos...</div>
                ) : error ? (
                    <div className="flex items-center justify-center h-full text-red-500">{error}</div>
                ) : lancamentos.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">Nenhum lançamento encontrado para o filtro selecionado.</div>
                ) : (
                    <div className="overflow-x-auto h-full"> {/* Container para scroll horizontal */}
                        <Table className="min-w-full divide-y divide-gray-700"> {/* min-w-full garante que a tabela terá a largura mínima */}
                            <TableHeader className="sticky top-0 bg-slate-800 z-10">
                                <TableRow>
                                    <TableHead className="text-white whitespace-nowrap">Data</TableHead> {/* whitespace-nowrap evita quebra de linha */}
                                    <TableHead className="text-white whitespace-nowrap hidden md:block">Descrição</TableHead>
                                    <TableHead className="text-white whitespace-nowrap hidden md:block">Categoria</TableHead>
                                    <TableHead className="text-white whitespace-nowrap">Tipo</TableHead>
                                    <TableHead className="text-right text-white whitespace-nowrap">Valor</TableHead>
                                    <TableHead className="text-right text-white whitespace-nowrap">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lancamentos.map((lancamento) => (
                                    <TableRow key={lancamento.id} className="hover:bg-slate-700 transition-colors duration-200">
                                        <TableCell className="font-medium text-gray-300 whitespace-nowrap">{format(new Date(lancamento.data), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                                        <TableCell className="text-gray-300 whitespace-nowrap hidden md:block">{lancamento.descricao}</TableCell>
                                        <TableCell className="text-gray-300 whitespace-nowrap hidden md:block">{lancamento.categoria}</TableCell>
                                        <TableCell className={`font-semibold ${lancamento.tipo === 'receita' ? 'text-green-400' : 'text-red-400'} whitespace-nowrap`}>
                                            {lancamento.tipo === 'receita' ? 'Receita' : 'Despesa'}
                                        </TableCell>
                                        <TableCell className={`text-right font-semibold ${lancamento.tipo === 'receita' ? 'text-green-400' : 'text-red-400'} whitespace-nowrap`}>
                                            {formatCurrency(lancamento.valor)}
                                        </TableCell>
                                        <TableCell className="text-right whitespace-nowrap">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Abrir menu</span>
                                                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-slate-700 border-slate-600 text-white">
                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                    <DropdownMenuSeparator className="bg-slate-600" />
                                                    <DropdownMenuItem onClick={() => handleEditClick(lancamento)} className="hover:bg-slate-600 cursor-pointer">
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDeleteClick(lancamento)} className="hover:bg-slate-600 cursor-pointer text-red-400">
                                                        Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>

            {/* Modal de Edição/Exclusão (inalterado) */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px] bg-slate-800 text-white border-slate-700">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Editar Lançamento" : "Excluir Lançamento"}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? "Faça as alterações necessárias e clique em salvar."
                                : `Tem certeza que deseja excluir o lançamento de "${selectedLancamento?.descricao}"? Esta ação não pode ser desfeita.`}
                        </DialogDescription>
                    </DialogHeader>
                    {isEditing && selectedLancamento && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="data" className="text-right">
                                    Data
                                </Label>
                                <Input
                                    id="data"
                                    type="date"
                                    value={editFormData.data || ''}
                                    onChange={handleFormChange}
                                    className="col-span-3 bg-slate-700 border-slate-600 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="descricao" className="text-right">
                                    Descrição
                                </Label>
                                <Input
                                    id="descricao"
                                    value={editFormData.descricao || ''}
                                    onChange={handleFormChange}
                                    className="col-span-3 bg-slate-700 border-slate-600 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="valor" className="text-right">
                                    Valor
                                </Label>
                                <Input
                                    id="valor"
                                    type="number"
                                    value={editFormData.valor !== undefined ? editFormData.valor : ''}
                                    onChange={handleFormChange}
                                    className="col-span-3 bg-slate-700 border-slate-600 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="categoria" className="text-right">
                                    Categoria
                                </Label>
                                <Input
                                    id="categoria"
                                    value={editFormData.categoria || ''}
                                    onChange={handleFormChange}
                                    className="col-span-3 bg-slate-700 border-slate-600 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="tipo" className="text-right">
                                    Tipo
                                </Label>
                                <Select onValueChange={(value) => handleSelectChange("tipo", value)} value={editFormData.tipo || ''}>
                                    <SelectTrigger id="tipo" className="col-span-3 bg-slate-700 border-slate-600 text-white">
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-700 border-slate-600 text-white">
                                        <SelectItem value="receita">Receita</SelectItem>
                                        <SelectItem value="despesa">Despesa</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="observacoes" className="text-right">
                                    Observações
                                </Label>
                                <Textarea
                                    id="observacoes"
                                    value={editFormData.observacoes || ''}
                                    onChange={handleFormChange}
                                    className="col-span-3 bg-slate-700 border-slate-600 text-white"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)} className="bg-slate-600 hover:bg-slate-500 text-white border-slate-500">
                            Cancelar
                        </Button>
                        {isEditing ? (
                            <Button type="submit" onClick={handleSaveChanges} className="bg-green-500 hover:bg-green-600 text-white">
                                Salvar alterações
                            </Button>
                        ) : (
                            <Button type="button" onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600 text-white">
                                Confirmar Exclusão
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}