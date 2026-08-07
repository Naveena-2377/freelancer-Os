import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex bg-base min-h-screen">
      <Sidebar />
      <main className="ml-[280px] flex-1 px-10 py-8">
        <Outlet />
      </main>
    </div>
  );
}