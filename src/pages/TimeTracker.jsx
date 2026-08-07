import { useState, useEffect, useMemo } from "react";
import { Play, Square, Trash2, Clock } from "lucide-react";
import { useTimeTracker } from "../hooks/useTimeTracker";
import { useProjects } from "../hooks/useProjects";

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function isSameDay(a, b) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function isSameWeek(date) {
  const d = new Date(date);
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  return d >= start;
}

function isSameMonth(date) {
  const d = new Date(date);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function durationMs(entry) {
  const end = entry.end_time ? new Date(entry.end_time) : new Date();
  return end - new Date(entry.start_time);
}

export default function TimeTracker() {
  const { entries, activeEntry, loading, startTimer, stopTimer, deleteEntry } = useTimeTracker();
  const { projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState("");
  const [description, setDescription] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!activeEntry) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [activeEntry]);

  const totals = useMemo(() => {
    const completed = entries.filter((e) => e.end_time);
    const today = completed.filter((e) => isSameDay(e.start_time, new Date())).reduce((sum, e) => sum + durationMs(e), 0);
    const week = completed.filter((e) => isSameWeek(e.start_time)).reduce((sum, e) => sum + durationMs(e), 0);
    const month = completed.filter((e) => isSameMonth(e.start_time)).reduce((sum, e) => sum + durationMs(e), 0);
    return { today, week, month };
  }, [entries]);

  const handleStart = async () => {
    await startTimer(selectedProject, description);
    setDescription("");
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-1">Time Tracker</h1>
        <p className="text-sm text-muted">Track hours across every project.</p>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Today", value: totals.today },
          { label: "This Week", value: totals.week },
          { label: "This Month", value: totals.month },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface border border-border rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wide text-accent-purple font-medium mb-2">{label}</p>
            <p className="text-2xl font-semibold text-text-primary">{formatDuration(value)}</p>
          </div>
        ))}
      </div>

      {/* Timer control */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
        {activeEntry ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted mb-1">
                Tracking {activeEntry.projects?.title ? `· ${activeEntry.projects.title}` : ""}
              </p>
              <p className="text-3xl font-semibold text-text-primary font-mono">
                {formatDuration(now - new Date(activeEntry.start_time).getTime())}
              </p>
              {activeEntry.description && (
                <p className="text-sm text-muted mt-1">{activeEntry.description}</p>
              )}
            </div>
            <button
              onClick={stopTimer}
              className="flex items-center gap-2 bg-accent-pink text-text-primary text-sm font-medium px-5 py-3 rounded-lg"
            >
              <Square size={16} /> Stop
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted mb-1.5 block">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full bg-surface-light border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none"
              >
                <option value="">No project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted mb-1.5 block">What are you working on?</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional note"
                className="w-full bg-surface-light border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-muted outline-none"
              />
            </div>
            <button
              onClick={handleStart}
              className="flex items-center gap-2 bg-gradient-accent text-text-primary text-sm font-medium px-5 py-2.5 rounded-lg"
            >
              <Play size={16} /> Start
            </button>
          </div>
        )}
      </div>

      {/* History */}
      <div>
        <p className="text-sm font-medium text-text-primary mb-3">History</p>
        {loading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : entries.filter((e) => e.end_time).length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-8 text-center">
            <Clock size={20} className="text-muted mx-auto mb-2" />
            <p className="text-sm text-muted">No completed sessions yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.filter((e) => e.end_time).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3"
              >
                <div>
                  <p className="text-sm text-text-primary">
                    {entry.projects?.title || "No project"}
                    {entry.description && <span className="text-muted"> — {entry.description}</span>}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {new Date(entry.start_time).toLocaleDateString()} ·{" "}
                    {new Date(entry.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                    {new Date(entry.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm text-text-primary font-mono">{formatDuration(durationMs(entry))}</p>
                  <button onClick={() => deleteEntry(entry.id)} className="text-muted hover:text-accent-pink">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}