import { useEffect, useState, type ComponentType } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';
import { LoginPage } from '@/features/auth/LoginPage';
import { SystemProLoader } from '@/features/auth/SystemProLoader';

function AuthenticatedApp() {
  const { status } = useAuth();
  const [PwaController, setPwaController] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') return;
    let mounted = true;
    const timer = window.setTimeout(() => {
      void import('@/features/pwa/PwaController')
        .then(({ PwaController: Controller }) => {
          if (mounted) setPwaController(() => Controller);
        })
        .catch(() => undefined);
    }, 800);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [status]);

  if (status === 'loading') return <SystemProLoader />;
  if (status === 'error') {
    return <SystemProLoader message="The sign-in service is unavailable" onRetry={() => window.location.reload()} />;
  }
  if (status === 'anonymous') return <LoginPage />;

  return (
    <>
      <RouterProvider router={router} />
      {PwaController && <PwaController />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}