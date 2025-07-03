'use client';

import { useState, useEffect, ChangeEvent, FormEvent, useCallback } from "react";
import InputMask from "react-input-mask";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface ProfileData {
  name: string;
  email: string;
  telefone: string;
  avatar_url: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    telefone: "",
    avatar_url: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  const fetchProfile = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/");
        return;
      }

      const userId = session.user.id;

      const { data, error } = await supabase
        .from("perfil")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error || !data) throw new Error("Erro ao buscar perfil");

      setProfile(data);
      setPreview(data.avatar_url ? data.avatar_url : "/placeholder-avatar.png");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido.";
      console.error("Erro ao buscar informações do perfil:", errorMessage);
      setError("Erro ao buscar informações do perfil.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const uploadAvatar = async (): Promise<string | null> => {
    if (!file) return null;

    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from("box")
        .upload(`perfil/${fileName}`, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from("box")
        .getPublicUrl(`perfil/${fileName}`);

      return data.publicUrl;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido.";
      console.error("Erro ao fazer upload da imagem:", errorMessage);
      setError("Erro ao fazer upload da imagem.");
      return null;
    }
  };

  const updateProfile = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/");
        return;
      }

      let avatarUrl = profile.avatar_url;
      if (file) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) avatarUrl = uploadedUrl;
      }

      const userId = session.user.id;

      const { error } = await supabase
        .from("perfil")
        .update({
          name: profile.name,
          telefone: profile.telefone,
          avatar_url: avatarUrl,
        })
        .eq("user_id", userId);

      if (error) throw error;

      setProfile((prev) => ({ ...prev, avatar_url: avatarUrl }));
      setSuccess("Perfil atualizado com sucesso!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido.";
      console.error("Erro ao atualizar o perfil:", errorMessage);
      setError("Erro ao atualizar o perfil.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Meu Perfil</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-500 mb-4">{success}</div>}

      <form className="w-full max-w-md" onSubmit={updateProfile}>
        <div className="mb-4 flex flex-col items-center">
          <label className="block text-sm text-black font-medium mb-2">Avatar</label>
          <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
            <Image src={preview || "/placeholder-avatar.png"} alt="Avatar" className="w-full h-full object-cover" width={128} height={128} />
          </div>
          <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm" />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-black font-medium">Nome Completo</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="input-class"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-black font-medium">Email</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="input-class bg-gray-200 cursor-not-allowed"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-black font-medium">Telefone</label>
          <InputMask
            mask="(99) 99999-9999"
            value={profile.telefone}
            onChange={(e) => setProfile({ ...profile, telefone: e.target.value })}
            className="input-class"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-primary text-white py-2 px-4 rounded-md"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md"
          >
            Voltar
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;