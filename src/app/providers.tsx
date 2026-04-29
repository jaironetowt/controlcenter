'use client';

import { MantineProvider } from '@mantine/core';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider
      theme={{
        fontFamily: 'var(--font-geist-sans), sans-serif',
        primaryColor: 'blue',
        colors: {
          dark: ['#C1C2C5', '#A6A7AB', '#909296', '#5C5F66', '#373A40', '#2C2E33', '#25262B', '#1A1B1E', '#141517', '#101113'],
        },
      }}
    >
      {children}
    </MantineProvider>
  );
}
