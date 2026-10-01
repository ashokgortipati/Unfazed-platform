import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clientApi } from '../api/endpoints';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AddClientModal } from '../components/clients/AddClientModal';
import {
  Users,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Trash2,
  FileCheck,
  Clock,
  Phone,
  Mail,
  AlertCircle,
} from 'lucide-react';

export const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await clientApi.getAll({ search, status: statusFilter });
      setClients(res.data.clients || []);
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleDeleteClient = async (id, name) => {
    if (
      window.confirm(
        `Are you sure you want to remove client "${name}"? This will permanently delete their clinical records, appointments, and therapy notes.`
      )
    ) {
      try {
        await clientApi.delete(id);
        fetchClients();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Client Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your patient roster, clinical intakes, and portal access
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-sage-600 hover:bg-sage-700 shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Client
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name, email, or phone..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sage-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sage-500 focus:outline-none bg-white text-slate-700"
          >
            <option value="all">All Clients ({clients.length})</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Client List Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving clients..." />
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-soft">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No clients found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search || statusFilter !== 'all'
              ? 'Try modifying your search query or filter options.'
              : 'Start building your practice by onboarding your first client.'}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-sage-600 hover:bg-sage-700 transition"
          >
            + Add Client
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">Client Name</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Consent Agreement</th>
                  <th className="px-6 py-4">Intake Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((client) => {
                  const hasConsent = client.consentData?.agreed;
                  const hasIntake = !!client.intakeData?.submittedAt;

                  return (
                    <tr key={client._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                        <Link
                          to={`/clients/${client._id}`}
                          className="flex items-center gap-3 hover:text-sage-600 transition"
                        >
                          <div className="w-8 h-8 rounded-full bg-sage-100 text-sage-800 font-bold flex items-center justify-center text-xs">
                            {client.name.charAt(0)}
                          </div>
                          <span>{client.name}</span>
                        </Link>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <Mail className="w-3 h-3 text-slate-400" /> {client.email}
                          </span>
                          {client.phone && (
                            <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                              <Phone className="w-3 h-3 text-slate-400" /> {client.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={client.status}>{client.status}</Badge>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {hasConsent ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-medium">
                            <FileCheck className="w-3.5 h-3.5 text-emerald-600" /> Signed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium">
                            <Clock className="w-3.5 h-3.5 text-amber-500" /> Pending
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {hasIntake ? (
                          <span className="inline-flex items-center gap-1 text-teal-700 text-xs font-medium">
                            <FileCheck className="w-3.5 h-3.5 text-teal-600" /> Completed
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium">Not submitted</span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/clients/${client._id}`}
                            className="p-1.5 rounded-lg text-sage-700 hover:bg-sage-50 transition"
                            title="View Client Profile"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClient(client._id, client.name)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                            title="Delete Client"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchClients}
      />
    </div>
  );
};
