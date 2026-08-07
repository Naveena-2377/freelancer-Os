import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export function useProjectLinks(projectId) {
  const [links, setLinks] = useState([]);

  const fetchLinks = useCallback(async () => {
    if (!projectId) return;
    const { data, error } = await supabase
      .from("project_links")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    if (!error) setLinks(data);
  }, [projectId]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const addLink = async (type, url, label) => {
    const { error } = await supabase
      .from("project_links")
      .insert([{ project_id: projectId, type, url, label: label || null }]);
    if (!error) fetchLinks();
    return error;
  };

  const deleteLink = async (id) => {
    const { error } = await supabase.from("project_links").delete().eq("id", id);
    if (!error) fetchLinks();
    return error;
  };

  return { links, addLink, deleteLink };
}