"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";

interface Props {
  customer: any;
  onClose: () => void;
  onSave: () => void;
}

export default function CustomerForm({ customer, onClose, onSave }: Props) {
  const { data: session } = useSession();
  const currentUser = (session?.user as any)?.username || session?.user?.name || "";
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    telephone: "", name: "", surname: "", dateOfBirth: "", country: "",
    description: "", totalAmount: 0, advancePayment: 0, finishingDate: "", date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(setCategories);
    if (customer) {
      setForm({
        telephone: customer.telephone || "",
        name: customer.name || "",
        surname: customer.surname || "",
        dateOfBirth: customer.dateOfBirth ? customer.dateOfBirth.split("T")[0] : "",
        country: customer.country || "",
        description: customer.description || "",
        totalAmount: customer.totalAmount || 0,
        advancePayment: customer.advancePayment || 0,
        finishingDate: customer.finishingDate ? customer.finishingDate.split("T")[0] : "",
        date: customer.date ? customer.date.split("T")[0] : new Date().toISOString().split("T")[0],
      });
    } else {
      setForm(f => ({ ...f, date: new Date().toISOString().split("T")[0] }));
    }
  }, [customer]);

  const balance = (form.totalAmount || 0) - (form.advancePayment || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = customer ? `/api/customers/${customer._id}` : "/api/customers";
    const method = customer ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      onSave();
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }
    setLoading(false);
  };

  const field = (label: string, key: keyof typeof form, type = "text", required = false) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}{required && " *"}</label>
      <input
        type={type}
        value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: type === "number" ? Number(e.target.value) : e.target.value })}
        required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {customer ? "Edit Customer" : "Add Customer"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-md">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {field("First Name", "name", "text", true)}
            {field("Surname", "surname", "text", true)}
            {field("Telephone No.", "telephone", "tel", true)}
            {field("Country", "country", "text", true)}
            {field("Date of Birth", "dateOfBirth", "date")}
            {field("Entry Date", "date", "date", true)}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Job Category / Service</label>
            <select
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category...</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Total Amount (€)</label>
              <input
                type="number" min="0" step="0.01"
                value={form.totalAmount}
                onChange={(e) => setForm({ ...form, totalAmount: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Advance Payment (€)</label>
              <input
                type="number" min="0" step="0.01"
                value={form.advancePayment}
                onChange={(e) => setForm({ ...form, advancePayment: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Balance (€)</label>
              <input
                type="number" value={balance} readOnly
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500"
              />
            </div>
          </div>

          {field("Finishing Date", "finishingDate", "date")}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Accepted By</label>
            <input
              type="text"
              value={customer ? (customer.acceptedBy || "") : currentUser}
              readOnly
              className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
            />
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50">
              {loading ? "Saving..." : customer ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
