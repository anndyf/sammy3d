import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transferindo silenciosamente a pasta local do Turbopack para a memória raiz do Mac.
  // Isso impede as perseguições do iCloud Drive ao vivo.
  distDir: '/tmp/sammy3d-cache',
};

export default nextConfig;
