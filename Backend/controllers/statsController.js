const ProcessRequest = require('../models/ProcessRequest');
const { SEED_PROCESSES } = require('../seedData');
const { getStatus } = require('../config/db');

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
          { name: 'Information & Communication Technology', code: 'ICT', activeProcesses: total },
          { name: 'Bio-Systems Technology', code: 'BST', activeProcesses: 2 },
        ],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving statistics', error: error.message });
  }
};
