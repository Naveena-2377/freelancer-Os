import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useClients() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select("*, service_types(id, name, color)")
      .order("created_at", { ascending: false });
    if (!error) setClients(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) fetchClients();
  }, [user, fetchClients]);

  const addClient = async (client) => {
    const { error } = await supabase.from("clients").insert([{ ...client, user_id: user.id }]);
    if (!error) fetchClients();
    return error;
  };

  const updateClient = async (id, updates) => {
    const { error } = await supabase.from("clients").update(updates).eq("id", id);
    if (!error) fetchClients();
    return error;
  };

  const deleteClient = async (id) => {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (!error) fetchClients();
    return error;
  };

  return { clients, loading, addClient, updateClient, deleteClient, refetch: fetchClients };
}