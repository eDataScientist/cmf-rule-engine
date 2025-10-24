import { Navbar } from './Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-12%] top-[-10%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,_rgba(124,136,230,0.28),_transparent_60%)] blur-3xl" />
        <div className="absolute right-[-18%] top-[20%] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,_rgba(186,224,208,0.22),_transparent_65%)] blur-3xl" />
        <div className="absolute bottom-[-22%] left-[25%] h-[26rem] w-[30rem] rounded-full bg-[radial-gradient(circle,_rgba(238,220,196,0.24),_transparent_60%)] blur-3xl" />
      </div>

      <Navbar />

      <main className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-28 sm:px-8 lg:px-12">
        <div className="space-y-12 lg:space-y-16">
          {children}
        </div>
      </main>
    </div>
  );
}
