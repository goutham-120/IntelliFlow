import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(216,237,230,0.9),transparent_22%),linear-gradient(180deg,#ffffff,#f9f9f7_42%,#f3f6f4)] text-slate-900">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700&display=swap');`}</style>

      <Sidebar sidebarOpen={sidebarOpen} />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="relative z-0 flex-1 p-6 md:p-8 bg-gray-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
