import { Navbar } from './Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-40 right-[-10%] h-[28rem] w-[28rem] rounded-full bg-[#f8d8b5]/40 blur-3xl" />
        <div className="absolute inset-x-0 top-1/3 h-96 bg-gradient-to-b from-white/70 via-white/40 to-transparent backdrop-blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="relative mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-10 sm:px-6 lg:px-10">
          <div className="fade-in space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
