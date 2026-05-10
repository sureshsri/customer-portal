"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit2, Trash2, X } from "lucide-react";
import CustomerForm from "./CustomerForm";

interface Customer {
  _id: string;
  idNo: string;
  telephone: string;
  name: string;
  surname: string;
  country: string;
  description: string;
  totalAmount: number;
  advancePayment: number;
  balancePayment: number;
  date: string;
  finishingDate?: string;
  dateOfBirth?: string;
  acceptedBy: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) { params.set("search", search); params.set("type", searchType); }
    const res = await fetch(`/api/customers?${params}`);
    const data = await res.json();
    setCustomers(data);
    setLoading(false);
  }, [search, searchType]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this customer?")) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    fetchCustomers();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500">{customers.length} records</p>
        </div>
        <button
          onClick={() => { setEditCustomer(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Fields</option>
          <option value="id">By ID</option>
          <option value="ite">By Telephone</option>
        </select>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {search && (
          <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["ID", "Name", "Telephone", "Country", "Service", "Total", "Balance", "Accepted By", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">No customers found</td></tr>
              ) : customers.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-blue-600 font-medium">{c.idNo}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name} {c.surname}</td>
                  <td className="px-4 py-3 text-gray-600">{c.telephone}</td>
                  <td className="px-4 py-3 text-gray-600">{c.country}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-32 truncate">{c.description}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">€{c.totalAmount?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${c.balancePayment > 0 ? "text-orange-600" : "text-green-600"}`}>
                      €{c.balancePayment?.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{c.acceptedBy || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(c.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditCustomer(c); setShowForm(true); }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      ><Edit2 size={14} /></button>
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      ><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <CustomerForm
          customer={editCustomer}
          onClose={() => setShowForm(false)}
          onSave={() => { setShowForm(false); fetchCustomers(); }}
        />
      )}
    </div>
  );
}
