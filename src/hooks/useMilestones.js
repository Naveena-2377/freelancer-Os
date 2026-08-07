import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export function useMilestones(projectId) {
  const [milestones, setMilestones] = useState([]);

  const fetchMilestones = useCallback(async () => {
    if (!projectId) return;
    const { data, error } = await supabase
      .from("milestones")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });
    if (!error) setMilestones(data);
  }, [projectId]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const addMilestone = async (title, dueDate) => {
    const { error } = await supabase
      .from("milestones")
      .insert([{ project_id: projectId, title, due_date: dueDate || null, sort_order: milestones.length }]);
    if (!error) fetchMilestones();
    return error;
  };

  const toggleMilestone = async (id, completed) => {
    const { error } = await supabase.from("milestones").update({ completed }).eq("id", id);
    if (!error) fetchMilestones();
    return error;
  };

  const deleteMilestone = async (id) => {
    const { error } = await supabase.from("milestones").delete().eq("id", id);
    if (!error) fetchMilestones();
    return error;
  };

  return { milestones, addMilestone, toggleMilestone, deleteMilestone };
}