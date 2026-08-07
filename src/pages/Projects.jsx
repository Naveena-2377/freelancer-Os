import { useState } from "react";
import { Plus, Calendar, Trash2, Pencil, ChevronDown, ChevronUp, Check, X as XIcon } from "lucide-react";
import { useProjects } from "../hooks/useProjects";
import { useClients } from "../hooks/useClients";
import { useServiceTypes } from "../hooks/useServiceTypes";
import { useMilestones } from "../hooks/useMilestones";
import Modal from "../components/ui/Modal";
import ServiceTag from "../components/ui/ServiceTag";
import StatusBadge from "../components/ui/StatusBadge";
import FileUploadStub from "../components/projects/FileUploadStub";
import ProjectLinks from "../components/projects/ProjectLinks";

const emptyForm = {
  title: "",
  description: "",
  client_id: "",
  service_type_id: "",
  status: "Not Started",
  deadline: "",
};

const statuses = ["Not Started", "In Progress", "Review", "Completed"];

function MilestoneList({ projectId }) {
  const { milestones, addMilestone, toggleMilestone, deleteMilestone } = useMilestones(projectId);
  const [newTitle, setNewTitle] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await addMilestone(newTitle.trim());
    setNewTitle("");
  };

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <p className="text-xs text-muted mb-2">Milestones</p>
      <div className="space-y-1.5 mb-2">
        {milestones.map((m) => (
          <div key={m.id} className="flex items-center gap-2 text-sm">
            <button
              onClick={() => toggleMilestone(m.id, !m.completed)}
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                m.completed ? "bg-accent-purple border-accent-purple" : "border-border"
              }`}
            >
              {m.completed && <Check size={10} className="text-text-primary" />}
            </button>
            <span className={m.completed ? "text-muted line-through" : "text-text-primary"}>{m.title}</span>
            <button
              onClick={() => deleteMilestone(m.id)}
              className="ml-auto text-muted hover:text-accent-pink"
            >
              <XIcon size={12} />
            </button>
          </div>
        ))}
      </div>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          placeholder="Add milestone..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 bg-surface-light border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary placeholder-muted outline-none"
        />
        <button type="submit" className="bg-gradient-accent text-text-primary text-xs px-3 rounded-lg">
          Add
        </button>
      </form>
    </div>
  );
}

export default function Projects() {
  const { projects, loading, addProject, updateProject, deleteProject } = useProjects();
  const { clients } = useClients();
  const { serviceTypes } = useServiceTypes();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [expandedId, setExpandedId] = useState(null);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (project) => {
    setForm({
      title: project.title,
      description: project.description || "",
      client_id: project.client_id || "",
      service_type_id: project.service_type_id || "",
      status: project.status,
      deadline: project.deadline || "",
    });
    setEditingId(project.id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      client_id: form.client_id || null,
      service_type_id: form.service_type_id || null,
      deadline: form.deadline || null,
    };
    if (editingId) await updateProject(editingId, payload);
    else await addProject(payload);
    setModalOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary mb-1">Projects</h1>
          <p className="text-sm text-muted">Every project, tracked start to finish.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-gradient-accent text-text-primary text-sm font-medium px-4 py-2.5 rounded-lg"
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {loading ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : projects.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-10 text-center">
          <p className="text-text-primary font-medium mb-1">No projects yet</p>
          <p className="text-sm text-muted">Create your first project to start tracking.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => {
            const isExpanded = expandedId === project.id;
            return (
              <div key={project.id} className="bg-surface border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-text-primary font-medium">{project.title}</p>
                      <StatusBadge status={project.status} />
                      <ServiceTag serviceType={project.service_types} />
                    </div>
                    <p className="text-xs text-muted">
                      {project.clients?.name || "No client"}
                      {project.deadline && (
                        <span className="inline-flex items-center gap-1 ml-3">
                          <Calendar size={11} />
                          {new Date(project.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => openEdit(project)} className="text-muted hover:text-text-primary">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteProject(project.id)} className="text-muted hover:text-accent-pink">
                      <Trash2 size={14} />
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : project.id)}
                      className="text-muted hover:text-text-primary"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <>
                    {project.description && (
                      <p className="text-sm text-muted mt-3 pt-3 border-t border-border">
                        {project.description}
                      </p>
                    )}
                    <MilestoneList projectId={project.id} />
                    <ProjectLinks projectId={project.id} />
                    <div className="mt-3 pt-3 border-t border-border">
                    <FileUploadStub />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Project" : "New Project"}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Project title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-muted outline-none"
            required
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-muted outline-none resize-none"
          />

          <div>
            <label className="text-xs text-muted mb-1.5 block">Client</label>
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
          </div>

          <div>
            <label className="text-xs text-muted mb-1.5 block">Service Type</label>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted mb-1.5 block">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted mb-1.5 block">Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-accent text-text-primary text-sm font-medium py-2.5 rounded-lg mt-2"
          >
            {editingId ? "Save Changes" : "Create Project"}
          </button>
        </form>
      </Modal>
    </div>
  );
}