'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MdMenuOpen } from "react-icons/md";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import Image from "next/image";

// Interface para os dados do perfil, garantindo que todos os campos sejam strings
interface ProfileData {
  name: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  avatar_url: string;
}

export function SideBar() {
  // Usamos apenas um estado 'profile' para gerenciar os dados do formulário e do perfil
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    telefone: "",
    cidade: "",
    estado: "",
    avatar_url: "",
  });

  const [loading, setLoading] = useState<boolean>(true); // Começa como true para o carregamento inicial
  const [isSaving, setIsSaving] = useState<boolean>(false); // Novo estado para diferenciar carregamento inicial de salvamento
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false); // Estado para controlar a abertura/fechamento da Sheet

  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null); // Para pré-visualização do avatar
  const [file, setFile] = useState<File | null>(null); // Para o arquivo de avatar a ser enviado

  // Função para formatar o número de telefone
  const formatPhoneNumber = useCallback((value: string) => {
    let cleanedValue = value.replace(/\D/g, '');
    if (cleanedValue.length > 0) {
      cleanedValue = cleanedValue.replace(/^(\d{2})(\d)/g, '($1) $2');
    }
    if (cleanedValue.length > 9 && cleanedValue.length <= 14) {
      cleanedValue = cleanedValue.replace(/(\d{5})(\d)/, '$1-$2');
    } else if (cleanedValue.length > 8 && cleanedValue.length <= 13) {
      cleanedValue = cleanedValue.replace(/(\d{4})(\d)/, '$1-$2');
    }
    return cleanedValue;
  }, []);

  // Handler genérico para mudanças nos campos de texto
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Handler específico para o telefone com máscara
  const handleTelefoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const maskedValue = formatPhoneNumber(e.target.value);
    setProfile((prev) => ({
      ...prev,
      telefone: maskedValue,
    }));
  };

  const handleLogout = async () => {
    try {
      setIsSaving(true); // Usar isSaving para o logout também
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/");
    } catch (error: any) {
      console.error("Erro ao deslogar:", error.message);
      setError("Erro ao deslogar. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true); // Inicia o carregamento
      setError(null); // Limpa erros anteriores
      
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const userId = session.user.id;

      // Inclua 'estado' e 'cidade' na sua query de select
      const { data, error } = await supabase
        .from("perfil")
        .select("name, email, telefone, cidade, estado, avatar_url")
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        console.error("Erro ao buscar dados do usuário:", error?.message || "Dados não encontrados.");
        setError("Erro ao carregar perfil. Tente novamente.");
        return;
      }

      // *** Adicionado console.log para depuração ***
      console.log("Dados do perfil carregados do Supabase:", data);

      // Preenche o estado 'profile' com os dados do banco de dados
      setProfile({
        name: data.name || "",
        email: data.email || "",
        telefone: formatPhoneNumber(data.telefone || ""), // Aplica a máscara ao carregar
        cidade: data.cidade || "",
        estado: data.estado || "",
        avatar_url: data.avatar_url || "",
      });

      // Define a pré-visualização do avatar se houver uma URL
      if (data.avatar_url) {
        setPreview(data.avatar_url);
      }

    } catch (error: any) {
      console.error("Erro ao buscar dados do usuário:", error.message);
      setError("Erro ao carregar perfil. Tente novamente.");
    } finally {
      setLoading(false); // Finaliza o carregamento
    }
  }, [router, formatPhoneNumber]);

  // Efeito para carregar os dados do usuário ao montar o componente
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Função para upload do avatar
  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!file) return null;

    try {
      // Cria um nome de arquivo único para evitar colisões
      const fileName = `${userId}/${Date.now()}_${file.name}`;
      
      // Faz o upload do arquivo para o bucket 'box' na pasta 'perfil'
      const { error: uploadError } = await supabase.storage
        .from("box")
        .upload(`perfil/${fileName}`, file, {
          cacheControl: '3600', // Cache por 1 hora
          upsert: false // Não sobrescrever se já existir (opcional, dependendo da sua lógica)
        });

      if (uploadError) throw uploadError;

      // Obtém a URL pública do arquivo
      const { data } = supabase.storage
        .from("box")
        .getPublicUrl(`perfil/${fileName}`);

      return data.publicUrl;
    } catch (err: any) {
      console.error("Erro ao fazer upload da imagem:", err.message);
      setError("Erro ao fazer upload da imagem: " + err.message);
      return null;
    }
  };

  // Função para salvar as alterações do perfil
  const updateProfile = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSaving(true); // Inicia o salvamento
    setError(null);
    setSuccess(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Sessão expirada. Por favor, faça login novamente.");
        router.push("/login");
        return;
      }

      const userId = session.user.id;
      let newAvatarUrl = profile.avatar_url; // Começa com a URL atual do perfil

      // Se um novo arquivo foi selecionado, faça o upload
      if (file) {
        const uploadedUrl = await uploadAvatar(userId);
        if (uploadedUrl) {
          newAvatarUrl = uploadedUrl;
        } else {
          // Se o upload falhou, não continue com o update do perfil (ou decida como lidar)
          setIsSaving(false);
          return; 
        }
      }

      // Remove a máscara do telefone antes de salvar no banco de dados
      const cleanedTelefone = profile.telefone.replace(/\D/g, ''); 

      // Objeto com os dados a serem atualizados
      const updates = {
        name: profile.name,
        email: profile.email, // Supabase Auth gerencia o email, mas você pode querer salvá-lo no perfil também
        telefone: cleanedTelefone,
        cidade: profile.cidade,
        estado: profile.estado,
        avatar_url: newAvatarUrl, // Atualiza com a nova URL do avatar
        // updated_at: new Date().toISOString(), // REMOVIDO: Esta coluna não existe na sua tabela, causando o erro
      };

      const { error: updateError } = await supabase
        .from("perfil")
        .update(updates)
        .eq("user_id", userId);

      if (updateError) {
        throw updateError;
      }

      // Atualiza o estado 'profile' com a nova URL do avatar após o sucesso
      setProfile((prev) => ({ ...prev, avatar_url: newAvatarUrl }));
      setFile(null); // Limpa o arquivo selecionado após o upload bem-sucedido

      setSuccess("Perfil atualizado com sucesso!");

      // *** Adicionado: Redireciona para o dashboard após 3 segundos ***
      setTimeout(() => {
        setIsSheetOpen(false); // Fecha a Sheet antes de redirecionar
        router.refresh(); // Força a atualização da rota atual no Next.js
        router.push("/dashboard");
      }, 3000); // 3000 milissegundos = 3 segundos

    } catch (err: any) {
      console.error("Erro ao atualizar o perfil:", err.message);
      setError("Erro ao atualizar o perfil: " + err.message);
    } finally {
      setIsSaving(false); // Finaliza o salvamento
    }
  };

  // Handler para a seleção de arquivo de avatar
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile)); // Cria uma URL para pré-visualização
    }
  };

  // Renderiza um estado de carregamento enquanto os dados do perfil são buscados inicialmente
  if (loading) {
    return <div className="flex justify-center items-center h-16 bg-gray-100">Carregando perfil...</div>;
  }

  // Renderiza uma mensagem de erro se o perfil não puder ser carregado
  if (error && !profile.name) { // Se houver erro e o perfil estiver vazio
    return <div className="flex justify-center items-center h-16 bg-gray-100 text-red-500">{error}</div>;
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}> {/* Controla a abertura/fechamento da Sheet */}
      <SheetTrigger asChild>
        <Button variant="outline" className="cursor-pointer hover:bg-slate-600">
          <MdMenuOpen size={50} />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Perfil</SheetTitle>
          <SheetDescription>
            Mantenha suas informações atualizadas.
          </SheetDescription>
        </SheetHeader>
        {/* Formulário para edição */}
        <form onSubmit={updateProfile} className="grid flex-1 auto-rows-min gap-6 px-4 py-4">
          {/* Mensagens de erro e sucesso */}
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-2">{success}</p>}

          {/* Seção de Avatar */}
          <div className="mb-4 flex flex-col items-center">
            <Label htmlFor="avatar-upload" className="block text-sm text-black font-medium mb-2">Avatar</Label>
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border border-gray-300 flex items-center justify-center">
              <Image 
                src={preview || profile.avatar_url || "/placeholder-avatar.png"} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
                width={128} 
                height={128} 
                priority // Adicionado priority para LCP se for o caso
              />
            </div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              id="avatar-upload"
              className="text-sm cursor-pointer file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0 file:text-sm file:font-semibold
                         file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" 
              disabled={isSaving}
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="name">Nome completo</Label>
            <Input 
              id="name" // ID corresponde à chave no estado 'profile'
              value={profile.name} 
              onChange={handleChange} 
              disabled={isSaving}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="email">E-mail</Label>
            <Input 
              id="email" 
              value={profile.email} 
              onChange={handleChange} 
              type="email"
              disabled={isSaving}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="telefone">Telefone</Label>
            <Input 
              id="telefone" 
              maxLength={15}
              value={profile.telefone} 
              onChange={handleTelefoneChange} // Handler específico para telefone
              type="tel"
              disabled={isSaving}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="estado">Estado</Label>
            <Input 
              id="estado" 
              value={profile.estado} 
              onChange={handleChange} 
              disabled={isSaving}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="cidade">Cidade</Label>
            <Input 
              id="cidade" 
              value={profile.cidade} 
              onChange={handleChange} 
              disabled={isSaving}
            />
          </div>

          <SheetFooter className="mt-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar alterações"}
            </Button>
            <SheetClose asChild>
              <Button variant="outline" onClick={handleLogout} disabled={isSaving} className="bg-red-400 hover:bg-red-500 cursor-pointer hover:text-white">Sair do app.</Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
