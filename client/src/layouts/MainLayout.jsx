import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="relative flex min-h-screen bg-transparent text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,11,25,0.78),rgba(11,18,32,0.66))]" />
        <div className="absolute left-[-8rem] top-[-7rem] h-72 w-72 rounded-full bg-teal-400/18 blur-3xl" />
        <div className="absolute right-[-5rem] top-20 h-64 w-64 rounded-full bg-sky-400/16 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/3 h-80 w-80 rounded-full bg-indigo-300/10 blur-3xl" />
        <div className="absolute inset-y-0 left-[18rem] w-px bg-white/6" />
      </div>
      <Sidebar sidebarOpen={sidebarOpen} />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="relative z-0 flex-1 px-4 pb-8 pt-3 md:px-6 md:pb-10 md:pt-4 xl:px-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
