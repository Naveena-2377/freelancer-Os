import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Clock } from "lucide-react";
import { useCalendarEvents } from "../hooks/useCalendarEvents";
import { useClients } from "../hooks/useClients";
import { useProjects } from "../hooks/useProjects";
import Modal from "../components/ui/Modal";
import EventTypeTag from "../components/ui/EventTypeTag";

const eventTypes = ["Meeting", "Deep Work", "Deadline", "Other"];
const views = ["Month", "Week", "Day"];

const emptyForm = {
  title: "",
  type: "Meeting",
  date: "",
  start_time: "09:00",
  end_time: "10:00",
  client_id: "",
  project_id: "",
  notes: "",
};

function toLocalISOString(date, time) {
  return new Date(`${date}T${time}:00`).toISOString();
}

export default function CalendarPage() {
  const { events, addEvent, deleteEvent } = useCalendarEvents();
  const { clients } = useClients();
  const { projects } = useProjects();
  const [view, setView] = useState("Month");
  const [cursor, setCursor] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const monthDays = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  }, [cursor]);

  const weekDays = useMemo(() => {
    const start = new Date(cursor);
    start.setDate(cursor.getDate() - cursor.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const eventsForDate = (date) => {
    if (!date) return [];
    return events.filter((ev) => {
      const evDate = new Date(ev.start_time);
      return (
        evDate.getFullYear() === date.getFullYear() &&
        evDate.getMonth() === date.getMonth() &&
        evDate.getDate() === date.getDate()
      );
    });
  };

  const shiftCursor = (dir) => {
    const next = new Date(cursor);
    if (view === "Month") next.setMonth(cursor.getMonth() + dir);
    else if (view === "Week") next.setDate(cursor.getDate() + dir * 7);
    else next.setDate(cursor.getDate() + dir);
    setCursor(next);
  };

  const openAdd = (date) => {
    setForm({
      ...emptyForm,
      date: date ? date.toISOString().split("T")[0] : cursor.toISOString().split("T")[0],
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      type: form.type,
      start_time: toLocalISOString(form.date, form.start_time),
      end_time: toLocalISOString(form.date, form.end_time),
      client_id: form.client_id || null,
      project_id: form.project_id || null,
      notes: form.notes || null,
    };
    await addEvent(payload);
    setModalOpen(false);
  };

  const isToday = (date) =>
    date && new Date().toDateString() === date.toDateString();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary mb-1">Calendar</h1>
          <p className="text-sm text-muted">Meetings and deep work, all in one view.</p>
        </div>
        <button
          onClick={() => openAdd(null)}
          className="flex items-center gap-2 bg-gradient-accent text-text-primary text-sm font-medium px-4 py-2.5 rounded-lg"
        >
          <Plus size={16} /> New Event
        </button>
      </div>

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => shiftCursor(-1)} className="text-muted hover:text-text-primary">
            <ChevronLeft size={18} />
          </button>
          <p className="text-text-primary font-medium w-48">
            {view === "Day"
              ? cursor.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
              : monthLabel}
          </p>
          <button onClick={() => shiftCursor(1)} className="text-muted hover:text-text-primary">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="flex gap-1 bg-surface border border-border rounded-lg p-1">
          {views.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`text-xs px-3 py-1.5 rounded-md ${
                view === v ? "bg-surface-light text-text-primary" : "text-muted"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "Month" && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-xs text-muted text-center py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthDays.map((date, i) => {
              const dayEvents = eventsForDate(date);
              return (
                <div
                  key={i}
                  onClick={() => date && openAdd(date)}
                  className={`min-h-[90px] border-b border-r border-border p-1.5 cursor-pointer hover:bg-surface-light/50 ${
                    i % 7 === 6 ? "border-r-0" : ""
                  }`}
                >
                  {date && (
                    <>
                      <p
                        className={`text-xs mb-1 ${
                          isToday(date)
                            ? "w-5 h-5 flex items-center justify-center rounded-full bg-gradient-accent text-text-primary"
                            : "text-muted"
                        }`}
                      >
                        {date.getDate()}
                      </p>
                      <div className="space-y-0.5">
  {dayEvents.slice(0, 2).map((ev) => (
    <div
      key={ev.id}
      onClick={(e) => e.stopPropagation()}
      className="group flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-surface-light text-text-primary truncate"
    >
      <span className="truncate flex-1">{ev.title}</span>
      <button
        onClick={() => deleteEvent(ev.id)}
        className="opacity-0 group-hover:opacity-100 text-muted hover:text-accent-pink shrink-0"
      >
        <Trash2 size={10} />
      </button>
    </div>
  ))}
  {dayEvents.length > 2 && (
    <p className="text-xs text-muted px-1.5">+{dayEvents.length - 2} more</p>
  )}
</div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "Week" && (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date, i) => {
            const dayEvents = eventsForDate(date);
            return (
              <div key={i} className="bg-surface border border-border rounded-xl p-3 min-h-[200px]">
                <p className={`text-xs mb-2 ${isToday(date) ? "text-accent-purple font-medium" : "text-muted"}`}>
                  {date.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}
                </p>
                <div className="space-y-1.5">
  {dayEvents.map((ev) => (
    <div key={ev.id} className="bg-surface-light rounded-lg p-2 group">
      <div className="flex items-start justify-between gap-1">
        <p className="text-xs text-text-primary font-medium truncate">{ev.title}</p>
        <button
          onClick={() => deleteEvent(ev.id)}
          className="opacity-0 group-hover:opacity-100 text-muted hover:text-accent-pink shrink-0"
        >
          <Trash2 size={10} />
        </button>
      </div>
      <p className="text-xs text-muted">
        {new Date(ev.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  ))}
</div>
                <button
                  onClick={() => openAdd(date)}
                  className="text-xs text-muted hover:text-text-primary mt-2"
                >
                  + Add
                </button>
              </div>
            );
          })}
        </div>
      )}

      {view === "Day" && (
        <div className="bg-surface border border-border rounded-2xl p-5">
          {eventsForDate(cursor).length === 0 ? (
            <p className="text-sm text-muted text-center py-10">No events today.</p>
          ) : (
            <div className="space-y-3">
              {eventsForDate(cursor).map((ev) => (
                <div key={ev.id} className="flex items-start gap-3 bg-surface-light rounded-xl p-4">
                  <Clock size={16} className="text-accent-purple mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-text-primary font-medium">{ev.title}</p>
                      <EventTypeTag type={ev.type} />
                    </div>
                    <p className="text-xs text-muted">
                      {new Date(ev.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                      {new Date(ev.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {ev.clients?.name && ` · ${ev.clients.name}`}
                    </p>
                    {ev.notes && <p className="text-xs text-muted mt-1">{ev.notes}</p>}
                  </div>
                  <button onClick={() => deleteEvent(ev.id)} className="text-muted hover:text-accent-pink">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Event">
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Event title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-muted outline-none"
            required
          />

          <div>
            <label className="text-xs text-muted mb-1.5 block">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
            >
              {eventTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted mb-1.5 block">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted mb-1.5 block">Start</label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted mb-1.5 block">End</label>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted mb-1.5 block">Client (optional)</label>
            <select
              value={form.client_id}
              onChange={(e) => setForm({ ...form, client_id: e.target.value })}
              className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
            >
              <option value="">None</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted mb-1.5 block">Project (optional)</label>
            <select
              value={form.project_id}
              onChange={(e) => setForm({ ...form, project_id: e.target.value })}
              className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
            >
              <option value="">None</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <textarea
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-muted outline-none resize-none"
          />

          <button
            type="submit"
            className="w-full bg-gradient-accent text-text-primary text-sm font-medium py-2.5 rounded-lg mt-2"
          >
            Create Event
          </button>
        </form>
      </Modal>
    </div>
  );
}