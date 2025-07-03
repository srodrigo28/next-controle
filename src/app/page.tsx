'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false); // Oculta a tela de splash após 3 segundos
      router.push('/login'); // Redireciona para o dashboard
    }, 4000);

    return () => clearTimeout(timer); // Limpa o timer caso o componente seja desmontado
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      {show && (
        <div className="text-center">
          <Image src="/carrega.gif" width={200} height={100} alt="" />
        </div>
      )}
    </div>
  );
}