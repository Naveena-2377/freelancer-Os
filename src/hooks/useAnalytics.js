import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

function isThisMonth(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function isThisYear(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr).getFullYear() === new Date().getFullYear();
}

export function useAnalytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    activeClients: 0,
    revenueMonth: 0,
    revenueYear: 0,
    projectsCompleted: 0,
    hoursWorked: 0,
    tasksCompleted: 0,
    upcomingDeadlines: [],
    outstandingInvoices: 0,
    revenueByService: [],
    tasksByStatus: [],
    monthlyRevenue: [],
  });

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [clientsRes, projectsRes, tasksRes, timeRes, invoicesRes, serviceTypesRes] = await Promise.all([
      supabase.from("clients").select("id"),
      supabase.from("projects").select("id, status, deadline, title, service_type_id"),
      supabase.from("tasks").select("id, status"),
      supabase.from("time_entries").select("start_time, end_time"),
      supabase.from("invoices").select("amount, status, paid_date, issued_date"),
      supabase.from("service_types").select("id, name, color"),
    ]);

    const clients = clientsRes.data || [];
    const projects = projectsRes.data || [];
    const tasks = tasksRes.data || [];
    const timeEntries = timeRes.data || [];
    const invoices = invoicesRes.data || [];
    const serviceTypes = serviceTypesRes.data || [];

    const revenueMonth = invoices
      .filter((i) => i.status === "Paid" && isThisMonth(i.paid_date))
      .reduce((sum, i) => sum + Number(i.amount), 0);

    const revenueYear = invoices
      .filter((i) => i.status === "Paid" && isThisYear(i.paid_date))
      .reduce((sum, i) => sum + Number(i.amount), 0);

    const outstandingInvoices = invoices
      .filter((i) => i.status !== "Paid")
      .reduce((sum, i) => sum + Number(i.amount), 0);

    const hoursWorked = timeEntries
      .filter((e) => e.end_time)
      .reduce((sum, e) => sum + (new Date(e.end_time) - new Date(e.start_time)), 0) / (1000 * 60 * 60);

    const upcomingDeadlines = projects
      .filter((p) => p.deadline && p.status !== "Completed" && new Date(p.deadline) >= new Date())
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);

    const revenueByServiceMap = {};
    invoices
      .filter((i) => i.status === "Paid")
      .forEach((i) => {
        // amount doesn't have service_type directly; approximate via project below if needed
      });

    // Revenue by service type via projects join isn't directly available here without project_id on invoice,
    // so we approximate using project's service_type where invoice.project_id matches
    const projectServiceMap = {};
    projects.forEach((p) => {
      projectServiceMap[p.id] = p.service_type_id;
    });

    const { data: invoicesWithProject } = await supabase
      .from("invoices")
      .select("amount, status, paid_date, project_id");

    (invoicesWithProject || [])
      .filter((i) => i.status === "Paid")
      .forEach((i) => {
        const serviceId = projectServiceMap[i.project_id];
        const service = serviceTypes.find((s) => s.id === serviceId);
        const name = service?.name || "Unassigned";
        revenueByServiceMap[name] = (revenueByServiceMap[name] || 0) + Number(i.amount);
      });

    const revenueByService = Object.entries(revenueByServiceMap).map(([name, value]) => {
      const service = serviceTypes.find((s) => s.name === name);
      return { name, value, color: service?.color || "#8b8598" };
    });

    const tasksByStatus = ["To Do", "In Progress", "Done"].map((status) => ({
      status,
      count: tasks.filter((t) => t.status === status).length,
    }));

    // Monthly revenue for the last 6 months
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString("en-US", { month: "short" });
      const total = invoices
        .filter((inv) => {
          if (inv.status !== "Paid" || !inv.paid_date) return false;
          const pd = new Date(inv.paid_date);
          return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
        })
        .reduce((sum, inv) => sum + Number(inv.amount), 0);
      monthlyRevenue.push({ month: label, revenue: total });
    }

    setData({
      activeClients: clients.length,
      revenueMonth,
      revenueYear,
      projectsCompleted: projects.filter((p) => p.status === "Completed").length,
      hoursWorked: Math.round(hoursWorked * 10) / 10,
      tasksCompleted: tasks.filter((t) => t.status === "Done").length,
      upcomingDeadlines,
      outstandingInvoices,
      revenueByService,
      tasksByStatus,
      monthlyRevenue,
    });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { ...data, loading, refetch: fetchAll };
}