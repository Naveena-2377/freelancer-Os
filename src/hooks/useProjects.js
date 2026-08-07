import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*, clients(id, name), service_types(id, name, color)")
      .order("created_at", { ascending: false });
    if (!error) setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) fetchProjects();
  }, [user, fetchProjects]);

  const addProject = async (project) => {
    const { error } = await supabase.from("projects").insert([{ ...project, user_id: user.id }]);
    if (!error) fetchProjects();
    return error;
  };

  const updateProject = async (id, updates) => {
    const { error } = await supabase.from("projects").update(updates).eq("id", id);
    if (!error) fetchProjects();
    return error;
  };

  const deleteProject = async (id) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (!error) fetchProjects();
    return error;
  };

  return { projects, loading, addProject, updateProject, deleteProject, refetch: fetchProjects };
}