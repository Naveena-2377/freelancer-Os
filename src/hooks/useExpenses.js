import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("expenses")
      .select("*, projects(id, title)")
      .order("date", { ascending: false });
    if (!error) setExpenses(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) fetchExpenses();
  }, [user, fetchExpenses]);

  const addExpense = async (expense) => {
    const { error } = await supabase.from("expenses").insert([{ ...expense, user_id: user.id }]);
    if (!error) fetchExpenses();
    return error;
  };

  const deleteExpense = async (id) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (!error) fetchExpenses();
    return error;
  };

  return { expenses, loading, addExpense, deleteExpense, refetch: fetchExpenses };
}