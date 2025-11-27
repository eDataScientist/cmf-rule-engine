import { useAtomValue } from 'jotai';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { fullCanvasModeAtom } from '@/store/atoms/header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isFullCanvas = useAtomValue(fullCanvasModeAtom);

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)' }}>
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        {isFullCanvas ? (
          // Full canvas mode - no padding, fills available space
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        ) : (
          // Normal mode - with padding and max width
          <main className="flex-1 overflow-y-auto p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
