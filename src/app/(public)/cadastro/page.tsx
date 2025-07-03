'use client';

import Image from "next/image";
import Link from "next/link";
import React, { useState, useCallback } from "react"; // Adicionado useCallback
import { IoMailOpenOutline } from "react-icons/io5";
import { PiKey } from "react-icons/pi";
import { RxPerson } from "react-icons/rx";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PhoneIncoming } from "lucide-react";

const Register: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [telefone, setTelefone] = useState<string>(""); // Estado para o valor mascarado
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  // Função para aplicar a máscara ao telefone - MOVIDA PARA O ESCOPO DO COMPONENTE
  const formatPhoneNumber = useCallback((value: string) => {
    // Remove tudo que não for dígito
    let cleanedValue = value.replace(/\D/g, '');

    // Aplica a máscara (XX) XXXXX-XXXX
    // Adiciona o parêntese e o primeiro espaço
    if (cleanedValue.length > 0) {
      cleanedValue = cleanedValue.replace(/^(\d{2})(\d)/g, '($1) $2');
    }
    // Adiciona o hífen para o formato XXXXX-XXXX (celular) ou XXXX-XXXX (fixo)
    // Considera tanto 9 dígitos quanto 8 após o DDD
    if (cleanedValue.length > 9 && cleanedValue.length <= 14) { // (XX) XXXXX-XXXX
      cleanedValue = cleanedValue.replace(/(\d{5})(\d)/, '$1-$2');
    } else if (cleanedValue.length > 8 && cleanedValue.length <= 13) { // (XX) XXXX-XXXX
        cleanedValue = cleanedValue.replace(/(\d{4})(\d)/, '$1-$2');
    }
    return cleanedValue;
  }, []);

  // Handler para a mudança do input de telefone - MOVIDA PARA O ESCOPO DO COMPONENTE
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const maskedValue = formatPhoneNumber(rawValue);
    setTelefone(maskedValue);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validações simples
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    // Limpa o telefone para salvar no banco de dados (apenas dígitos)
    const cleanedTelefone = telefone.replace(/\D/g, '');

    try {
      // Cadastra o usuário no Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError || !data.user) {
        setError(signUpError?.message || "Erro ao registrar o usuário.");
        setLoading(false);
        return;
      }

      // Salva informações adicionais na tabela "perfil"
      const { error: profileError } = await supabase.from("perfil").insert({
        user_id: data.user.id,
        name,
        email,
        telefone: cleanedTelefone, // SALVANDO O TELEFONE LIMPO
      });

      if (profileError) {
        // Se houver erro ao salvar o perfil, considere reverter o signUp do usuário
        // ou lidar com a inconsistência de dados. Por simplicidade, apenas logamos o erro aqui.
        setError("Erro ao criar o perfil do usuário. " + profileError.message);
        setLoading(false);
        return;
      }

      // Redireciona após sucesso
      router.push("/dashboard");
    } catch (err: any) { // Adicionado tipo 'any' para o erro para capturá-lo corretamente
      setError("Algo deu errado. Tente novamente. " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-screen h-screen">
      {/* Seção Mobile */}
      <div
        className="h-screen flex items-center justify-center flex-col w-full md:w-[30%] md:min-w-[320px] 
        md:max-w-[400px] bg-black md:block text-white"
      >
        <div className="w-[100%] flex flex-col items-center justify-center">
          <Image
            src="/ControlePessoal.png"
            alt="logo.svg"
            width={300}
            height={300}
            className="mt-6 mb-10"
          />
          <h1 className="text-2xl font-bold">Gerir seu controle pessoal</h1>
        </div>

        <form className="w-[100%]" onSubmit={handleRegister}>
          <div className="input-wrapper flex flex-col p-5">
            <label htmlFor="nome" className="text-sm">Nome completo</label>
            <div className="flex items-center justify-center">
              <input
                type="text"
                name="nome"
                id="nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-class"
                required
              />
              <div className="icon-box">
                <RxPerson className="icon-box-icon" />
              </div>
            </div>

            <label htmlFor="email" className="text-sm mt-2">E-mail</label>
            <div className="flex items-center justify-center">
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-class"
                required
              />
              <div className="icon-box">
                <IoMailOpenOutline className="icon-box-icon" />
              </div>
            </div>

            {/* Apenas uma vez o bloco do telefone */}
            <label htmlFor="telefone" className="text-sm mt-2">Telefone</label>
            <div className="flex items-center justify-center">
              <input
                type="tel"
                name="telefone"
                id="telefone"
                maxLength={15}
                value={telefone}
                onChange={handlePhoneChange} // Usando o handler otimizado
                className="input-class"
                required
              />
              <div className="icon-box">
                <PhoneIncoming className="icon-box-icon" />
              </div>
            </div>

            <label htmlFor="password" className="text-sm mt-2">Senha</label>
            <div className="flex items-center justify-center">
              <input
                type="password"
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-class"
                required
              />
              <div className="icon-box">
                <PiKey className="icon-box-icon" />
              </div>
            </div>

            <label htmlFor="confirmarSenha" className="text-sm mt-2">Confirmar a Senha</label>
            <div className="flex items-center justify-center">
              <input
                type="password"
                name="confirmar-senha"
                id="confirmarSenha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-class"
                required
              />
              <div className="icon-box">
                <PiKey className="icon-box-icon" />
              </div>
            </div>
          </div>

          <div className="button-wrapper w-[100%] flex flex-col items-center p-5">
            <button
              type="submit"
              className="w-[100%] mb-2 bg-violet-500 text-white p-2 rounded-md 
              tracking-wide font-semibold"
              disabled={loading}
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </div>
        </form>

        {error && (
          <div className="text-center text-red-500 text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="button-wrapper w-[90%] mx-auto flex flex-col items-center">
          <div className="box-ou">
            <span className="h-1 bg-primary flex-1"></span>
            <span>Ou</span>
            <span className="h-1 bg-primary flex-1"></span>
          </div>
          {/* O link "Cadastre-se" aqui parece um pouco redundante em uma página de cadastro.
              Se for para ir para o login, mude o href para "/login". */}
          <Link href="/login" className="w-full">
            <button className="w-[100%] mt-7 bg-green-600 font-semibold tracking-wide text-white p-2 rounded-md">
              Já tem conta? Entre! {/* Mensagem mais clara */}
            </button>
          </Link>
        </div>

      </div>
      {/* Seção Desktop */}
      <div className="hidden md:flex h-screen md:flex-1 bg-sky-300 justify-center 
      flex-col items-center bg-[url(/login-2.jpg)] ">
      </div>
    </div>
  );
};

export default Register;