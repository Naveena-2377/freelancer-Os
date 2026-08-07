import { useState } from "react";
import { Sun, Moon, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useServiceTypes } from "../hooks/useServiceTypes";

const colorOptions = ["#a855f7", "#ec4899", "#22c55e", "#f59e0b", "#3b82f6", "#ef4444"];

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { serviceTypes, addServiceType, updateServiceType, deleteServiceType } = useServiceTypes();

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(colorOptions[0]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await addServiceType(newName.trim(), newColor);
    setNewName("");
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditName(s.name);
  };

  const saveEdit = async (id) => {
    if (editName.trim()) await updateServiceType(id, { name: editName.trim() });
    setEditingId(null);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-1">Settings</h1>
        <p className="text-sm text-muted">Account and preferences.</p>
      </div>

      {/* Profile */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-5">
        <p className="text-sm font-medium text-text-primary mb-4">Profile</p>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-accent flex items-center justify-center text-text-primary font-semibold">
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm text-text-primary">{user?.email}</p>
            <p className="text-xs text-muted">Freelancer account</p>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-5">
        <p className="text-sm font-medium text-text-primary mb-4">Appearance</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-text-primary">
            {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
            {theme === "dark" ? "Dark mode" : "Light mode"}
          </div>
          <button
            onClick={toggleTheme}
            className="relative w-11 h-6 rounded-full bg-surface-light border border-border"
          >
            <span
              className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-gradient-accent transition-all ${
                theme === "dark" ? "left-0.5" : "left-6"
              }`}
              style={{ width: 18, height: 18 }}
            />
          </button>
        </div>
      </div>

      {/* Service Types */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <p className="text-sm font-medium text-text-primary mb-1">Service Types</p>
        <p className="text-xs text-muted mb-4">
          These tag your clients and projects — add as many services as you offer.
        </p>

        <div className="space-y-2 mb-4">
          {serviceTypes.map((s) => (
            <div key={s.id} className="flex items-center gap-2 bg-surface-light rounded-lg px-3 py-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              {editingId === s.id ? (
                <>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-text-primary outline-none border-b border-border"
                    autoFocus
                  />
                  <button onClick={() => saveEdit(s.id)} className="text-muted hover:text-green-500">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-muted hover:text-accent-pink">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-text-primary">{s.name}</span>
                  <button onClick={() => startEdit(s)} className="text-muted hover:text-text-primary">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => deleteServiceType(s.id)} className="text-muted hover:text-accent-pink">
                    <Trash2 size={12} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleAdd} className="flex items-center gap-2">
          <div className="flex gap-1">
            {colorOptions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNewColor(c)}
                className={`w-5 h-5 rounded-full ${newColor === c ? "ring-2 ring-white" : ""}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <input
            placeholder="New service type"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 bg-surface-light border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder-muted outline-none"
          />
          <button type="submit" className="flex items-center gap-1 bg-gradient-accent text-text-primary text-xs px-3 py-1.5 rounded-lg">
            <Plus size={12} /> Add
          </button>
        </form>
      </div>
    </div>
  );
}