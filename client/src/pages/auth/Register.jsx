import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

import { registerOrganization } from "../../services/authService";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState(1);

  const [orgName, setOrgName] = useState("");
  const [orgCode, setOrgCode] = useState("");

  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

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

  const handleOrgSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (orgName.trim() && orgCode.trim()) {
      setStep(2);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await registerOrganization({
        orgName,
        orgCode,
        adminName,
        adminEmail,
        adminPassword,
      });

      login({ token: data.token, user: data.user });

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
          Create your organization & admin account
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

        {/* STEP 1: Organization Setup */}
        {step === 1 && (
          <form onSubmit={handleOrgSubmit} className="mt-6 sm:mt-8 space-y-4 sm:space-y-5">
            <div>
              <label className="text-sm text-slate-300">Organization Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Example: ABC College"
                className="mt-2 w-full px-4 py-2.5 sm:py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">
                Organization ID / Code (Unique)
              </label>
              <input
                type="text"
                value={orgCode}
                onChange={(e) => setOrgCode(e.target.value.toUpperCase())}
                placeholder="Example: IFLOW-001"
                className="mt-2 w-full px-4 py-2.5 sm:py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
                required
              />
              <p className="text-xs text-slate-500 mt-2">
                This code must be unique. Users will use this to login.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-semibold text-base sm:text-lg shadow-xl hover:opacity-95 hover:scale-[1.02] transition"
            >
              Continue
            </button>

            <p className="text-center text-slate-400 text-sm">
              Already have an organization?{" "}
              <Link to="/login" className="text-emerald-300 hover:underline">
                Login
              </Link>
            </p>
          </form>
        )}

        {/* STEP 2: Admin Account Setup */}
        {step === 2 && (
          <form onSubmit={handleRegisterSubmit} className="mt-6 sm:mt-8 space-y-4 sm:space-y-5">
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
                Edit Organization Details
              </button>
            </div>

            <div>
              <label className="text-sm text-slate-300">Admin Full Name</label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Example: Goutham"
                className="mt-2 w-full px-4 py-2.5 sm:py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Admin Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@example.com"
                className="mt-2 w-full px-4 py-2.5 sm:py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Create a strong password"
                className="mt-2 w-full px-4 py-2.5 sm:py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
                required
              />
              <p className="text-xs text-slate-500 mt-2">
                This account will have full admin privileges.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-semibold text-base sm:text-lg shadow-xl hover:opacity-95 hover:scale-[1.02] transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Organization"}
            </button>

            <p className="text-center text-slate-400 text-sm">
              Want to login instead?{" "}
              <Link to="/login" className="text-emerald-300 hover:underline">
                Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
