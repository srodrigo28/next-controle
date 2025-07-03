/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https', // ou 'http' se desejar liberar ambos
          hostname: '**', // aceita qualquer domínio
        },
      ],
    },
  };  

export default nextConfig;