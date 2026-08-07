const typeStyles = {
  SOP: { bg: "#a855f722", text: "#a855f7" },
  Template: { bg: "#3b82f622", text: "#3b82f6" },
  "Meeting Note": { bg: "#f59e0b22", text: "#f59e0b" },
  "Client Doc": { bg: "#ec489922", text: "#ec4899" },
  Note: { bg: "#8b859822", text: "#8b8598" },
};

export default function KnowledgeTypeTag({ type }) {
  const style = typeStyles[type] || typeStyles.Note;
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {type}
    </span>
  );
}