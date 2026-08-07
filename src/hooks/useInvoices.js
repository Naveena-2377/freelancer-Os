import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("invoices")
      .select("*, clients(id, name), projects(id, title)")
      .order("issued_date", { ascending: false });
    if (!error) setInvoices(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) fetchInvoices();
  }, [user, fetchInvoices]);

  const addInvoice = async (invoice) => {
    const { error } = await supabase.from("invoices").insert([{ ...invoice, user_id: user.id }]);
    if (!error) fetchInvoices();
    return error;
  };

  const updateInvoice = async (id, updates) => {
    const { error } = await supabase.from("invoices").update(updates).eq("id", id);
    if (!error) fetchInvoices();
    return error;
  };

  const deleteInvoice = async (id) => {
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (!error) fetchInvoices();
    return error;
  };

  const markPaid = async (id) => {
    return updateInvoice(id, { status: "Paid", paid_date: new Date().toISOString().split("T")[0] });
  };

  return { invoices, loading, addInvoice, updateInvoice, deleteInvoice, markPaid, refetch: fetchInvoices };
}