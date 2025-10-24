import { Navbar } from './Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-6rem] h-[28rem] w-[28rem] rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="container relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-16 pt-10 lg:px-10">
          <div className="relative flex-1 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_35px_80px_-45px_rgba(15,23,42,0.85)] backdrop-blur-2xl transition-all duration-500 lg:p-10">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-32 left-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-12 translate-y-12 rounded-full bg-secondary/20 blur-3xl" />
            </div>
            <div className="relative z-10 h-full w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
