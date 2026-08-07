import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useServiceTypes() {
  const { user } = useAuth();
  const [serviceTypes, setServiceTypes] = useState([]);

  const fetchServiceTypes = useCallback(async () => {
    const { data, error } = await supabase
      .from("service_types")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error) setServiceTypes(data);
  }, []);

  useEffect(() => {
    if (user) fetchServiceTypes();
  }, [user, fetchServiceTypes]);

  const addServiceType = async (name, color) => {
    const { error } = await supabase
      .from("service_types")
      .insert([{ name, color, user_id: user.id }]);
    if (!error) fetchServiceTypes();
    return error;
  };

  const updateServiceType = async (id, updates) => {
    const { error } = await supabase.from("service_types").update(updates).eq("id", id);
    if (!error) fetchServiceTypes();
    return error;
  };

  const deleteServiceType = async (id) => {
    const { error } = await supabase.from("service_types").delete().eq("id", id);
    if (!error) fetchServiceTypes();
    return error;
  };

  return { serviceTypes, addServiceType, updateServiceType, deleteServiceType, refetch: fetchServiceTypes };
}