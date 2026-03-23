import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-[-220px] left-[-220px] w-[550px] h-[550px] bg-emerald-500 opacity-20 blur-[160px] rounded-full"></div>
      <div className="absolute bottom-[-260px] right-[-220px] w-[650px] h-[650px] bg-cyan-500 opacity-20 blur-[170px] rounded-full"></div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-10 py-6 border-b border-slate-800/60 bg-slate-950/30 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center font-bold text-lg shadow-lg">
            I
          </div>
          <h1 className="text-2xl font-bold tracking-wide">
            Intelli<span className="text-emerald-400">Flow</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-5 py-2 rounded-xl border border-slate-700 bg-slate-900/40 backdrop-blur hover:border-emerald-400 hover:text-emerald-300 hover:scale-[1.03] transition font-medium"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:opacity-95 hover:scale-[1.03] transition font-semibold shadow-xl text-slate-950"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-10 py-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-14 items-start">
          {/* Left Content */}
          <div>
            <p className="inline-block px-4 py-2 rounded-full bg-slate-900/50 border border-slate-700 text-sm text-slate-300">
              Workflow Automation meets Performance Intelligence
            </p>

            <h2 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight">
              Build smarter workflows with accountability and{" "}
              <span className="text-emerald-400 to-blue-500">performance tracking</span>
            </h2>

            <p className="mt-6 text-lg text-slate-300 leading-relaxed">
             IntelliFlow is a workflow and performance intelligence platform that enables organizations to define structured processes, assign responsibility to groups, and track Performance across every stage with full transparency and accountability.
            </p>

            <div className="mt-10 flex gap-4">
              <Link
                to="/register"
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-blue-400 hover:opacity-95 hover:scale-[1.03] transition font-semibold text-lg shadow-xl text-slate-950"
              >
                Get Started
              </Link>

              <Link
                to="/login"
                className="px-7 py-3 rounded-xl border border-slate-700 bg-slate-900/40 backdrop-blur hover:border-emerald-400 hover:text-emerald-300 hover:scale-[1.03] transition font-semibold text-lg"
              >
                Login
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 text-center">
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                <h3 className="text-2xl font-bold text-emerald-400">99%</h3>
                <p className="text-sm text-slate-400">Transparency</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                <h3 className="text-2xl font-bold text-cyan-400">24/7</h3>
                <p className="text-sm text-slate-400">Tracking</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                <h3 className="text-2xl font-bold text-green-400">100%</h3>
                <p className="text-sm text-slate-400">Audit Ready</p>
              </div>
            </div>
          </div>

          {/* Right Side Feature Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FeatureMiniCard
              title="Workflow Builder"
              desc="Create multi-stage approval pipelines with custom hierarchy."
              icon="⚙️"
            />
            <FeatureMiniCard
              title="Task Tracking"
              desc="Track requests through stages with full status visibility."
              icon="📌"
            />
            <FeatureMiniCard
              title="SLA Monitoring"
              desc="Monitor stage deadlines and detect SLA breaches automatically."
              icon="⏱️"
            />
            <FeatureMiniCard
              title="Audit Logs"
              desc="Record every action for accountability and compliance."
              icon="🛡️"
            />
            <FeatureMiniCard
              title="Analytics"
              desc="Measure performance, bottlenecks, and workload distribution."
              icon="📊"
            />
            <FeatureMiniCard
              title="Multi-Tenant"
              desc="Secure organization-based system with isolated users & data."
              icon="🏢"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} FlowNova — Workflow & Performance
        Intelligence System <br />
        Built with MERN + SLA Tracking + Audit Compliance
      </footer>
    </div>
  );
}

/* Mini Feature Card Component */
function FeatureMiniCard({ title, desc, icon }) {
  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/50 to-slate-950/40 border border-slate-700/60 backdrop-blur-xl hover:border-emerald-400/70 hover:scale-[1.03] transition duration-300 shadow-xl">
      <div className="text-3xl mb-3">{icon}</div>
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <p className="text-slate-300 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
