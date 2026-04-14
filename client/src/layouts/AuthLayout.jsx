import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.15),_transparent_30%),linear-gradient(135deg,_#020617,_#0f172a_55%,_#111827)] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section className="max-w-xl space-y-5">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">FlowNova</p>
            <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">
              Build calmer workflow operations.
            </h1>
            <p className="max-w-lg text-base text-slate-300 md:text-lg">
              Organize teams, route tasks through stages, and keep inbox visibility high
              without letting your operational surface get messy.
            </p>
          </section>
          <section className="rounded-[32px] border border-white/10 bg-slate-950/55 p-6 shadow-2xl backdrop-blur-xl md:p-8">
            <Outlet />
          </section>
        </div>
      </div>
    </div>
  );
}
