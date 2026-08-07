const styles = {
  Paid: { bg: "#22c55e22", text: "#22c55e" },
  Pending: { bg: "#f59e0b22", text: "#f59e0b" },
  Overdue: { bg: "#ef444422", text: "#ef4444" },
};

export default function InvoiceStatusBadge({ status }) {
  const style = styles[status] || styles.Pending;
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-full font-medium"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {status}
    </span>
  );
}