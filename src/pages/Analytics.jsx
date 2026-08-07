import { useAnalytics } from "../hooks/useAnalytics";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";
import { Users, TrendingUp, CheckCircle2, Clock, ListChecks, AlertCircle, Calendar } from "lucide-react";

const statCards = [
  { key: "activeClients", label: "Active Clients", icon: Users, format: (v) => v },
  { key: "revenueMonth", label: "Revenue This Month", icon: TrendingUp, format: (v) => `₹${v.toLocaleString()}` },
  { key: "revenueYear", label: "Revenue This Year", icon: TrendingUp, format: (v) => `₹${v.toLocaleString()}` },
  { key: "projectsCompleted", label: "Projects Completed", icon: CheckCircle2, format: (v) => v },
  { key: "hoursWorked", label: "Hours Worked", icon: Clock, format: (v) => `${v}h` },
  { key: "tasksCompleted", label: "Tasks Completed", icon: ListChecks, format: (v) => v },
  { key: "outstandingInvoices", label: "Outstanding Invoices", icon: AlertCircle, format: (v) => `₹${v.toLocaleString()}` },
];

export default function Analytics() {
  const analytics = useAnalytics();

  if (analytics.loading) {
    return <p className="text-sm text-muted">Loading analytics...</p>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-1">Analytics</h1>
        <p className="text-sm text-muted">The real numbers behind your freelance business.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map(({ key, label, icon: Icon, format }) => (
          <div key={key} className="bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className="text-accent-purple" />
              <p className="text-xs uppercase tracking-wide text-accent-purple font-medium">{label}</p>
            </div>
            <p className="text-2xl font-semibold text-text-primary">{format(analytics[key])}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Monthly revenue trend */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <p className="text-sm font-medium text-text-primary mb-4">Revenue — Last 6 Months</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={analytics.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2438" />
              <XAxis dataKey="month" stroke="#8b8598" fontSize={12} />
              <YAxis stroke="#8b8598" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e1a2e", border: "1px solid #2a2438", borderRadius: 8 }}
                labelStyle={{ color: "#e5e2eb" }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#a855f7" strokeWidth={2} dot={{ fill: "#a855f7" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by service type */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <p className="text-sm font-medium text-text-primary mb-4">Revenue by Service</p>
          {analytics.revenueByService.length === 0 ? (
            <p className="text-sm text-muted text-center py-16">No paid invoices linked to projects yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={analytics.revenueByService}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {analytics.revenueByService.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e1a2e", border: "1px solid #2a2438", borderRadius: 8 }}
                  formatter={(value) => `₹${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Tasks by status */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <p className="text-sm font-medium text-text-primary mb-4">Tasks by Status</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.tasksByStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2438" />
              <XAxis dataKey="status" stroke="#8b8598" fontSize={12} />
              <YAxis stroke="#8b8598" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e1a2e", border: "1px solid #2a2438", borderRadius: 8 }}
              />
              <Bar dataKey="count" fill="#a855f7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Upcoming deadlines */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <p className="text-sm font-medium text-text-primary mb-4">Upcoming Deadlines</p>
          {analytics.upcomingDeadlines.length === 0 ? (
            <p className="text-sm text-muted text-center py-16">No upcoming deadlines. You're clear.</p>
          ) : (
            <div className="space-y-2">
              {analytics.upcomingDeadlines.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-surface-light rounded-lg px-3 py-2.5">
                  <p className="text-sm text-text-primary truncate pr-2">{p.title}</p>
                  <span className="flex items-center gap-1 text-xs text-muted shrink-0">
                    <Calendar size={11} /> {new Date(p.deadline).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}