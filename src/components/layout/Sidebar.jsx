import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  Calendar,
  Clock,
  Wallet,
  BookOpen,
  BarChart3,
  Settings,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/time", label: "Time Tracker", icon: Clock },
  { to: "/finance", label: "Finance", icon: Wallet },
  { to: "/knowledge", label: "Knowledge Hub", icon: BookOpen },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const { user, signOut } = useAuth();

  return (
    <aside className="w-[280px] h-screen bg-surface border-r border-border flex flex-col fixed left-0 top-0">
      <div className="px-6 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-accent" />
          <div>
            <div className="font-semibold text-text-primary leading-tight">FreelancerOS</div>
            <div className="text-xs text-muted">Building in Silence</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-surfaceLight text-text-primary"
                  : "text-muted hover:text-text-primary hover:bg-surfaceLight/60"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-accent flex items-center justify-center text-sm font-semibold text-text-primary">
            {user?.email?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-text-primary truncate">{user?.email ?? "Guest"}</div>
            <button onClick={signOut} className="text-xs text-muted hover:text-accent.pink">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}