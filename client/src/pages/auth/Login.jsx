import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

import { verifyOrganization, loginUser } from "../../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState(1);

  const [orgName, setOrgName] = useState("");
  const [orgCode, setOrgCode] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  const handleVerifyOrg = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await verifyOrganization(orgCode);

      setOrgName(data.organization.name);
      setOrgCode(data.organization.orgCode);

      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Organization verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser({
        orgCode,
        email,
        password,
        role,
      });

      login({ token: data.token, user: data.user });

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 sm:px-6 overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-[-200px] left-[-200px] w-[420px] h-[420px] sm:w-[550px] sm:h-[550px] bg-emerald-500 opacity-20 blur-[140px] sm:blur-[160px] rounded-full"></div>
      <div className="absolute bottom-[-220px] right-[-200px] w-[480px] h-[480px] sm:w-[650px] sm:h-[650px] bg-cyan-500 opacity-20 blur-[150px] sm:blur-[170px] rounded-full"></div>

      <div className="relative z-10 w-full max-w-md bg-slate-900/40 border border-slate-800 backdrop-blur-xl rounded-3xl p-5 sm:p-8 shadow-2xl">

        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">
          Intelli<span className="text-emerald-400">Flow</span>
        </h2>

        <p className="text-slate-400 text-center mt-1.5 sm:mt-2 text-sm">
          Secure multi-organization login system
        </p>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mt-5 sm:mt-6">
          <div
            className={`w-10 h-2 rounded-full ${
              step === 1 ? "bg-emerald-400" : "bg-slate-700"
            }`}
          ></div>
          <div
            className={`w-10 h-2 rounded-full ${
              step === 2 ? "bg-emerald-400" : "bg-slate-700"
            }`}
          ></div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-3 rounded-xl bg-red-500/20 border border-red-400/40 text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        {/* STEP 1: Verify Organization */}
        {step === 1 && (
          <form onSubmit={handleVerifyOrg} className="mt-6 sm:mt-8 space-y-4 sm:space-y-5">
            <div>
              <label className="text-sm text-slate-300">Organization Code</label>
              <input
                type="text"
                value={orgCode}
                onChange={(e) => setOrgCode(e.target.value.toUpperCase())}
                placeholder="Example: IFLOW-001"
                className="mt-2 w-full px-4 py-2.5 sm:py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-semibold text-base sm:text-lg shadow-xl hover:opacity-95 hover:scale-[1.02] transition disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Organization"}
            </button>

            <p className="text-center text-slate-400 text-sm">
              Don&apos;t have an organization?{" "}
              <Link to="/register" className="text-emerald-300 hover:underline">
                Register here
              </Link>
            </p>
          </form>
        )}

        {/* STEP 2: Login */}
        {step === 2 && (
          <form onSubmit={handleLogin} className="mt-6 sm:mt-8 space-y-4 sm:space-y-5">
            <div className="p-4 rounded-2xl border border-slate-700 bg-slate-950 text-sm text-slate-300">
              <p>
                <span className="font-semibold text-white">Organization:</span>{" "}
                {orgName}
              </p>
              <p>
                <span className="font-semibold text-white">Org Code:</span>{" "}
                {orgCode}
              </p>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-3 text-emerald-300 hover:underline text-sm"
              >
                Change Organization
              </button>
            </div>

            <div>
              <label className="text-sm text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="mt-2 w-full px-4 py-2.5 sm:py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-2 w-full px-4 py-2.5 sm:py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Login As</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-2 w-full px-4 py-2.5 sm:py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
                required
              >
                <option value="">Select Role</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-semibold text-base sm:text-lg shadow-xl hover:opacity-95 hover:scale-[1.02] transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="text-center text-slate-400 text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-emerald-300 hover:underline">
                Register
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

