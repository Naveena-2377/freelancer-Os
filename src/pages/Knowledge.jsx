import { useState, useMemo } from "react";
import { Plus, Search, Trash2, Pencil, FileText, X } from "lucide-react";
import { useKnowledgeItems } from "../hooks/useKnowledgeItems";
import { useClients } from "../hooks/useClients";
import Modal from "../components/ui/Modal";
import KnowledgeTypeTag from "../components/ui/KnowledgeTypeTag";

const types = ["SOP", "Template", "Meeting Note", "Client Doc", "Note"];
const emptyForm = { title: "", type: "Note", client_id: "", content: "" };

export default function Knowledge() {
  const { items, loading, addItem, updateItem, deleteItem } = useKnowledgeItems();
  const { clients } = useClients();
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [viewingItem, setViewingItem] = useState(null);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !search ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.content || "").toLowerCase().includes(search.toLowerCase());
      const matchesType = activeType === "All" || item.type === activeType;
      return matchesSearch && matchesType;
    });
  }, [items, search, activeType]);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setForm({
      title: item.title,
      type: item.type,
      client_id: item.client_id || "",
      content: item.content || "",
    });
    setEditingId(item.id);
    setModalOpen(true);
    setViewingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, client_id: form.client_id || null };
    if (editingId) await updateItem(editingId, payload);
    else await addItem(payload);
    setModalOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary mb-1">Knowledge Hub</h1>
          <p className="text-sm text-muted">SOPs, templates, meeting notes, client docs.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-gradient-accent text-text-primary text-sm font-medium px-4 py-2.5 rounded-lg"
        >
          <Plus size={16} /> New Entry
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            placeholder="Search title or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-light border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder-muted outline-none"
          />
        </div>
        <div className="flex gap-1 bg-surface border border-border rounded-lg p-1 overflow-x-auto">
          {["All", ...types].map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`text-xs px-3 py-1.5 rounded-md whitespace-nowrap ${
                activeType === t ? "bg-surface-light text-text-primary" : "text-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-10 text-center">
          <FileText size={20} className="text-muted mx-auto mb-2" />
          <p className="text-sm text-muted">
            {items.length === 0 ? "No entries yet. Add your first SOP or note." : "Nothing matches your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setViewingItem(item)}
              className="bg-surface border border-border rounded-2xl p-4 cursor-pointer hover:border-accent-purple/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-text-primary font-medium pr-2">{item.title}</p>
                <KnowledgeTypeTag type={item.type} />
              </div>
              {item.clients?.name && (
                <p className="text-xs text-accent-purple mb-1.5">{item.clients.name}</p>
              )}
              <p className="text-xs text-muted line-clamp-2">{item.content || "No content"}</p>
              <p className="text-xs text-muted/60 mt-3">
                Updated {new Date(item.updated_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* View entry modal */}
      {viewingItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold text-text-primary">{viewingItem.title}</h2>
                  <KnowledgeTypeTag type={viewingItem.type} />
                </div>
                {viewingItem.clients?.name && (
                  <p className="text-xs text-accent-purple">{viewingItem.clients.name}</p>
                )}
              </div>
              <button onClick={() => setViewingItem(null)} className="text-muted hover:text-text-primary">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-text-primary whitespace-pre-wrap mb-6">{viewingItem.content || "No content."}</p>
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <button
                onClick={() => openEdit(viewingItem)}
                className="flex items-center gap-1.5 text-sm text-muted hover:text-text-primary"
              >
                <Pencil size={13} /> Edit
              </button>
              <button
                onClick={() => {
                  deleteItem(viewingItem.id);
                  setViewingItem(null);
                }}
                className="flex items-center gap-1.5 text-sm text-muted hover:text-accent-pink ml-auto"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Entry" : "New Entry"}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-muted outline-none"
            required
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
          >
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={form.client_id}
            onChange={(e) => setForm({ ...form, client_id: e.target.value })}
            className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
          >
            <option value="">No client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <textarea
            placeholder="Content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={8}
            className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-muted outline-none resize-none"
          />
          <button
            type="submit"
            className="w-full bg-gradient-accent text-text-primary text-sm font-medium py-2.5 rounded-lg mt-2"
          >
            {editingId ? "Save Changes" : "Create Entry"}
          </button>
        </form>
      </Modal>
    </div>
  );
}