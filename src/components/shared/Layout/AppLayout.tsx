import { Navbar } from './Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[-10%] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[-12%] top-1/3 h-[22rem] w-[22rem] rounded-full bg-secondary/40 blur-3xl" />
        <div className="absolute bottom-[-18%] left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-accent/35 blur-[140px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 pb-16 pt-10 sm:px-6 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
