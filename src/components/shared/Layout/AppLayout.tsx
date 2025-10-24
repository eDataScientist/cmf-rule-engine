import { Navbar } from './Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-6rem] h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-4rem] h-96 w-96 rounded-full bg-secondary/40 blur-3xl" />
        <div className="absolute left-[-6rem] top-1/3 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 pb-16 pt-10 md:px-10">
          <div className="space-y-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
