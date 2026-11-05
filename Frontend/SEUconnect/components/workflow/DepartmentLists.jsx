import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../src/services/api.js';
import { deptShort, formatDate, typeLabel } from './workflowMeta.js';
import './workflowDesk.css';

/**
 * Examination Branch: department-wise ECA / ESA lists.
 *  - "Ready to send": applications SAR forwarded, grouped by department and form type.
 *  - "Sent lists": lists already dispatched to a department / HOD (read-only history).
 */
export default function DepartmentLists({ items, onChanged, onOpen }) {
  const [sent, setSent] = useState([]);
  const [busyKey, setBusyKey] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadSent = useCallback(async () => {
    try {
      const res = await api.getDepartmentLists();
      setSent(res.data || []);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    loadSent();
  }, [loadSent, items.length]);

  const groups = useMemo(() => {
    const map = {};
    items
      .filter((p) => p.permissions?.canAct && p.permissions?.sendsDepartmentList)
      .forEach((p) => {
        const key = `${p.type}|${deptShort(p.student?.department)}`;
        if (!map[key]) map[key] = { key, type: p.type, dept: deptShort(p.student?.department), department: p.student?.department, apps: [] };
        map[key].apps.push(p);
      });
    return Object.values(map);
  }, [items]);

  const dispatchList = async (group) => {
    setBusyKey(group.key);
    setError('');
    setMessage('');
    try {
      const res = await api.dispatchDepartmentList({ department: group.dept, formType: group.type, ids: group.apps.map((a) => a.trackingNumber) });
      setMessage(res.message);
      await onChanged?.();
      await loadSent();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyKey('');
    }
  };

  return (
    <div className="wfd-lists">
      {message && <div className="wfd-note">{message}</div>}
      {error && <div className="wfd-error">{error}</div>}

      <div>
        <h4 style={{ margin: '0 0 .6rem', color: '#0f2b5c' }}>Ready to send to departments</h4>
        {groups.length === 0 && <div className="wfd-card wfd-empty">No verified applications are waiting. SAR-forwarded ECA / ESA applications appear here.</div>}
        {groups.map((g) => (
          <div key={g.key} className="wfd-list-card" style={{ marginBottom: '.8rem' }}>
            <header>
              <div>
                <b>
                  {typeLabel(g.type)} — {g.dept} department
                </b>
                <div className="wfd-sub">{g.apps.length} application(s) verified by SAR</div>
              </div>
              <button type="button" className="wfd-btn primary" disabled={busyKey === g.key} onClick={() => dispatchList(g)}>
                {busyKey === g.key ? 'Sending…' : `Approve all & send list to ${g.dept} HOD`}
              </button>
            </header>
            <table className="wfd-table">
              <thead>
                <tr>
                  <th>Tracking</th>
                  <th>Student</th>
                  <th>Subjects</th>
                </tr>
              </thead>
              <tbody>
                {g.apps.map((p) => (
                  <tr key={p.trackingNumber} className="clickable" onClick={() => onOpen?.(p)}>
                    <td>{p.trackingNumber}</td>
                    <td>
                      {p.student?.name}
                      <div className="wfd-sub">{p.student?.regNo}</div>
                    </td>
                    <td>{(p.details?.courseCodes || []).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="wfd-sub" style={{ marginTop: '.5rem' }}>
              To approve or return a single application, open it from the table above. Lecturer assignment is available there.
            </div>
          </div>
        ))}
      </div>

      <div>
        <h4 style={{ margin: '0 0 .6rem', color: '#0f2b5c' }}>Lists already sent</h4>
        {sent.length === 0 && <div className="wfd-card wfd-empty">No department lists have been sent yet.</div>}
        {sent.map((l) => (
          <div key={l.listRef} className="wfd-list-card" style={{ marginBottom: '.8rem' }}>
            <header>
              <div>
                <b>{l.listRef}</b>
                <div className="wfd-sub">
                  {typeLabel(l.type)} · {l.departmentCode} · sent {formatDate(l.forwardedAt, true)} by {l.sentBy}
                </div>
              </div>
              <span className="wfd-badge info">{l.applications.length} application(s)</span>
            </header>
            <div className="wfd-sub">
              {l.applications.map((a) => `${a.trackingNumber} (${a.student?.name})`).join(' · ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
