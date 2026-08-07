import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useKnowledgeItems() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("knowledge_items")
      .select("*, clients(id, name)")
      .order("updated_at", { ascending: false });
    if (!error) setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) fetchItems();
  }, [user, fetchItems]);

  const addItem = async (item) => {
    const { error } = await supabase.from("knowledge_items").insert([{ ...item, user_id: user.id }]);
    if (!error) fetchItems();
    return error;
  };

  const updateItem = async (id, updates) => {
    const { error } = await supabase
      .from("knowledge_items")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (!error) fetchItems();
    return error;
  };

  const deleteItem = async (id) => {
    const { error } = await supabase.from("knowledge_items").delete().eq("id", id);
    if (!error) fetchItems();
    return error;
  };

  return { items, loading, addItem, updateItem, deleteItem };
}