import { NavLink, Outlet } from "react-router-dom";

const links = [
  ["/", "Dashboard"], ["/runs", "Runs"], ["/compare", "Compare"], ["/failures", "Failure taxonomy"],
  ["/datasets", "Datasets & review"], ["/traces", "Production traces"],
];

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-slate-200 bg-white p-4">
        <div className="mb-6 text-xl font-bold text-indigo-600">RAGScope</div>
        <nav className="space-y-1">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"}
              className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm ${isActive ? "bg-indigo-50 font-semibold text-indigo-700" : "text-slate-600 hover:bg-slate-100"}`}>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-x-auto p-8"><Outlet /></main>
    </div>
  );
}
