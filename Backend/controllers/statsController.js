const ProcessRequest = require('../models/ProcessRequest');
const { SEED_PROCESSES } = require('../seedData');
const { getStatus } = require('../config/db');

// Faculty of Technology - Standard Batches (Format: later-year/earlier-year)
// Student counts read from database/API, never hardcoded in components
const BATCH_ROWS = [
  { batch: '2025/2024', year: '1st Year', ict: 76, bst: 36 },
  { batch: '2024/2023', year: '2nd Year', ict: 70, bst: 34 },
  { batch: '2023/2022', year: '3rd Year', ict: 66, bst: 32 },
  { batch: '2022/2021', year: '4th Year', ict: 64, bst: 31 },
  { batch: '2021/2020', year: '5th Year', ict: 61, bst: 30 },
];

function calculateBatchStats() {
  const batches = BATCH_ROWS.map((b) => ({
    ...b,
    facultyTotal: b.ict + b.bst,
  }));

  const totalIct = batches.reduce((sum, b) => sum + b.ict, 0);
  const totalBst = batches.reduce((sum, b) => sum + b.bst, 0);
  const facultyTotal = totalIct + totalBst;

  return {
    batches,
    totals: {
      ict: totalIct,
      bst: totalBst,
      facultyTotal: facultyTotal,
    },
  };
}

exports.getBatchStats = async (req, res) => {
  try {
    const stats = calculateBatchStats();
    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving batch statistics', error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    let processes = [];
    if (getStatus()) {
      processes = await ProcessRequest.find({});
    }
    if (!processes || processes.length === 0) {
      processes = SEED_PROCESSES;
    }

    const total = processes.length;
    const approved = processes.filter(p => p.status === 'Approved').length;
    const declined = processes.filter(p => p.status === 'Declined').length;
    const pendingLecturer = processes.filter(p => p.status === 'Pending Lecturer').length;
    const pendingHOD = processes.filter(p => p.status === 'Pending HOD').length;
    const pendingDean = processes.filter(p => p.status === 'Pending Dean').length;
    const pendingMedical = processes.filter(p => p.status === 'Pending Medical Verification').length;
    const inProgress = total - approved - declined;

    const batchStats = calculateBatchStats();

    res.json({
      success: true,
      data: {
        totalRequests: total,
        approvedRequests: approved,
        declinedRequests: declined,
        inProgressRequests: inProgress,
        pendingBreakdown: {
          lecturer: pendingLecturer,
          medical: pendingMedical,
          hod: pendingHOD,
          dean: pendingDean,
        },
        approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
        departments: [
          { name: 'Information & Communication Technology', code: 'ICT', activeProcesses: total, undergraduates: batchStats.totals.ict },
          { name: 'Bio-Systems Technology', code: 'BST', activeProcesses: 2, undergraduates: batchStats.totals.bst },
        ],
        undergraduates: {
          total: batchStats.totals.facultyTotal,
          ict: batchStats.totals.ict,
          bst: batchStats.totals.bst,
          batches: batchStats.batches,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving statistics', error: error.message });
  }
};
