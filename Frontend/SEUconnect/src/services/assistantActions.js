/**
 * Shortcut buttons shown under an assistant answer. They only point at portal screens that exist for students,
 * so the assistant offers them to student accounts only (staff have different navigation).
 */
export function detectSuggestedActions(text, role) {
  if (role !== 'student') return [];
  const lower = (text || '').toLowerCase();
  const actions = [];
  const add = (hit, ...items) => hit && actions.push(...items);

  add(/medical|sick|doctor|hospital|cmo|absence/.test(lower), { label: 'Submit Medical Form Online', tab: 'medical_requests' }, { label: 'Download Medical Submission PDF', tab: 'forms_medical' });
  add(/repeat|exam|esa|resit|piv/.test(lower), { label: 'Open Exam Registrations', tab: 'examinations' }, { label: 'Download PIV Bank Voucher', tab: 'forms_piv' });
  add(/attendance|80%|debarred|eligible/.test(lower), { label: 'Inspect Attendance Grid', tab: 'attendance' });
  add(/gpa|cgpa|sgpa|grade|class/.test(lower), { label: 'Check GPA / CGPA Analytics', tab: 'gpa_cgpa' }, { label: 'Academic Progress', tab: 'academic_progress' });
  add(/registration|subject|add\/drop|enroll/.test(lower), { label: 'Semester Registration', tab: 'registration' });
  add(/form|voucher|template|download/.test(lower) && !actions.some((a) => a.tab.startsWith('forms_')), { label: 'Browse Faculty Forms', tab: 'forms_all' });

  const seen = new Set();
  return actions.filter((a) => (seen.has(a.tab) ? false : seen.add(a.tab))).slice(0, 3);
}
