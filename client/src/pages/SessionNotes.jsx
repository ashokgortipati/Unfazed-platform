import React, { useState, useEffect } from 'react';
import { notesApi, clientApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { NoteModal } from '../components/notes/NoteModal';
import {
  FileText,
  Plus,
  Filter,
  Lock,
  Eye,
  Edit,
  Trash2,
  Calendar,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

export const SessionNotes = () => {
  const { isTherapist } = useAuth();
  const [notes, setNotes] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await notesApi.getAll({
        type: typeFilter !== 'all' ? typeFilter : undefined,
        visibility: visibilityFilter !== 'all' ? visibilityFilter : undefined,
        clientId: clientFilter || undefined,
      });
      setNotes(res.data.notes || []);
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isTherapist) {
      clientApi.getAll({ status: 'active' }).then((res) => {
        setClients(res.data.clients || []);
      });
    }
  }, [isTherapist]);

  useEffect(() => {
    fetchNotes();
  }, [typeFilter, visibilityFilter, clientFilter]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this clinical session note?')) {
      try {
        await notesApi.delete(id);
        fetchNotes();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {isTherapist ? 'Clinical Session Notes' : 'Shared Session Summaries'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isTherapist
              ? 'Document treatment goals, progress evaluations, and portal-shared summaries'
              : 'View treatment summaries and action items shared by your therapist'}
          </p>
        </div>

        {isTherapist && (
          <button
            onClick={() => {
              setSelectedNote(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-sage-600 hover:bg-sage-700 shadow-sm transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Create Therapy Note
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft flex flex-wrap items-center gap-3">
        {/* Category filter */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700">Category:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sage-500 focus:outline-none bg-white text-slate-700"
          >
            <option value="all">All Categories</option>
            <option value="Progress">Progress Note</option>
            <option value="Summary">Session Summary</option>
            <option value="Treatment Goals">Treatment Goals</option>
            <option value="Intake">Intake Assessment</option>
            <option value="Crisis">Crisis Intervention</option>
            <option value="General">General Note</option>
          </select>
        </div>

        {/* Visibility filter (Therapist only) */}
        {isTherapist && (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">Visibility:</span>
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sage-500 focus:outline-none bg-white text-slate-700"
            >
              <option value="all">All (Private & Shared)</option>
              <option value="private">Private (Only Therapist)</option>
              <option value="shared">Shared with Client Portal</option>
            </select>
          </div>
        )}

        {/* Client filter (Therapist only) */}
        {isTherapist && clients.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">Client:</span>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sage-500 focus:outline-none bg-white text-slate-700"
            >
              <option value="">All Clients</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {!isTherapist && (
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium">
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            <span>Client Privacy Shield: Viewing authorized shared notes only</span>
          </div>
        )}
      </div>

      {/* Notes List */}
      {loading ? (
        <LoadingSpinner text="Retrieving clinical records..." />
      ) : notes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-soft">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No session notes found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {typeFilter !== 'all' || visibilityFilter !== 'all' || clientFilter
              ? 'No records match the selected filter criteria.'
              : 'No therapy session notes have been recorded yet.'}
          </p>
          {isTherapist && (
            <button
              onClick={() => {
                setSelectedNote(null);
                setIsModalOpen(true);
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-sage-600 hover:bg-sage-700 transition"
            >
              + Create Note
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note._id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4 hover:shadow-card transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900">{note.title}</h3>
                  <Badge variant={note.visibility} size="sm">
                    {note.visibility === 'private' ? (
                      <span className="flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Private
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Eye className="w-2.5 h-2.5" /> Shared with Client
                      </span>
                    )}
                  </Badge>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-600">
                    {note.type}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>

                  {isTherapist && (
                    <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                      <button
                        onClick={() => {
                          setSelectedNote(note);
                          setIsModalOpen(true);
                        }}
                        className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        title="Edit note"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(note._id)}
                        className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Client info tag */}
              {isTherapist && (
                <div className="text-xs text-slate-500">
                  Patient:{' '}
                  <span className="font-semibold text-slate-800">
                    {note.client?.name || 'Assigned Client'}
                  </span>
                </div>
              )}

              {/* Session summary */}
              {note.sessionSummary && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <strong className="text-slate-900 block mb-0.5">Session Overview:</strong>
                  {note.sessionSummary}
                </div>
              )}

              {/* Note Content */}
              <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                {note.content}
              </div>

              {/* Treatment Goals tags */}
              {note.treatmentGoals?.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                    Treatment Goals & Practice Items:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {note.treatmentGoals.map((goal, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-sage-50 text-sage-800 border border-sage-200 font-medium"
                      >
                        <CheckCircle2 className="w-3 h-3 text-sage-600" />
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Note Modal */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNote(null);
        }}
        onSuccess={fetchNotes}
        initialData={selectedNote}
      />
    </div>
  );
};
