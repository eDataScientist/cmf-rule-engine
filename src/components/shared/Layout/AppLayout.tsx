import { Navbar } from './Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-1/2 left-[-15%] h-[380px] w-[380px] -translate-y-1/2 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-15%] h-[460px] w-[460px] rounded-full bg-sky-200/40 blur-[140px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="container mx-auto flex-1 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
