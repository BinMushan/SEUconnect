const store = require('../store');
const { getStatus } = require('../config/db');
const engine = require('../workflows/engine');
const { WORKFLOWS, WORKFLOW_TYPES } = require('../workflows/definitions');
const { deptCode } = require('../utils/roles');

// Demo-mode figures (used ONLY when no database is connected). With MongoDB the counts come from the Student collection.
const DEMO_BATCH_ROWS = [
  { batch: '2025/2024', year: '1st Year', ict: 76, bst: 36 },
  { batch: '2024/2023', year: '2nd Year', ict: 70, bst: 34 },
  { batch: '2023/2022', year: '3rd Year', ict: 66, bst: 32 },
  { batch: '2022/2021', year: '4th Year', ict: 64, bst: 31 },
  { batch: '2021/2020', year: '5th Year', ict: 61, bst: 30 },
];

const ORDINAL = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

const withTotals = (rows) => {
  const batches = rows.map((b) => ({ ...b, facultyTotal: b.ict + b.bst }));
  const ict = batches.reduce((sum, b) => sum + b.ict, 0);
  const bst = batches.reduce((sum, b) => sum + b.bst, 0);
  return { batches, totals: { ict, bst, facultyTotal: ict + bst } };
};

// Active students per batch and department, read from the database (nothing hard-coded).
async function calculateBatchStats() {
  if (!getStatus()) return withTotals(DEMO_BATCH_ROWS);
  const Student = require('../models/Student');
  const { AcademicBatch, Department } = require('../modules/organization/model');
  const [students, batches, departments] = await Promise.all([
    Student.find({ status: 'Active', batchRef: { $ne: null } }).select('batchRef departmentRef').lean(),
    AcademicBatch.find({}).lean(),
    Department.find({}).lean(),
  ]);
  const deptShort = Object.fromEntries(departments.map((d) => [String(d._id), d.shortName || d.code]));
  const rows = batches
    .map((b) => {
      const mine = students.filter((s) => String(s.batchRef) === String(b._id));
      const count = (short) => mine.filter((s) => deptShort[String(s.departmentRef)] === short).length;
      return { batch: `${b.intakeYear + 1}/${b.intakeYear}`, year: `${ORDINAL[(b.currentAcademicYear || 1) - 1] || ''} Year`.trim(), ict: count('ICT'), bst: count('BST'), intakeYear: b.intakeYear };
    })
    .sort((a, b) => b.intakeYear - a.intakeYear);
  // one row per batch label (a label can exist for both programmes)
  const merged = [];
  for (const r of rows) {
    const hit = merged.find((m) => m.batch === r.batch);
    if (hit) {
      hit.ict += r.ict;
      hit.bst += r.bst;
    } else merged.push({ ...r });
  }
  return withTotals(merged.map(({ intakeYear, ...rest }) => rest));
}

exports.getBatchStats = async (req, res) => {
  try {
    res.json({ success: true, data: await calculateBatchStats() });
  } catch (error) {
    console.error('Error retrieving batch statistics:', error);
    res.status(500).json({ success: false, message: 'Error retrieving batch statistics' });
  }
};

const isPending = (p) => !['Approved', 'Declined', 'Returned for Correction'].includes(p.status);

exports.getStats = async (req, res) => {
  try {
    const processes = (await store.processes.all()).filter((p) => engine.canView(req.user, p));
    const total = processes.length;
    const approved = processes.filter((p) => p.status === 'Approved').length;
    const declined = processes.filter((p) => p.status === 'Declined').length;
    const count = (status) => processes.filter((p) => p.status === status).length;
    const batchStats = await calculateBatchStats();

    res.json({
      success: true,
      data: {
        totalRequests: total,
        approvedRequests: approved,
        declinedRequests: declined,
        inProgressRequests: total - approved - declined,
        actionRequired: processes.filter((p) => !engine.actBlocker(req.user, p)).length,
        pendingBreakdown: {
          lecturer: count('Pending Lecturer'),
          medical: count('Pending Medical Verification'),
          hod: count('Pending HOD'),
          dean: count('Pending Dean'),
          sar: processes.filter((p) => p.currentAssignedRole === 'sar' && isPending(p)).length,
          examination: count('Pending Examination Branch'),
          deptMa: count('Pending Dept MA'),
          facultyMa: count('Pending Faculty MA'),
        },
        approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
        departments: ['ICT', 'BST'].map((code) => ({
          code,
          name: code === 'ICT' ? 'Information & Communication Technology' : 'Bio-Systems Technology',
          activeProcesses: processes.filter((p) => deptCode(p.student?.department) === code && isPending(p)).length,
          undergraduates: code === 'ICT' ? batchStats.totals.ict : batchStats.totals.bst,
        })),
        undergraduates: { total: batchStats.totals.facultyTotal, ict: batchStats.totals.ict, bst: batchStats.totals.bst, batches: batchStats.batches },
      },
    });
  } catch (error) {
    console.error('Error retrieving statistics:', error);
    res.status(500).json({ success: false, message: 'Error retrieving statistics' });
  }
};

/**
 * GET /api/stats/workflows - one row per workflow type (ECA and ESA are always separate),
 * with status and department breakdowns, limited to what the caller can see.
 */
exports.getWorkflowReport = async (req, res) => {
  try {
    const processes = (await store.processes.all()).filter((p) => engine.canView(req.user, p) && WORKFLOW_TYPES.includes(p.type));
    const data = WORKFLOW_TYPES.map((type) => {
      const rows = processes.filter((p) => p.type === type);
      const byStatus = {};
      rows.forEach((p) => {
        byStatus[p.status] = (byStatus[p.status] || 0) + 1;
      });
      const byDepartment = { ICT: 0, BST: 0 };
      rows.forEach((p) => {
        const code = deptCode(p.student?.department);
        byDepartment[code] = (byDepartment[code] || 0) + 1;
      });
      return {
        type,
        label: WORKFLOWS[type].longLabel,
        code: WORKFLOWS[type].code,
        total: rows.length,
        pending: rows.filter(isPending).length,
        approved: rows.filter((p) => p.status === 'Approved').length,
        declined: rows.filter((p) => p.status === 'Declined').length,
        returned: rows.filter((p) => p.status === 'Returned for Correction').length,
        actionRequired: rows.filter((p) => !engine.actBlocker(req.user, p)).length,
        byStatus,
        byDepartment,
      };
    });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error building workflow report:', error);
    res.status(500).json({ success: false, message: 'Error building workflow report' });
  }
};
