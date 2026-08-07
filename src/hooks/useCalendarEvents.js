import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useCalendarEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*, clients(id, name), projects(id, title)")
      .order("start_time", { ascending: true });
    if (!error) setEvents(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) fetchEvents();
  }, [user, fetchEvents]);

  const addEvent = async (event) => {
    const { error } = await supabase.from("calendar_events").insert([{ ...event, user_id: user.id }]);
    if (!error) fetchEvents();
    return error;
  };

  const updateEvent = async (id, updates) => {
    const { error } = await supabase.from("calendar_events").update(updates).eq("id", id);
    if (!error) fetchEvents();
    return error;
  };

  const deleteEvent = async (id) => {
    const { error } = await supabase.from("calendar_events").delete().eq("id", id);
    if (!error) fetchEvents();
    return error;
  };

  return { events, loading, addEvent, updateEvent, deleteEvent };
}