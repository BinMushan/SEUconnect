import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../src/services/api.js';
import ApplicationDetail from './ApplicationDetail.jsx';
import DepartmentLists from './DepartmentLists.jsx';
import { ROLE_LABELS, WORKFLOW_TYPES, formatDate, statusTone, timeAgo, typeLabel } from './workflowMeta.js';
import './workflowDesk.css';

const TABS = [
  { id: 'action', label: 'Action required' },
  { id: 'progress', label: 'In progress' },
  { id: 'returned', label: 'Returned / declined' },
  { id: 'done', label: 'Completed' },
  { id: 'all', label: 'All' },
];

const bucketOf = (p) => {
  if (p.status === 'Approved') return 'done';
  if (p.status === 'Declined' || p.status === 'Returned for Correction') return 'returned';
  return p.permissions?.canAct ? 'action' : 'progress';
};

/**
 * Role-agnostic queue for the five examination workflows. The backend only returns what the
 * signed-in role may see and says (per application) whether that role can act right now.
 *
 * props:
 *  - types: workflow types to show (defaults to all five)
 *  - title / subtitle: page heading
 *  - showDepartmentLists: adds the Examination Branch department-list tab
 *  - initialTypeFilter: preselect a type
 */
export default function WorkflowDesk({ types = WORKFLOW_TYPES, title = 'Examination Workflows', subtitle = '', showDepartmentLists = false, initialTypeFilter = 'all' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('action');
  const [view, setView] = useState('queue'); // 'queue' | 'lists'
  const [typeFilter, setTypeFilter] = useState(initialTypeFilter);
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.getProcesses();
      setItems((res.data || []).filter((p) => types.includes(p.type)));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [types]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 20000);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const counts = useMemo(() => {
    const c = { action: 0, progress: 0, returned: 0, done: 0, all: items.length };
    items.forEach((p) => {
      c[bucketOf(p)] += 1;
    });
    return c;
  }, [items]);

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return items.filter((p) => {
      if (tab !== 'all' && bucketOf(p) !== tab) return false;
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;
      if (!needle) return true;
      return [p.trackingNumber, p.student?.name, p.student?.regNo, p.title].some((v) => String(v || '').toLowerCase().includes(needle));
    });
  }, [items, tab, typeFilter, search]);

  const onChanged = async (updated, message) => {
    if (message) setToast({ text: message });
    await load();
  };

  return (
    <div className="wfd-root">
      <div className="wfd-head">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>

      {error && <div className="wfd-error">{error}</div>}

      {showDepartmentLists && (
        <div className="wfd-btn-row">
          <button type="button" className={`wfd-btn ${view === 'queue' ? 'primary' : ''}`} onClick={() => setView('queue')}>
            Application queue
          </button>
          <button type="button" className={`wfd-btn ${view === 'lists' ? 'primary' : ''}`} onClick={() => setView('lists')}>
            Department-wise lists
          </button>
        </div>
      )}

      {view === 'lists' ? (
        <DepartmentLists items={items} onChanged={load} onOpen={(p) => setOpenId(p.trackingNumber)} />
      ) : (
        <>
          <div className="wfd-stats">
            {TABS.filter((t) => t.id !== 'all').map((t) => (
              <button key={t.id} type="button" className={`wfd-stat ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                <b>{counts[t.id]}</b>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <div className="wfd-toolbar">
            <input type="search" placeholder="Search tracking no., student or registration no." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search applications" />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Filter by type">
              <option value="all">All types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {typeLabel(t)}
                </option>
              ))}
            </select>
            <select value={tab} onChange={(e) => setTab(e.target.value)} aria-label="Filter by state">
              {TABS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label} ({counts[t.id]})
                </option>
              ))}
            </select>
            <button type="button" className="wfd-btn" onClick={load}>
              Refresh
            </button>
          </div>

          <div className="wfd-card">
            {loading ? (
              <div className="wfd-empty">Loading applications…</div>
            ) : rows.length === 0 ? (
              <div className="wfd-empty">{tab === 'action' ? 'Nothing is waiting for your action right now.' : 'No applications match this view.'}</div>
            ) : (
              <table className="wfd-table">
                <thead>
                  <tr>
                    <th>Tracking</th>
                    <th>Type</th>
                    <th>Student</th>
                    <th>Status</th>
                    <th>With</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p._id} className="clickable" onClick={() => setOpenId(p.trackingNumber)}>
                      <td>
                        {p.permissions?.canAct && <span className="wfd-action-dot" title="Waiting for you" />}
                        <b>{p.trackingNumber}</b>
                      </td>
                      <td>
                        <span className="wfd-badge wfd-type">{typeLabel(p.type)}</span>
                      </td>
                      <td>
                        {p.student?.name}
                        <div className="wfd-sub">{p.student?.regNo}</div>
                      </td>
                      <td>
                        <span className={`wfd-badge ${statusTone(p.status)}`}>{p.status}</span>
                      </td>
                      <td>{ROLE_LABELS[p.currentAssignedRole] || p.currentAssignedRole}</td>
                      <td title={formatDate(p.updatedAt, true)}>{timeAgo(p.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {openId && <ApplicationDetail processId={openId} onClose={() => setOpenId(null)} onChanged={onChanged} />}
      {toast && <div className={`wfd-toast ${toast.error ? 'error' : ''}`}>{toast.text}</div>}
    </div>
  );
}
