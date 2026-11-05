import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../src/services/api.js';
import ApplicationDetail from '../../components/workflow/ApplicationDetail.jsx';
import { ROLE_LABELS, WORKFLOW_TYPES, formatDate, statusTone, timeAgo, typeLabel } from '../../components/workflow/workflowMeta.js';
import '../../components/workflow/workflowDesk.css';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'In progress' },
  { id: 'returned', label: 'Needs correction' },
  { id: 'done', label: 'Approved' },
  { id: 'declined', label: 'Declined' },
];

const matches = (p, filter) => {
  if (filter === 'active') return !['Approved', 'Declined', 'Returned for Correction'].includes(p.status);
  if (filter === 'returned') return p.status === 'Returned for Correction';
  if (filter === 'done') return p.status === 'Approved';
  if (filter === 'declined') return p.status === 'Declined';
  return true;
};

/**
 * Student application tracking: every submitted form, where it is in the approval route,
 * and a way to correct and resubmit anything that was returned.
 */
export default function ApplicationTracker({ onResubmit, onNavigate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [openId, setOpenId] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.getProcesses();
      setItems((res.data || []).filter((p) => WORKFLOW_TYPES.includes(p.type)));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 20000);
    return () => clearInterval(timer);
  }, [load]);

  const counts = useMemo(() => Object.fromEntries(FILTERS.map((f) => [f.id, items.filter((p) => matches(p, f.id)).length])), [items]);
  const rows = useMemo(() => items.filter((p) => matches(p, filter) && (typeFilter === 'all' || p.type === typeFilter)), [items, filter, typeFilter]);

  return (
    <div className="wfd-root" style={{ padding: '0.5rem 0' }}>
      <div className="wfd-head">
        <h2>Track Applications</h2>
        <p>Follow every ECA, ESA, Examination Form, Subject Medical and Examination Medical application you have submitted.</p>
      </div>

      {error && <div className="wfd-error">{error}</div>}

      <div className="wfd-stats">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className={`wfd-stat ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>
            <b>{counts[f.id]}</b>
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      <div className="wfd-toolbar">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Filter by type">
          <option value="all">All application types</option>
          {WORKFLOW_TYPES.map((t) => (
            <option key={t} value={t}>
              {typeLabel(t)}
            </option>
          ))}
        </select>
        <button type="button" className="wfd-btn" onClick={load}>
          Refresh
        </button>
        <button type="button" className="wfd-btn primary" onClick={() => onNavigate?.('forms_exam')}>
          + New application
        </button>
      </div>

      {loading ? (
        <div className="wfd-card wfd-empty">Loading your applications…</div>
      ) : rows.length === 0 ? (
        <div className="wfd-card wfd-empty">No applications here yet. Open Faculty Forms, fill a form and press Submit.</div>
      ) : (
        rows.map((p) => (
          <div key={p._id} className="wfd-card" style={{ padding: '1rem 1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <b>{p.trackingNumber}</b> <span className="wfd-badge wfd-type">{typeLabel(p.type)}</span>
                <div className="wfd-sub">
                  Submitted {formatDate(p.createdAt)} · updated {timeAgo(p.updatedAt)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`wfd-badge ${statusTone(p.status)}`}>{p.status}</span>
                {p.currentAssignedRole && p.currentAssignedRole !== 'completed' && (
                  <div className="wfd-sub">With: {ROLE_LABELS[p.currentAssignedRole] || p.currentAssignedRole}</div>
                )}
              </div>
            </div>

            <ol className="wfd-stepper">
              {p.stages.map((s) => (
                <li key={s.stageKey} className={s.status}>
                  <i />
                  <span>{ROLE_LABELS[s.role] || s.role}</span>
                </li>
              ))}
            </ol>

            {p.status === 'Returned for Correction' && (
              <div className="wfd-note warn">
                <b>Returned by {p.returnDetails?.returnedByRole}:</b> {p.returnDetails?.reason}
              </div>
            )}
            {p.status === 'Declined' && (
              <div className="wfd-note warn">
                <b>Declined by {p.declineDetails?.declinedByRole}:</b> {p.declineDetails?.reason}
              </div>
            )}
            {p.admissionDetails?.admissionNo && (
              <div className="wfd-note">Dean Office Admission issued: <b>{p.admissionDetails.admissionNo}</b></div>
            )}

            <div className="wfd-btn-row" style={{ marginTop: '.7rem' }}>
              <button type="button" className="wfd-btn sm" onClick={() => setOpenId(p.trackingNumber)}>
                View details & history
              </button>
              {p.permissions?.canResubmit && (
                <button type="button" className="wfd-btn sm primary" onClick={() => onResubmit?.(p)}>
                  Correct & resubmit
                </button>
              )}
            </div>
          </div>
        ))
      )}

      {openId && <ApplicationDetail processId={openId} onClose={() => setOpenId(null)} onChanged={load} />}
    </div>
  );
}
