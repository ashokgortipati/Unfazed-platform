import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { clientApi, appointmentApi, notesApi, fileApi } from '../api/endpoints';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { NoteModal } from '../components/notes/NoteModal';
import { AppointmentModal } from '../components/appointments/AppointmentModal';
import { IntakeFormModal } from '../components/clients/IntakeFormModal';
import { ConsentFormModal } from '../components/clients/ConsentFormModal';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  FileText,
  FileCheck,
  ShieldCheck,
  FolderOpen,
  Plus,
  Upload,
  Download,
  Lock,
  Eye,
  Edit,
  Trash2,
  Clock,
} from 'lucide-react';

export const ClientDetails = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'intake' | 'consent' | 'notes' | 'appointments' | 'files'

  // Modals
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isApptModalOpen, setIsApptModalOpen] = useState(false);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  // File upload state
  const [uploadFileObj, setUploadFileObj] = useState(null);
  const [fileTitle, setFileTitle] = useState('');
  const [fileCategory, setFileCategory] = useState('Worksheet');
  const [fileVisibility, setFileVisibility] = useState('shared');
  const [uploading, setUploading] = useState(false);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const [clientRes, apptsRes, notesRes, filesRes] = await Promise.all([
        clientApi.getById(id),
        appointmentApi.getAll({ client: id }),
        notesApi.getAll({ clientId: id }),
        fileApi.getAll({ clientId: id }),
      ]);
      setClient(clientRes.data.client);
      setAppointments(apptsRes.data.appointments || []);
      setNotes(notesRes.data.notes || []);
      setFiles(filesRes.data.documents || []);
    } catch (err) {
      console.error('Error fetching client details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFileObj) return;

    const formData = new FormData();
    formData.append('file', uploadFileObj);
    formData.append('title', fileTitle || uploadFileObj.name);
    formData.append('category', fileCategory);
    formData.append('clientId', id);
    formData.append('visibility', fileVisibility);

    try {
      setUploading(true);
      await fileApi.upload(formData);
      setUploadFileObj(null);
      setFileTitle('');
      fetchClientData();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Delete this therapy session note?')) {
      try {
        await notesApi.delete(noteId);
        fetchClientData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (window.confirm('Delete this uploaded file?')) {
      try {
        await fileApi.delete(fileId);
        fetchClientData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving clinical records..." size="lg" />;
  }

  if (!client) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-slate-800">Client not found</h2>
        <Link to="/clients" className="text-sage-600 underline text-xs mt-2 inline-block">
          Return to clients
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/clients"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900">{client.name}</h1>
            <Badge variant={client.status}>{client.status}</Badge>
          </div>
          <p className="text-xs text-slate-500">Patient ID: {client._id}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsApptModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" /> Book Session
          </button>
          <button
            onClick={() => {
              setSelectedNote(null);
              setIsNoteModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-sage-600 hover:bg-sage-700 text-white transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> New Note
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-slate-200 flex gap-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'overview', label: 'Overview & Profile' },
          { id: 'intake', label: 'Intake Questionnaire', badge: client.intakeData?.submittedAt ? 'Done' : 'Pending' },
          { id: 'consent', label: 'Digital Consent', badge: client.consentData?.agreed ? 'Signed' : 'Pending' },
          { id: 'notes', label: `Session Notes (${notes.length})` },
          { id: 'appointments', label: `Appointments (${appointments.length})` },
          { id: 'files', label: `Documents (${files.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-3 transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-sage-600 text-sage-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  tab.badge === 'Done' || tab.badge === 'Signed'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Contact & Personal Details
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block">Email Address</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {client.email}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Phone</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {client.phone || 'Not provided'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Date of Birth</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />{' '}
                  {client.dateOfBirth
                    ? new Date(client.dateOfBirth).toLocaleDateString()
                    : 'Not provided'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Onboarded Since</span>
                <span className="font-semibold text-slate-800">
                  {new Date(client.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Therapeutic Focus Summary</h3>
              {client.intakeData?.therapyGoals ? (
                <div className="p-4 rounded-2xl bg-sage-50/60 border border-sage-100 text-xs text-slate-700 leading-relaxed">
                  <strong className="block text-sage-900 mb-1">Declared Therapy Goals:</strong>
                  {client.intakeData.therapyGoals}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No therapy goals recorded yet. Clinical intake form is pending.
                </p>
              )}

              {client.intakeData?.currentSymptoms?.length > 0 && (
                <div className="mt-4">
                  <span className="text-xs font-semibold text-slate-700 block mb-2">
                    Reported Symptoms:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {client.intakeData.currentSymptoms.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Intake Questionnaire */}
      {activeTab === 'intake' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Clinical Intake Questionnaire</h3>
              <p className="text-xs text-slate-500">
                {client.intakeData?.submittedAt
                  ? `Submitted on ${new Date(client.intakeData.submittedAt).toLocaleDateString()} at ${new Date(client.intakeData.submittedAt).toLocaleTimeString()}`
                  : 'Pending patient submission'}
              </p>
            </div>
            <button
              onClick={() => setIsIntakeModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-sage-100 text-sage-800 hover:bg-sage-200 transition"
            >
              {client.intakeData?.submittedAt ? 'Edit Intake Data' : 'Fill Intake Form'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
                Emergency Contact
              </span>
              <p className="text-slate-700">
                <strong>Name:</strong> {client.intakeData?.emergencyContact?.name || 'N/A'}
              </p>
              <p className="text-slate-700">
                <strong>Relationship:</strong>{' '}
                {client.intakeData?.emergencyContact?.relationship || 'N/A'}
              </p>
              <p className="text-slate-700">
                <strong>Phone:</strong> {client.intakeData?.emergencyContact?.phone || 'N/A'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
                Medical & Psych History
              </span>
              <p className="text-slate-700 leading-relaxed">
                {client.intakeData?.medicalHistory || 'No previous medical history recorded.'}
              </p>
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider mb-2">
              Therapy Goals & Motivations
            </span>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
              {client.intakeData?.therapyGoals || 'No specific goals provided.'}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Digital Consent */}
      {activeTab === 'consent' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Digital Consent & Legal Agreement</h3>
              <p className="text-xs text-slate-500">Informed consent compliance record</p>
            </div>
            <button
              onClick={() => setIsConsentModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-sage-100 text-sage-800 hover:bg-sage-200 transition"
            >
              Update / Review Consent Form
            </button>
          </div>

          {client.consentData?.agreed ? (
            <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 space-y-3">
              <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <span>Consent Executed and Legally Recorded</span>
              </div>
              <p>
                <strong>Electronic Signature:</strong>{' '}
                <span className="font-serif italic font-semibold text-emerald-950 text-sm">
                  "{client.consentData.signatureName}"
                </span>
              </p>
              <p>
                <strong>Timestamp:</strong> {new Date(client.consentData.signedAt).toLocaleString()}
              </p>
              <p>
                <strong>Terms Version:</strong> {client.consentData.termsVersion || '1.0'}
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
              <span className="font-bold text-sm block">Consent Pending</span>
              <p>
                The client has not yet executed their digital informed consent agreement. You can send
                them a reminder or record it manually with the button above.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Session Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Clinical Session Notes</h3>
              <p className="text-xs text-slate-500">
                Notice: Private notes are strictly shielded from the client portal
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedNote(null);
                setIsNoteModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-sage-600 text-white hover:bg-sage-700 transition"
            >
              + Create Note
            </button>
          </div>

          {notes.length === 0 ? (
            <p className="text-xs text-slate-400 p-8 text-center bg-white rounded-2xl border border-slate-100">
              No session notes recorded for this client yet.
            </p>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note._id}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-soft space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{note.title}</h4>
                      <Badge variant={note.visibility} size="sm">
                        {note.visibility === 'private' ? (
                          <span className="flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Private
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Eye className="w-2.5 h-2.5" /> Shared
                          </span>
                        )}
                      </Badge>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {note.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <button
                        onClick={() => {
                          setSelectedNote(note);
                          setIsNoteModalOpen(true);
                        }}
                        className="text-slate-500 hover:text-slate-800"
                        title="Edit note"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="text-rose-400 hover:text-rose-600"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {note.sessionSummary && (
                    <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700">
                      <strong>Summary: </strong> {note.sessionSummary}
                    </div>
                  )}

                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>

                  {note.treatmentGoals?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {note.treatmentGoals.map((g, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[11px] bg-sage-50 text-sage-800 border border-sage-100"
                        >
                          🎯 {g}
                        </span>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 block pt-1">
                    Recorded {new Date(note.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Appointments History */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-slate-900">Session History</h3>
            <button
              onClick={() => setIsApptModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-sage-600 text-white hover:bg-sage-700 transition"
            >
              + Schedule
            </button>
          </div>

          {appointments.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No sessions scheduled with this client yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {appointments.map((appt) => (
                <div key={appt._id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 mr-2">{appt.date}</span>
                    <span className="text-slate-500">
                      {appt.startTime} - {appt.endTime}
                    </span>
                    <span className="ml-2 text-slate-400">({appt.sessionType})</span>
                    {appt.notes && <p className="text-slate-500 mt-1 italic">{appt.notes}</p>}
                  </div>
                  <Badge variant={appt.status}>{appt.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Files & Documents */}
      {activeTab === 'files' && (
        <div className="space-y-6">
          {/* Upload card */}
          <form
            onSubmit={handleFileUpload}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-900">Upload Clinical Document / Worksheet</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  value={fileTitle}
                  onChange={(e) => setFileTitle(e.target.value)}
                  placeholder="e.g. CBT Thought Diary PDF"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sage-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={fileCategory}
                  onChange={(e) => setFileCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sage-500 focus:outline-none"
                >
                  <option value="Worksheet">Therapy Worksheet</option>
                  <option value="Intake Form">Intake Form</option>
                  <option value="Assessment">Clinical Assessment</option>
                  <option value="Medical Record">Medical Record</option>
                  <option value="Other">Other Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Visibility</label>
                <select
                  value={fileVisibility}
                  onChange={(e) => setFileVisibility(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sage-500 focus:outline-none"
                >
                  <option value="shared">Shared with Client Portal</option>
                  <option value="private">Private (Clinician Only)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="file"
                onChange={(e) => setUploadFileObj(e.target.files[0])}
                className="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sage-50 file:text-sage-700 hover:file:bg-sage-100"
                required
              />
              <button
                type="submit"
                disabled={uploading || !uploadFileObj}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-sage-600 hover:bg-sage-700 transition disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </form>

          {/* Files List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Patient Document Library</h3>
            {files.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No documents uploaded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {files.map((file) => (
                  <div key={file._id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{file.title}</span>
                        <Badge variant={file.visibility} size="sm">
                          {file.visibility}
                        </Badge>
                      </div>
                      <span className="text-slate-400 text-[11px] block mt-0.5">
                        {file.category} • {(file.size / 1024).toFixed(1)} KB • Uploaded{' '}
                        {new Date(file.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={fileApi.downloadUrl(file._id)}
                        className="p-1.5 text-sage-600 hover:bg-sage-50 rounded-lg transition"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDeleteFile(file._id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        title="Delete file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setSelectedNote(null);
        }}
        onSuccess={fetchClientData}
        defaultClientId={id}
        initialData={selectedNote}
      />

      <AppointmentModal
        isOpen={isApptModalOpen}
        onClose={() => setIsApptModalOpen(false)}
        onSuccess={fetchClientData}
        initialData={{ client: id }}
      />

      <IntakeFormModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        clientId={id}
        existingData={client.intakeData}
        onSuccess={fetchClientData}
      />

      <ConsentFormModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        clientId={id}
        existingData={client.consentData}
        onSuccess={fetchClientData}
      />
    </div>
  );
};
