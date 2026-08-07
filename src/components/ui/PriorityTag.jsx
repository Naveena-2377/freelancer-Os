const priorityStyles = {
  Low: { bg: "#22c55e22", text: "#22c55e" },
  Medium: { bg: "#f59e0b22", text: "#f59e0b" },
  High: { bg: "#ef444422", text: "#ef4444" },
};

export default function PriorityTag({ priority }) {
  const style = priorityStyles[priority] || priorityStyles.Medium;
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {priority}
    </span>
  );
}