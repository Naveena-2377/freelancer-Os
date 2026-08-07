const typeStyles = {
  Meeting: { bg: "#a855f722", text: "#a855f7" },
  "Deep Work": { bg: "#3b82f622", text: "#3b82f6" },
  Deadline: { bg: "#ef444422", text: "#ef4444" },
  Other: { bg: "#8b859822", text: "#8b8598" },
};

export default function EventTypeTag({ type }) {
  const style = typeStyles[type] || typeStyles.Other;
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {type}
    </span>
  );
}