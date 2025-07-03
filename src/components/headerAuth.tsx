'use client';

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { SideBar } from "./ui/siderBar";
import { FaArrowUpRightDots, FaRegBell } from "react-icons/fa6";

interface UserData {
    name: string;
    email: string;
    avatar_url: string;
}

const HeaderAuth: React.FC = () => {
    const [user, setUser] = useState<UserData | null>(null);
    const router = useRouter();

    const fetchUserData = useCallback(async () => {
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                router.push("/login");
                return;
            }

            const userId = session.user.id;

            const { data, error } = await supabase
                .from("perfil")
                .select("name, email, avatar_url")
                .eq("user_id", userId)
                .single();

            if (error || !data) {
                console.error("Erro ao buscar dados do usuário:", error);
                return;
            }

            setUser(data);
        } catch (error) {
            console.error("Erro ao buscar dados do usuário:", error);
        }
    }, [router]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    if (!user) {
        return <div className="flex justify-center items-center h-16 bg-gray-100">Carregando...</div>;
    }

    return (
            <div className="flex md:gap-3 items-center justify-between mb-5 bg-slate-900 py-5 rounded-md px-5">
                <div className="flex w-96 md:w-44 items-center">
                    <Image  src={user.avatar_url || "/placeholder-avatar.png"} className=" md:ml-2 mr-2 rounded-full w-20 h-20" alt="" width={70} height={40} />
                    <div className="flex flex-col">
                        <p>Olá, <span>{user.name}</span></p>
                        {/* <p className="bg-green-600 py-1 mt-1 rounded-full text-center px-3">Admin</p> */}
                    </div>
                </div>
                <input type="text" placeholder="Buscar por ?" className="flex-1 border-2 tracking-wider border-slate-700 p-3 mr-2 bg-slate-900 md:flex hidden rounded-md " />
                <div className="flex gap-2 justify-between md:w-40 w-12 px-3 mr-5 md:mr-1">
                    <div className="flex gap-2">
                        <button className="w-12 bg-slate-800 rounded-md hidden  md:flex justify-center items-center "> <FaArrowUpRightDots /> </button>
                        <button className="w-12 bg-slate-800 rounded-md hidden  md:flex justify-center items-center "> <FaRegBell /> </button>
                        <SideBar />
                    </div>

                </div>

                {/* <button onClick={handleLogout}
                    className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition">
                    Logout
                </button> */}
            </div>
    );
};

export default HeaderAuth;