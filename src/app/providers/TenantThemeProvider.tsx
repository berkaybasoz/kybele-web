import { ReactNode, useEffect } from 'react';
import { useTenant } from '../../hooks/useTenant';

export function TenantThemeProvider({ children }: { children: ReactNode }) {
  const tenant = useTenant();

  useEffect(() => {
    if (tenant?.primaryColor) {
      document.documentElement.style.setProperty('--tenant-primary', tenant.primaryColor);
    }
  }, [tenant?.primaryColor]);

  return <>{children}</>;
}
