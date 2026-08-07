import { useState } from "react";
import { Plus, Calendar, Bell, Repeat, Trash2, Pencil } from "lucide-react";
import { useTasks } from "../hooks/useTasks";
import { useProjects } from "../hooks/useProjects";
import Modal from "../components/ui/Modal";
import PriorityTag from "../components/ui/PriorityTag";

const columns = ["To Do", "In Progress", "Done"];
const priorities = ["Low", "Medium", "High"];
const recurringOptions = ["None", "Daily", "Weekly", "Monthly"];

const emptyForm = {
  title: "",
  description: "",
  project_id: "",
  priority: "Medium",
  status: "To Do",
  due_date: "",
  reminder: false,
  recurring: "None",
};

function TaskCard({ task, onEdit, onDelete, onDragStart,onMove }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className="bg-surface border border-border rounded-xl p-3.5 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm text-text-primary font-medium pr-2">{task.title}</p>
        <PriorityTag priority={task.priority} />
      </div>

      {task.projects?.title && (
        <p className="text-xs text-accent-purple mb-2">{task.projects.title}</p>
      )}

      <div className="flex items-center gap-3 text-xs text-muted">
        {task.due_date && (
          <span className="flex items-center gap-1">
            <Calendar size={11} /> {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
        {task.reminder && <Bell size={11} />}
        {task.recurring !== "None" && (
          <span className="flex items-center gap-1">
            <Repeat size={11} /> {task.recurring}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-border">
  <button onClick={() => onEdit(task)} className="text-muted hover:text-text-primary">
    <Pencil size={12} />
  </button>
  <button onClick={() => onDelete(task.id)} className="text-muted hover:text-accent-pink">
    <Trash2 size={12} />
  </button>
  <select
    value={task.status}
    onChange={(e) => onMove(task.id, e.target.value)}
    className="ml-auto bg-surface-light border border-border rounded-md px-2 py-1 text-xs text-text-primary outline-none"
  >
    <option value="To Do">To Do</option>
    <option value="In Progress">In Progress</option>
    <option value="Done">Done</option>
  </select>
</div>
    </div>
  );
}

export default function Tasks() {
  const { tasks, loading, addTask, updateTask, deleteTask, moveTask } = useTasks();
  const { projects } = useProjects();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [dragOverCol, setDragOverCol] = useState(null);

  const openAdd = (status = "To Do") => {
    setForm({ ...emptyForm, status });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description || "",
      project_id: task.project_id || "",
      priority: task.priority,
      status: task.status,
      due_date: task.due_date || "",
      reminder: task.reminder,
      recurring: task.recurring,
    });
    setEditingId(task.id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      project_id: form.project_id || null,
      due_date: form.due_date || null,
    };
    if (editingId) await updateTask(editingId, payload);
    else await addTask(payload);
    setModalOpen(false);
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    moveTask(taskId, status);
    setDragOverCol(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary mb-1">Tasks</h1>
          <p className="text-sm text-muted">Drag cards between columns to update status.</p>
        </div>
        <button
          onClick={() => openAdd()}
          className="flex items-center gap-2 bg-gradient-accent text-text-primary text-sm font-medium px-4 py-2.5 rounded-lg"
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      {loading ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col);
            return (
              <div
                key={col}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverCol(col);
                }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={(e) => handleDrop(e, col)}
                className={`rounded-2xl p-3 min-h-[200px] transition-colors ${
                  dragOverCol === col ? "bg-surface-light" : "bg-transparent"
                }`}
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <p className="text-sm font-medium text-text-primary">{col}</p>
                  <span className="text-xs text-muted bg-surface px-2 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {colTasks.map((task) => (
                    <TaskCard
  key={task.id}
  task={task}
  onEdit={openEdit}
  onDelete={deleteTask}
  onDragStart={handleDragStart}
  onMove={moveTask}
/>
                  ))}
                </div>

                <button
                  onClick={() => openAdd(col)}
                  className="w-full mt-2.5 text-xs text-muted hover:text-text-primary border border-dashed border-border rounded-xl py-2"
                >
                  + Add task
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Task" : "New Task"}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Task title"
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
            <label className="text-xs text-muted mb-1.5 block">Link to Project</label>
            <select
              value={form.project_id}
              onChange={(e) => setForm({ ...form, project_id: e.target.value })}
              className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
            >
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted mb-1.5 block">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted mb-1.5 block">Due Date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted mb-1.5 block">Repeat</label>
            <select
              value={form.recurring}
              onChange={(e) => setForm({ ...form, recurring: e.target.value })}
              className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
            >
              {recurringOptions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={form.reminder}
              onChange={(e) => setForm({ ...form, reminder: e.target.checked })}
              className="accent-accent-purple"
            />
            Set reminder
          </label>

          <button
            type="submit"
            className="w-full bg-gradient-accent text-text-primary text-sm font-medium py-2.5 rounded-lg mt-2"
          >
            {editingId ? "Save Changes" : "Create Task"}
          </button>
        </form>
      </Modal>
    </div>
  );
}