import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useTimeTracker() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [activeEntry, setActiveEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("time_entries")
      .select("*, projects(id, title)")
      .order("start_time", { ascending: false });
    if (!error) {
      setEntries(data);
      setActiveEntry(data.find((e) => !e.end_time) || null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) fetchEntries();
  }, [user, fetchEntries]);

  const startTimer = async (projectId, description) => {
    if (activeEntry) return; // one timer at a time
    const { error } = await supabase.from("time_entries").insert([
      { user_id: user.id, project_id: projectId || null, description: description || null, start_time: new Date().toISOString() },
    ]);
    if (!error) fetchEntries();
    return error;
  };

  const stopTimer = async () => {
    if (!activeEntry) return;
    const { error } = await supabase
      .from("time_entries")
      .update({ end_time: new Date().toISOString() })
      .eq("id", activeEntry.id);
    if (!error) fetchEntries();
    return error;
  };

  const deleteEntry = async (id) => {
    const { error } = await supabase.from("time_entries").delete().eq("id", id);
    if (!error) fetchEntries();
    return error;
  };

  return { entries, activeEntry, loading, startTimer, stopTimer, deleteEntry, refetch: fetchEntries };
}