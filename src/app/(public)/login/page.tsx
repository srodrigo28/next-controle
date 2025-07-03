'use client';

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { IoMailOpenOutline } from "react-icons/io5";
import { PiKey } from "react-icons/pi";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const Home: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function updateLastAccess(userId: string) {
    try {
      const { error } = await supabase
        .from("perfil")
        .update({ last_access_at: new Date() })
        .eq("user_id", userId);

      if (error) {
        console.error("Erro ao atualizar último acesso:", error);
      }
    } catch (err) {
      console.error("Erro inesperado ao atualizar último acesso:", err);
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Limpa o erro antes de tentar autenticar

    try {
      const { data: session, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError("Credenciais inválidas. Tente novamente.");
        return;
      }

      if (session?.user?.id) {
        await updateLastAccess(session.user.id); // Atualiza o último acesso
        router.push("/dashboard"); // Redireciona após login bem-sucedido
      }
    } catch (err) {
      console.error("Erro inesperado durante o login:", err);
      setError("Ocorreu um erro ao fazer login. Tente novamente.");
    }
  };

  return (
    <div className="flex w-screen h-screen bg-black">
      {/* Seção Mobile */}
      <div
        className="h-screen flex justify-center flex-col w-full md:w-[30%] md:min-w-[320px] 
        md:max-w-[400px] md:block text-white "
      >
        <div className="w-[100%] md:mt-2 flex flex-col items-center justify-center">
          <Image
            src="/ControlePessoal.png"
            alt="logo.svg"
            width={250}
            height={250}
            
            priority 
            className="mt-6 mb-10 w-72 h-auto" 
          />
          <h1 className="text-xl font-bold">Seja bem vindo </h1>
        </div>

        <form className="w-[100%]" onSubmit={handleLogin}>
          <div className="input-wrapper flex flex-col p-5">
            <label className="text-sm font-semibold">E-mail</label>
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

            <label className="text-sm mt-3 font-semibold">Senha</label>
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
            <span className="text-end mt-2 text-xs text-white cursor-pointer hover:underline hover:text-sm duration-300 font-semibold">
            <Link href="/recuperar-senha">
              Esqueci minha senha?
            </Link>
            </span>
          </div>

          <div className="button-wrapper w-[100%] flex flex-col items-center p-5">
            <button
              type="submit"
              className="w-[100%] mb-7 bg-violet-600 text-white p-2 rounded-md tracking-wide font-semibold"
            >
              Entrar
            </button>
          </div>
        </form>

        {error && (
          <div className="text-center text-red-500 text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="button-wrapper w-[100%] flex flex-col items-center p-5">
          <div className="box-ou">
            <span className="h-1 bg-primary flex-1"></span>
            <span className="text-white">Ou</span>
            <span className="h-1 bg-primary flex-1"></span>
          </div>

          <Link href="/cadastro" className="w-full">
            <button className="w-[100%] mt-7 bg-green-600 font-semibold tracking-wide text-white p-2 rounded-md">
              Cadastre-se
            </button>
          </Link>
        </div>
      </div>
      {/* Seção Desktop */}
      <div className="hidden md:flex h-screen md:flex-1 bg-sky-300 justify-center 
      flex-col items-center bg-[url(/login-2.jpg)] ">
        
        {/* <Image src="/login-2.jpg" width={1000} height={1000}  alt="" /> */}
      </div>
    </div>
  );
};

export default Home;