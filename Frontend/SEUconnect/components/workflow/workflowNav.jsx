// Sidebar entry shared by every role that works the examination-form queues.
export const WORKFLOW_NAV_ID = 'workflow_applications';

export const workflowNavItem = (label = 'Examination Workflows', id = WORKFLOW_NAV_ID) => ({
  id,
  label,
  icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  ),
});

export const notificationNavItem = (label = 'Notifications') => ({
  id: 'notifications',
  label,
  icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
});

// Which workflow types each reviewing role handles (mirrors the workflow PDF checklist).
export const ROLE_WORKFLOW_TYPES = {
  lecturer: ['eca_application', 'esa_application', 'exam_form'],
  hod: ['eca_application', 'esa_application', 'exam_form'],
  examination: ['eca_application', 'esa_application', 'exam_form', 'exam_medical'],
  dept_ma: ['subject_medical'],
  fma: ['exam_medical'],
};
