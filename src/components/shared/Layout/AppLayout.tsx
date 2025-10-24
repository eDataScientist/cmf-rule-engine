import { Navbar } from './Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="orbital-glow absolute -left-40 top-10 h-64 w-64" aria-hidden />
        <div className="orbital-glow absolute bottom-0 right-0 h-80 w-80" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(125,211,252,0.25),transparent_60%),radial-gradient(circle_at_80%_0,rgba(191,219,254,0.35),transparent_65%)]" aria-hidden />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="relative mx-auto w-full max-w-6xl flex-1 px-6 py-12 sm:px-8 lg:px-10">
          <div className="subtle-fade-in space-y-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
