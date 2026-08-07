const statusStyles = {
  "Not Started": { bg: "#8b859822", text: "#8b8598" },
  "In Progress": { bg: "#a855f722", text: "#a855f7" },
  "Review": { bg: "#f59e0b22", text: "#f59e0b" },
  "Completed": { bg: "#22c55e22", text: "#22c55e" },
};

export default function StatusBadge({ status }) {
  const style = statusStyles[status] || statusStyles["Not Started"];
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-full font-medium"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {status}
    </span>
  );
}