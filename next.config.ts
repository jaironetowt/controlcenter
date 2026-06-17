import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  // Tree-shake bibliotecas grandes (ícones/Mantine) — sem isso o bundle inchava
  // e deixava o load de cada página lento.
  experimental: {
    optimizePackageImports: [
      '@tabler/icons-react',
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/dates',
      '@mantine/form',
      '@mantine/modals',
      '@mantine/notifications',
    ],
  },
};

export default nextConfig;
