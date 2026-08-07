import { useState, useMemo } from "react";
import { Plus, Trash2, Check, Receipt, TrendingDown } from "lucide-react";
import { useInvoices } from "../hooks/useInvoices";
import { useExpenses } from "../hooks/useExpenses";
import { useClients } from "../hooks/useClients";
import { useProjects } from "../hooks/useProjects";
import Modal from "../components/ui/Modal";
import InvoiceStatusBadge from "../components/ui/InvoiceStatusBadge";

const tabs = ["Invoices", "Expenses"];
const expenseCategories = ["Software", "Equipment", "Marketing", "Other"];

const emptyInvoiceForm = { client_id: "", project_id: "", invoice_number: "", amount: "", due_date: "", notes: "" };
const emptyExpenseForm = { title: "", amount: "", category: "Other", project_id: "" };

function isThisMonth(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export default function Finance() {
  const { invoices, addInvoice, deleteInvoice, markPaid } = useInvoices();
  const { expenses, addExpense, deleteExpense } = useExpenses();
  const { clients } = useClients();
  const { projects } = useProjects();

  const [tab, setTab] = useState("Invoices");
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState(emptyInvoiceForm);
  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm);

  const stats = useMemo(() => {
    const paidThisMonth = invoices
      .filter((i) => i.status === "Paid" && i.paid_date && isThisMonth(i.paid_date))
      .reduce((sum, i) => sum + Number(i.amount), 0);
    const expensesThisMonth = expenses
      .filter((e) => isThisMonth(e.date))
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const outstanding = invoices
      .filter((i) => i.status !== "Paid")
      .reduce((sum, i) => sum + Number(i.amount), 0);
    return {
      revenue: paidThisMonth,
      expenses: expensesThisMonth,
      profit: paidThisMonth - expensesThisMonth,
      outstanding,
    };
  }, [invoices, expenses]);

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    await addInvoice({
      client_id: invoiceForm.client_id || null,
      project_id: invoiceForm.project_id || null,
      invoice_number: invoiceForm.invoice_number || null,
      amount: Number(invoiceForm.amount),
      due_date: invoiceForm.due_date || null,
      notes: invoiceForm.notes || null,
    });
    setInvoiceForm(emptyInvoiceForm);
    setInvoiceModalOpen(false);
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    await addExpense({
      title: expenseForm.title,
      amount: Number(expenseForm.amount),
      category: expenseForm.category,
      project_id: expenseForm.project_id || null,
    });
    setExpenseForm(emptyExpenseForm);
    setExpenseModalOpen(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-1">Finance</h1>
        <p className="text-sm text-muted">Invoices, expenses, and where your money actually stands.</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-surface border border-border rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-accent-purple font-medium mb-2">Revenue (Month)</p>
          <p className="text-2xl font-semibold text-text-primary">₹{stats.revenue.toLocaleString()}</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-accent-purple font-medium mb-2">Expenses (Month)</p>
          <p className="text-2xl font-semibold text-text-primary">₹{stats.expenses.toLocaleString()}</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-accent-purple font-medium mb-2">Profit (Month)</p>
          <p className={`text-2xl font-semibold ${stats.profit >= 0 ? "text-text-primary" : "text-accent-pink"}`}>
            ₹{stats.profit.toLocaleString()}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-accent-purple font-medium mb-2">Outstanding</p>
          <p className="text-2xl font-semibold text-text-primary">₹{stats.outstanding.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-surface border border-border rounded-lg p-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-sm px-4 py-1.5 rounded-md ${tab === t ? "bg-surface-light text-text-primary" : "text-muted"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <button
          onClick={() => (tab === "Invoices" ? setInvoiceModalOpen(true) : setExpenseModalOpen(true))}
          className="flex items-center gap-2 bg-gradient-accent text-text-primary text-sm font-medium px-4 py-2.5 rounded-lg"
        >
          <Plus size={16} /> {tab === "Invoices" ? "New Invoice" : "New Expense"}
        </button>
      </div>

      {tab === "Invoices" ? (
        invoices.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-10 text-center">
            <Receipt size={20} className="text-muted mx-auto mb-2" />
            <p className="text-sm text-muted">No invoices yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm text-text-primary font-medium">
                      {inv.invoice_number || "Invoice"} · {inv.clients?.name || "No client"}
                    </p>
                    <InvoiceStatusBadge status={inv.status} />
                  </div>
                  <p className="text-xs text-muted">
                    {inv.projects?.title && `${inv.projects.title} · `}
                    Issued {new Date(inv.issued_date).toLocaleDateString()}
                    {inv.due_date && ` · Due ${new Date(inv.due_date).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm text-text-primary font-mono">₹{Number(inv.amount).toLocaleString()}</p>
                  {inv.status !== "Paid" && (
                    <button onClick={() => markPaid(inv.id)} className="text-muted hover:text-green-500" title="Mark Paid">
                      <Check size={16} />
                    </button>
                  )}
                  <button onClick={() => deleteInvoice(inv.id)} className="text-muted hover:text-accent-pink">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : expenses.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-10 text-center">
          <TrendingDown size={20} className="text-muted mx-auto mb-2" />
          <p className="text-sm text-muted">No expenses logged yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((exp) => (
            <div key={exp.id} className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3">
              <div>
                <p className="text-sm text-text-primary font-medium">{exp.title}</p>
                <p className="text-xs text-muted">
                  {exp.category} · {new Date(exp.date).toLocaleDateString()}
                  {exp.projects?.title && ` · ${exp.projects.title}`}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm text-text-primary font-mono">₹{Number(exp.amount).toLocaleString()}</p>
                <button onClick={() => deleteExpense(exp.id)} className="text-muted hover:text-accent-pink">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} title="New Invoice">
        <form onSubmit={handleInvoiceSubmit} className="space-y-3">
          <input
            placeholder="Invoice number (optional)"
            value={invoiceForm.invoice_number}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_number: e.target.value })}
            className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-muted outline-none"
          />
          <select
            value={invoiceForm.client_id}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, client_id: e.target.value })}
            className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
          >
            <option value="">No client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={invoiceForm.project_id}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, project_id: e.target.value })}
            className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
          >
            <option value="">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={invoiceForm.amount}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
            className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-muted outline-none"
            required
          />
          <div>
            <label className="text-xs text-muted mb-1.5 block">Due Date</label>
            <input
              type="date"
              value={invoiceForm.due_date}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
              className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
            />
          </div>
          <textarea
            placeholder="Notes"
            value={invoiceForm.notes}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
            rows={2}
            className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-muted outline-none resize-none"
          />
          <button type="submit" className="w-full bg-gradient-accent text-text-primary text-sm font-medium py-2.5 rounded-lg mt-2">
            Create Invoice
          </button>
        </form>
      </Modal>

      <Modal open={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} title="New Expense">
        <form onSubmit={handleExpenseSubmit} className="space-y-3">
          <input
            placeholder="Expense title"
            value={expenseForm.title}
            onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
            className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-muted outline-none"
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={expenseForm.amount}
            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
            className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-muted outline-none"
            required
          />
          <select
            value={expenseForm.category}
            onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
            className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
          >
            {expenseCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={expenseForm.project_id}
            onChange={(e) => setExpenseForm({ ...expenseForm, project_id: e.target.value })}
            className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
          >
            <option value="">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <button type="submit" className="w-full bg-gradient-accent text-text-primary text-sm font-medium py-2.5 rounded-lg mt-2">
            Add Expense
          </button>
        </form>
      </Modal>
    </div>
  );
}