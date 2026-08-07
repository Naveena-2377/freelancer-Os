import { useAuth } from "../context/AuthContext";
import { useAnalytics } from "../hooks/useAnalytics";
import { useTasks } from "../hooks/useTasks";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const analytics = useAnalytics();
  const { tasks } = useTasks();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const pendingTasks = tasks.filter((t) => t.status !== "Done").length;
  const name = user?.email?.split("@")[0];

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-accent-purple font-medium mb-2">
        Today · {today}
      </p>
      <h1 className="text-4xl font-semibold text-text-primary mb-1">
        Good morning, <span className="gradient-text">{name}</span>.
      </h1>
      <p className="text-2xl text-muted mb-8">You have work to win.</p>

      <div className="grid grid-cols-3 gap-5 mb-5">
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-accent-purple" />
            <p className="text-xs uppercase tracking-wide text-accent-purple font-medium">
              Open Tasks
            </p>
          </div>
          <p className="text-4xl font-semibold text-text-primary mb-1">{pendingTasks}</p>
          <p className="text-sm text-muted">tasks still in progress</p>
          <Link to="/tasks" className="text-xs text-accent-purple flex items-center gap-1 mt-3">
            Open Tasks <ArrowRight size={12} />
          </Link>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-accent-purple" />
            <p className="text-xs uppercase tracking-wide text-accent-purple font-medium">
              Revenue This Month
            </p>
          </div>
          <p className="text-4xl font-semibold text-text-primary mb-1">
            ₹{analytics.revenueMonth.toLocaleString()}
          </p>
          <p className="text-sm text-muted">₹{analytics.outstandingInvoices.toLocaleString()} outstanding</p>
          <Link to="/finance" className="text-xs text-accent-purple flex items-center gap-1 mt-3">
            Open Finance <ArrowRight size={12} />
          </Link>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6">
          <p className="text-xs uppercase tracking-wide text-accent-purple font-medium mb-3">
            Active Clients
          </p>
          <p className="text-4xl font-semibold text-text-primary mb-1">{analytics.activeClients}</p>
          <p className="text-sm text-muted">{analytics.hoursWorked}h logged total</p>
          <Link to="/clients" className="text-xs text-accent-purple flex items-center gap-1 mt-3">
            Open Clients <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6">
        <p className="text-xs uppercase tracking-wide text-accent-purple font-medium mb-3">
          Upcoming Deadlines
        </p>
        {analytics.upcomingDeadlines.length === 0 ? (
          <p className="text-sm text-muted">Nothing due soon. You're clear.</p>
        ) : (
          <div className="space-y-2">
            {analytics.upcomingDeadlines.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-surface-light rounded-lg px-3 py-2.5">
                <p className="text-sm text-text-primary">{p.title}</p>
                <p className="text-xs text-muted">{new Date(p.deadline).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}