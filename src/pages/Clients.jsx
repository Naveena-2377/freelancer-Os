import { useState } from "react";
import { Plus, Mail, Phone, Building2, Trash2, Pencil } from "lucide-react";
import { useClients } from "../hooks/useClients";
import { useServiceTypes } from "../hooks/useServiceTypes";
import Modal from "../components/ui/Modal";
import ServiceTag from "../components/ui/ServiceTag";

const emptyForm = { name: "", email: "", phone: "", company: "", service_type_id: "", notes: "" };

export default function Clients() {
  const { clients, loading, addClient, updateClient, deleteClient } = useClients();
  const { serviceTypes, addServiceType } = useServiceTypes();
  const [modalOpen, setModalOpen] = useState(false);
  const [newServiceOpen, setNewServiceOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (client) => {
    setForm({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      company: client.company || "",
      service_type_id: client.service_type_id || "",
      notes: client.notes || "",
    });
    setEditingId(client.id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, service_type_id: form.service_type_id || null };
    if (editingId) await updateClient(editingId, payload);
    else await addClient(payload);
    setModalOpen(false);
  };

  const handleAddService = async () => {
    if (!newServiceName.trim()) return;
    const colors = ["#a855f7", "#ec4899", "#22c55e", "#f59e0b", "#3b82f6"];
    const color = colors[serviceTypes.length % colors.length];
    await addServiceType(newServiceName.trim(), color);
    setNewServiceName("");
    setNewServiceOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary mb-1">Clients</h1>
          <p className="text-sm text-muted">Every client, every service, in one place.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-gradient-accent text-text-primary text-sm font-medium px-4 py-2.5 rounded-lg"
        >
          <Plus size={16} /> Add Client
        </button>
      </div>

      {loading ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : clients.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-10 text-center">
          <p className="text-text-primary font-medium mb-1">No clients yet</p>
          <p className="text-sm text-muted">Add your first client to start tracking work.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {clients.map((client) => (
            <div key={client.id} className="bg-surface border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-text-primary font-medium">{client.name}</p>
                  {client.company && (
                    <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                      <Building2 size={12} /> {client.company}
                    </p>
                  )}
                </div>
                <ServiceTag serviceType={client.service_types} />
              </div>

              <div className="space-y-1 mb-4">
                {client.email && (
                  <p className="text-xs text-muted flex items-center gap-1.5">
                    <Mail size={12} /> {client.email}
                  </p>
                )}
                {client.phone && (
                  <p className="text-xs text-muted flex items-center gap-1.5">
                    <Phone size={12} /> {client.phone}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-border">
                <button
                  onClick={() => openEdit(client)}
                  className="flex items-center gap-1 text-xs text-muted hover:text-text-primary"
                >
                  <Pencil size={12} /> Edit
                </button>
                <button
                  onClick={() => deleteClient(client.id)}
                  className="flex items-center gap-1 text-xs text-muted hover:text-accent-pink ml-auto"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Client" : "Add Client"}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-muted outline-none"
            required
          />
          <input
            placeholder="Company"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-muted outline-none"
          />
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-muted outline-none"
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-muted outline-none"
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-muted">Service Type</label>
              <button
                type="button"
                onClick={() => setNewServiceOpen(!newServiceOpen)}
                className="text-xs text-accent-purple"
              >
                + New type
              </button>
            </div>
            {newServiceOpen && (
              <div className="flex gap-2 mb-2">
                <input
                  placeholder="e.g. SEO, AI Automation"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="flex-1 bg-surface-light border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary placeholder-muted outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddService}
                  className="bg-gradient-accent text-text-primary text-xs px-3 rounded-lg"
                >
                  Add
                </button>
              </div>
            )}
            <select
              value={form.service_type_id}
              onChange={(e) => setForm({ ...form, service_type_id: e.target.value })}
              className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
            >
              <option value="">No service type</option>
              {serviceTypes.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <textarea
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-muted outline-none resize-none"
          />

          <button
            type="submit"
            className="w-full bg-gradient-accent text-text-primary text-sm font-medium py-2.5 rounded-lg mt-2"
          >
            {editingId ? "Save Changes" : "Add Client"}
          </button>
        </form>
      </Modal>
    </div>
  );
}