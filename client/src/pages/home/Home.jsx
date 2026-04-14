import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ fontFamily: "'Instrument Sans', 'DM Sans', sans-serif", background: "#ffffff", color: "#111", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700&family=Instrument+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --green: #2d6a4f;
          --green-light: #f0f7f4;
          --green-mid: #d8ede6;
          --ink: #111111;
          --ink2: #444;
          --muted: #888;
          --border: #e8e8e4;
          --bg: #ffffff;
          --bg2: #f9f9f7;
        }
        html { scroll-behavior: smooth; }
        a { text-decoration: none; }
        .btn-main {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 26px; background: var(--green); color: #fff;
          font-family: 'Instrument Sans', sans-serif; font-weight: 600;
          font-size: 0.9rem; border-radius: 6px; border: none;
          cursor: pointer; transition: background 0.2s, transform 0.15s;
        }
        .btn-main:hover { background: #235a40; transform: translateY(-1px); }
        .btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 26px; background: transparent; color: var(--ink2);
          font-family: 'Instrument Sans', sans-serif; font-weight: 600;
          font-size: 0.9rem; border-radius: 6px; border: 1.5px solid var(--border);
          cursor: pointer; transition: border-color 0.2s, color 0.2s;
        }
        .btn-outline:hover { border-color: var(--green); color: var(--green); }
        .card {
          background: var(--bg); border: 1px solid var(--border); border-radius: 10px;
          padding: 28px 24px; transition: box-shadow 0.2s, transform 0.2s;
        }
        .card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.07); transform: translateY(-2px); }
        .tag {
          display: inline-block; padding: 3px 10px; border-radius: 20px;
          background: var(--green-light); color: var(--green);
          font-size: 0.72rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;
        }
        .stat-num {
          font-family: 'Baloo 2', sans-serif; font-size: 2.6rem;
          font-weight: 700; color: var(--green); line-height: 1;
        }
        .divider { border: none; border-top: 1px solid var(--border); }
        .section-label {
          font-size: 0.72rem; font-weight: 600; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--muted); margin-bottom: 14px;
        }
        @keyframes up {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .u0 { animation: up 0.6s ease forwards; }
        .u1 { animation: up 0.6s 0.1s ease forwards; opacity: 0; }
        .u2 { animation: up 0.6s 0.2s ease forwards; opacity: 0; }
        .u3 { animation: up 0.6s 0.32s ease forwards; opacity: 0; }
        .u4 { animation: up 0.6s 0.44s ease forwards; opacity: 0; }
      `}</style>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, background: "var(--green)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Instrument Sans'", fontWeight: 700, fontSize: "0.95rem" }}>I</div>
          <span style={{ fontFamily: "'Instrument Sans'", fontWeight: 700, fontSize: "1.05rem", letterSpacing: "-0.01em" }}>Intelli<span style={{ color: "var(--green)" }}>Flow</span></span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/login" className="btn-outline" style={{ padding: "9px 20px", fontSize: "0.85rem" }}>Login</Link>
          <Link to="/register" className="btn-main" style={{ padding: "9px 20px", fontSize: "0.85rem" }}>Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "88px 48px 72px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          {/* Left */}
          <div>
            <div className="section-label u0">Workflow & Performance Platform</div>
            <h1 className="u1" style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: "clamp(2.4rem, 5vw, 3.8rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "0.01em", marginBottom: 20 }}>
              Build smarter workflows with{" "}
              <span style={{ color: "var(--green)" }}>real accountability</span>
            </h1>
            <p className="u2" style={{ fontSize: "1.05rem", color: "var(--ink2)", lineHeight: 1.75, marginBottom: 36, fontWeight: 400, maxWidth: 460 }}>
              IntelliFlow helps organizations define structured processes, assign ownership to teams, and track performance at every stage — transparently.
            </p>
            <div className="u3" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 56 }}>
              <Link to="/register" className="btn-main">
                Start for free
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <Link to="/login" className="btn-outline">Sign in</Link>
            </div>
            {/* Stats */}
            <div className="u4" style={{ display: "flex", gap: 0, paddingTop: 32, borderTop: "1px solid var(--border)" }}>
              {[
                { n: "99%", l: "Transparency" },
                { n: "24/7", l: "Monitoring" },
                { n: "100%", l: "Audit ready" },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, paddingLeft: i === 0 ? 0 : 24, borderLeft: i === 0 ? "none" : "1px solid var(--border)" }}>
                  <div className="stat-num">{s.n}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 4, fontWeight: 500 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — feature cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { icon: "⚙️", title: "Workflow Builder", desc: "Multi-stage pipelines with custom approval hierarchies." },
              { icon: "📌", title: "Task Tracking", desc: "Full status visibility across every request and stage." },
              { icon: "⏱", title: "SLA Monitoring", desc: "Automatic breach detection before deadlines slip." },
              { icon: "🛡", title: "Audit Logs", desc: "Immutable record of every action for compliance." },
              { icon: "📊", title: "Analytics", desc: "Measure bottlenecks and workload distribution." },
              { icon: "🏢", title: "Multi-Tenant", desc: "Isolated orgs with separate users and data." },
            ].map((f, i) => (
              <div key={i} className="card" style={{ background: i % 3 === 0 ? "var(--green-light)" : "#fff" }}>
                <div style={{ fontSize: 22, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: 6, color: "var(--ink)" }}>{f.title}</div>
                <div style={{ fontSize: "0.82rem", color: "var(--ink2)", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* HOW IT WORKS */}
      <section style={{ background: "var(--bg2)", padding: "72px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="section-label">How it works</div>
          <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: "clamp(1.7rem, 3vw, 2.4rem)", fontWeight: 700, letterSpacing: "0.01em", marginBottom: 48 }}>
            Up and running in three steps
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {[
              { n: "01", title: "Define your workflow", body: "Map out stages, assign responsible teams, set escalation rules and SLA targets per step." },
              { n: "02", title: "Track in real time", body: "Requests move through your pipeline automatically. Every stakeholder sees current status instantly." },
              { n: "03", title: "Analyze and improve", body: "Spot bottlenecks, measure throughput, and continuously refine based on real performance data." },
            ].map((s, i) => (
              <div key={i} style={{ padding: "32px 28px", background: "#fff", borderRadius: 10, border: "1px solid var(--border)" }}>
                <div style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: "2.8rem", color: "var(--green-mid)", lineHeight: 1, marginBottom: 16, fontWeight: 700 }}>{s.n}</div>
                <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: 10 }}>{s.title}</div>
                <div style={{ fontSize: "0.875rem", color: "var(--ink2)", lineHeight: 1.7 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* CTA STRIP */}
      <section style={{ background: "var(--green)", padding: "60px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "#fff", fontWeight: 700, lineHeight: 1.2 }}>
              Ready to bring structure to your operations?
            </div>
            <p style={{ color: "rgba(255,255,255,0.7)", marginTop: 8, fontSize: "0.95rem" }}>Free to start. No credit card required.</p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", background: "#fff", color: "var(--green)", fontFamily: "'Instrument Sans'", fontWeight: 700, fontSize: "0.9rem", borderRadius: 6, transition: "opacity 0.2s" }}>
              Create free account
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link to="/login" style={{ display: "inline-flex", alignItems: "center", padding: "12px 26px", background: "transparent", color: "rgba(255,255,255,0.85)", fontFamily: "'Instrument Sans'", fontWeight: 600, fontSize: "0.9rem", borderRadius: 6, border: "1.5px solid rgba(255,255,255,0.35)", transition: "border-color 0.2s" }}>
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "24px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 22, height: 22, background: "var(--green)", borderRadius: 5 }} />
          <span style={{ fontFamily: "'Instrument Sans'", fontWeight: 700, fontSize: "0.9rem" }}>IntelliFlow</span>
        </div>
        <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>© {new Date().getFullYear()} IntelliFlow · MERN + SLA + Audit Compliance</p>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy", "Terms", "Docs"].map(l => (
            <a key={l} href="#" style={{ fontSize: "0.78rem", color: "var(--muted)", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "var(--ink)"}
              onMouseLeave={e => e.target.style.color = "var(--muted)"}
            >{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
