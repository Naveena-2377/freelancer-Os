import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*, projects(id, title)")
      .order("sort_order", { ascending: true });
    if (!error) setTasks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) fetchTasks();
  }, [user, fetchTasks]);

  const addTask = async (task) => {
    const { error } = await supabase.from("tasks").insert([{ ...task, user_id: user.id }]);
    if (!error) fetchTasks();
    return error;
  };

  const updateTask = async (id, updates) => {
    const { error } = await supabase.from("tasks").update(updates).eq("id", id);
    if (!error) fetchTasks();
    return error;
  };

  const deleteTask = async (id) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (!error) fetchTasks();
    return error;
  };

  const moveTask = async (id, newStatus) => {
    // optimistic update so drag feels instant
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", id);
    if (error) fetchTasks(); // revert on failure
  };

  return { tasks, loading, addTask, updateTask, deleteTask, moveTask, refetch: fetchTasks };
}