import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { QueryProvider } from './QueryProvider';
import { TenantThemeProvider } from './TenantThemeProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <TenantThemeProvider>
        {children}
        <Toaster richColors position="top-right" />
      </TenantThemeProvider>
    </QueryProvider>
  );
}
