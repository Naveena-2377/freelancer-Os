import { useState } from "react";
import { Code2, Video, FileSearch, Receipt, FileText, Link2, Trash2, ExternalLink } from "lucide-react";
import { useProjectLinks } from "../../hooks/useProjectLinks";

const linkTypes = [
  { value: "GitHub", icon: Code2 },
  { value: "Video/Footage", icon: Video },
  { value: "Research", icon: FileSearch },
  { value: "Invoice", icon: Receipt },
  { value: "Proposal", icon: FileText },
  { value: "Other", icon: Link2 },
];

export default function ProjectLinks({ projectId }) {
  const { links, addLink, deleteLink } = useProjectLinks(projectId);
  const [type, setType] = useState("GitHub");
  const [url, setUrl] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    await addLink(type, url.trim());
    setUrl("");
  };

  const iconFor = (t) => linkTypes.find((l) => l.value === t)?.icon || Link2;

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <p className="text-xs text-muted mb-2">Links</p>

      {links.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {links.map((link) => {
            const Icon = iconFor(link.type);
            return (
              <div key={link.id} className="flex items-center gap-2 text-sm bg-surface-light rounded-lg px-3 py-2">
                <Icon size={13} className="text-accent-purple shrink-0" />
                <span className="text-xs text-muted shrink-0">{link.type}</span>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-text-primary truncate hover:underline flex items-center gap-1">
                  {link.url} <ExternalLink size={10} className="shrink-0" />
                </a>
                <button onClick={() => deleteLink(link.id)} className="ml-auto text-muted hover:text-accent-pink shrink-0">
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-surface-light border border-border rounded-lg px-2 py-1.5 text-xs text-text-primary outline-none"
        >
          {linkTypes.map((l) => (
            <option key={l.value} value={l.value}>{l.value}</option>
          ))}
        </select>
        <input
          placeholder="Paste URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 bg-surface-light border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary placeholder-muted outline-none"
        />
        <button type="submit" className="bg-gradient-accent text-text-primary text-xs px-3 rounded-lg shrink-0">
          Add
        </button>
      </form>
    </div>
  );
}