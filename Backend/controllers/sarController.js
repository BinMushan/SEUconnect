const ProcessRequest = require('../models/ProcessRequest');
const { getStatus } = require('../config/db');
const { createNotification } = require('./notificationController');

// Memory store for Form Availability (SAR managed)
let formAvailability = {
  eca: { isOpen: true, academicYear: '2025/2026', semester: 'Semester 2', deadline: '2026-11-20T23:59:00Z', updatedBy: 'Mr. K.L.M. Riyas (SAR)' },
  esa: { isOpen: true, academicYear: '2025/2026', semester: 'Semester 2', deadline: '2026-11-25T23:59:00Z', updatedBy: 'Mr. K.L.M. Riyas (SAR)' },
  examForm: { isOpen: true, academicYear: '2025/2026', semester: 'Semester 2', deadline: '2026-11-30T23:59:00Z', updatedBy: 'Mr. K.L.M. Riyas (SAR)' },
};

const findProcess = async (id) => {
  let process = null;
  if (getStatus()) {
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      process = await ProcessRequest.findById(id);
    }
    if (!process) {
      process = await ProcessRequest.findOne({ trackingNumber: id });
    }
  }
  if (!process) {
    const processController = require('./processController');
    if (processController.getMemoryProcesses) {
      process = processController.getMemoryProcesses().find(p => p.trackingNumber === id || p._id === id);
    }
  }
  return process;
};

/**
 * 1. Add Administrative Remark
 */
exports.addAdministrativeRemark = async (req, res) => {
  try {
    const { id } = req.params;
    const { actorName, actorRole = 'Senior Assistant Registrar (SAR)', actorEmail, remark, documentCheckStatus } = req.body;

    if (!remark || !remark.trim()) {
      return res.status(400).json({ success: false, message: 'Administrative remark content is required.' });
    }

    const process = await findProcess(id);
    if (!process) {
      return res.status(404).json({ success: false, message: 'Process request not found.' });
    }

    const checkNote = documentCheckStatus ? ` [Doc Check: ${documentCheckStatus}]` : '';
    const fullComment = `${remark.trim()}${checkNote}`;

    process.auditLog.push({
      action: 'ADMIN_REMARK',
      actorName: actorName || 'Mr. K.L.M. Riyas',
      actorRole: actorRole || 'Senior Assistant Registrar (SAR)',
      actorEmail: actorEmail || 'sar@gmail.com',
      timestamp: new Date(),
      stage: 'Faculty Administrative Coordination',
      comment: fullComment,
    });

    if (getStatus() && process.save) {
      await process.save();
    }

    await createNotification({
      title: `Administrative Note: ${process.trackingNumber || id}`,
      message: `SAR recorded an administrative remark on ${process.title || 'request'}`,
      type: 'ADMIN_REVIEW',
      recipientRole: 'dean',
      relatedRequestId: process.trackingNumber || id,
      department: process.student?.department,
    });

    res.json({
      success: true,
      message: 'Administrative remark recorded with official audit stamp.',
      data: process,
    });
  } catch (error) {
    console.error('Error adding admin remark:', error);
    res.status(500).json({ success: false, message: 'Server error saving administrative remark', error: error.message });
  }
};

/**
 * 2. Request Clarification / Return for Corrections
 */
exports.requestClarification = async (req, res) => {
  try {
    const { id } = req.params;
    const { actorName, actorRole = 'Senior Assistant Registrar (SAR)', actorEmail, issuesIdentified, notes } = req.body;

    if (!notes || !notes.trim()) {
      return res.status(400).json({ success: false, message: 'Clarification details are required.' });
    }

    const process = await findProcess(id);
    if (!process) {
      return res.status(404).json({ success: false, message: 'Process request not found.' });
    }

    const issuesText = issuesIdentified && issuesIdentified.length > 0 ? ` [Deficiencies: ${issuesIdentified.join(', ')}]` : '';

    process.status = 'Returned for Correction';
    process.auditLog.push({
      action: 'CORRECTION_REQUESTED',
      actorName: actorName || 'Mr. K.L.M. Riyas',
      actorRole: actorRole || 'Senior Assistant Registrar (SAR)',
      actorEmail: actorEmail || 'sar@gmail.com',
      timestamp: new Date(),
      stage: 'Administrative Review & Compliance',
      comment: `RETURNED FOR CORRECTION:${issuesText} ${notes.trim()}`,
    });

    if (getStatus() && process.save) {
      await process.save();
    }

    await createNotification({
      title: `Application Returned for Correction: ${process.trackingNumber || id}`,
      message: `SAR identified deficiencies or missing payment voucher: ${notes.trim().slice(0, 90)}...`,
      type: 'CORRECTION',
      recipientRole: 'student',
      relatedRequestId: process.trackingNumber || id,
      department: process.student?.department,
    });

    res.json({
      success: true,
      message: 'Application returned for correction and logged in audit ledger.',
      data: process,
    });
  } catch (error) {
    console.error('Error requesting clarification:', error);
    res.status(500).json({ success: false, message: 'Server error requesting clarification', error: error.message });
  }
};

/**
 * 3. Route Request (Generic Administrative Routing)
 */
exports.routeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { actorName, actorRole = 'Senior Assistant Registrar (SAR)', actorEmail, destinationOfficer, routingNote } = req.body;

    const process = await findProcess(id);
    if (!process) {
      return res.status(404).json({ success: false, message: 'Process request not found.' });
    }

    process.auditLog.push({
      action: 'ROUTED',
      actorName: actorName || 'Mr. K.L.M. Riyas',
      actorRole: actorRole || 'Senior Assistant Registrar (SAR)',
      actorEmail: actorEmail || 'sar@gmail.com',
      timestamp: new Date(),
      stage: 'Administrative Routing',
      comment: `ROUTED TO: ${destinationOfficer || 'HOD / Dean'}. Note: ${routingNote || 'Documents checked and forwarded for official determination.'}`,
    });

    if (getStatus() && process.save) {
      await process.save();
    }

    await createNotification({
      title: `Request Routed: ${process.trackingNumber || id}`,
      message: `SAR forwarded ${process.title || 'request'} to ${destinationOfficer || 'Executive Office'}.`,
      type: 'ADMIN_REVIEW',
      recipientRole: 'sar',
      relatedRequestId: process.trackingNumber || id,
      department: process.student?.department,
    });

    res.json({
      success: true,
      message: `Request routed to ${destinationOfficer || 'Officer'} with administrative stamp.`,
      data: process,
    });
  } catch (error) {
    console.error('Error routing request:', error);
    res.status(500).json({ success: false, message: 'Server error routing request', error: error.message });
  }
};

/**
 * 4. SAR Verify & Forward to Examination Branch
 * Permissions:
 * - Allowed only for ECA, ESA, Exam Form, and Exam Medical at SAR verification steps.
 * - Subject Medical has NO SAR step.
 */
exports.sarVerifyAndForward = async (req, res) => {
  try {
    const { id } = req.params;
    const { actorName = 'Mr. K.L.M. Riyas', remarks = 'Payment voucher and supporting documents verified complete. Forwarded to Examination Branch.' } = req.body;

    const process = await findProcess(id);
    if (!process) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Workflow validation: Subject Medical cannot be touched by SAR
    if (process.type === 'subject_medical') {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: Subject Medical workflow is handled directly by Department MA with no SAR involvement.'
      });
    }

    // Verify payment receipt & documents
    if (!process.paymentReceipt) process.paymentReceipt = {};
    process.paymentReceipt.verifiedBySAR = true;

    // Advance workflow to Examination Branch
    process.currentAssignedRole = 'examination';
    process.status = 'Pending Examination Branch';

    // Mark current stage completed if stage exists
    if (process.stages && process.stages.length > 0) {
      const sarStage = process.stages.find(s => s.role === 'sar' && s.status === 'CURRENT');
      if (sarStage) {
        sarStage.status = 'COMPLETED';
        sarStage.actionTakenBy = actorName;
        sarStage.actionTakenRole = 'Senior Assistant Registrar (SAR)';
        sarStage.actionDate = new Date();
        sarStage.remarks = remarks;
        sarStage.digitalStamp = `SEU-SAR-VERIFIED#STAFF-SAR-001-${Date.now().toString().slice(-4)}`;
      }
      const examStage = process.stages.find(s => s.role === 'examination' && s.status === 'PENDING');
      if (examStage) {
        examStage.status = 'CURRENT';
      }
    }

    process.auditLog.push({
      action: 'SAR_VERIFIED_AND_FORWARDED',
      actorName,
      actorRole: 'Senior Assistant Registrar (SAR)',
      actorEmail: 'sar@gmail.com',
      timestamp: new Date(),
      stage: 'SAR Administrative Verification & Payment Audit',
      comment: `VERIFIED & FORWARDED TO EXAMINATION BRANCH: ${remarks}`,
    });

    if (getStatus() && process.save) {
      await process.save();
    }

    // Notify Examination Branch
    await createNotification({
      title: `Forwarded by SAR: ${process.trackingNumber}`,
      message: `SAR verified documents and payment voucher for ${process.title}. Ready for Examination Branch processing.`,
      type: 'EXAMINATION_FORWARD',
      recipientRole: 'examination',
      relatedRequestId: process.trackingNumber,
      department: process.student?.department,
    });

    res.json({
      success: true,
      message: 'Application verified and successfully forwarded to Examination Branch.',
      data: process,
    });
  } catch (error) {
    console.error('Error in sarVerifyAndForward:', error);
    res.status(500).json({ success: false, message: 'Server error forwarding to Examination Branch', error: error.message });
  }
};

/**
 * 5. Process Dean Office Admission (Examination Section)
 * For Examination Form workflow (Step 6)
 */
exports.sarProcessAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { actorName = 'Mr. K.L.M. Riyas', admissionNo, notes } = req.body;

    const process = await findProcess(id);
    if (!process) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const officialAdmNo = admissionNo || `ADM-FOT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    process.admissionDetails = {
      admissionNo: officialAdmNo,
      issuedAt: new Date(),
      status: 'Generated & Dispatched',
      officialTitle: 'Dean Office Admission (Examination Section)',
      managedBySAR: true,
    };
    process.status = 'Admission Generated';

    process.auditLog.push({
      action: 'DEAN_OFFICE_ADMISSION_ISSUED',
      actorName,
      actorRole: 'Senior Assistant Registrar (SAR)',
      actorEmail: 'sar@gmail.com',
      timestamp: new Date(),
      stage: 'Dean Office Admission (Examination Section)',
      comment: `OFFICIAL OUTPUT ISSUED: ${process.admissionDetails.officialTitle} [Admission No: ${officialAdmNo}]. ${notes || 'Official entry pass generated and dispatched to candidate.'}`,
    });

    if (getStatus() && process.save) {
      await process.save();
    }

    // Notify student
    await createNotification({
      title: `Dean Office Admission Issued: ${officialAdmNo}`,
      message: `Your official Dean Office Admission (Examination Section) pass has been generated by SAR.`,
      type: 'ADMISSION_ISSUED',
      recipientRole: 'student',
      relatedRequestId: process.trackingNumber,
      department: process.student?.department,
    });

    res.json({
      success: true,
      message: 'Dean Office Admission (Examination Section) output generated and registered.',
      data: process,
    });
  } catch (error) {
    console.error('Error generating admission:', error);
    res.status(500).json({ success: false, message: 'Server error generating admission', error: error.message });
  }
};

/**
 * 6. Track Senate Copy Preparation & Submission
 * For Examination Forms and Examination Medicals
 */
exports.sarTrackSenateCopy = async (req, res) => {
  try {
    const { id } = req.params;
    const { actorName = 'Mr. K.L.M. Riyas', trackingNo, submissionNote } = req.body;

    const process = await findProcess(id);
    if (!process) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const officialTrackingNo = trackingNo || `SENATE-FOT-2026-${Math.floor(100 + Math.random() * 900)}`;

    process.senateCopy = {
      prepared: true,
      preparedAt: new Date(),
      trackingNo: officialTrackingNo,
      submittedAt: new Date(),
      coordinatedBySAR: true,
    };

    process.auditLog.push({
      action: 'SENATE_COPY_COORDINATED',
      actorName,
      actorRole: 'Senior Assistant Registrar (SAR)',
      actorEmail: 'sar@gmail.com',
      timestamp: new Date(),
      stage: 'Senate Copy Preparation & Submission Tracking',
      comment: `SENATE COPY DISPATCHED: Tracking # ${officialTrackingNo}. ${submissionNote || 'Prepared and submitted according to statutory university procedure.'}`,
    });

    if (getStatus() && process.save) {
      await process.save();
    }

    res.json({
      success: true,
      message: 'Senate copy preparation and submission recorded with tracking reference.',
      data: process,
    });
  } catch (error) {
    console.error('Error tracking Senate copy:', error);
    res.status(500).json({ success: false, message: 'Server error tracking Senate copy', error: error.message });
  }
};

/**
 * 7. Forward Department-wise Examination List to HOD / Department
 */
exports.sarForwardDepartmentList = async (req, res) => {
  try {
    const { department, academicYear = '2025/2026', notes } = req.body;

    const processController = require('./processController');
    const processes = processController.getMemoryProcesses ? processController.getMemoryProcesses() : [];

    await createNotification({
      title: `Department Examination List: ${department}`,
      message: `SAR forwarded verified examination candidate list for ${department} (AY ${academicYear}) to HOD and Course Lecturers.`,
      type: 'EXAMINATION_LIST',
      recipientRole: 'hod',
      department,
    });

    res.json({
      success: true,
      message: `Official examination list for ${department} forwarded to Department Head & Lecturers.`,
      forwardedAt: new Date(),
      department,
      academicYear,
    });
  } catch (error) {
    console.error('Error forwarding department examination list:', error);
    res.status(500).json({ success: false, message: 'Server error forwarding department list', error: error.message });
  }
};

/**
 * 8. Form Availability Portal Control (SAR Managed)
 */
exports.getFormAvailability = async (req, res) => {
  res.json({ success: true, data: formAvailability });
};

exports.toggleFormAvailability = async (req, res) => {
  const { formType, isOpen, deadline, semester } = req.body;
  if (!formAvailability[formType]) {
    return res.status(400).json({ success: false, message: `Invalid form type: ${formType}` });
  }

  formAvailability[formType].isOpen = isOpen !== undefined ? Boolean(isOpen) : !formAvailability[formType].isOpen;
  if (deadline) formAvailability[formType].deadline = deadline;
  if (semester) formAvailability[formType].semester = semester;
  formAvailability[formType].updatedAt = new Date();

  await createNotification({
    title: `Portal Status Updated: ${formType.toUpperCase()} Forms`,
    message: `SAR updated ${formType.toUpperCase()} application portal availability to ${formAvailability[formType].isOpen ? 'ONLINE / OPEN' : 'CLOSED'}.`,
    type: 'PORTAL_UPDATE',
    recipientRole: 'student',
  });

  res.json({
    success: true,
    message: `${formType.toUpperCase()} portal availability updated to ${formAvailability[formType].isOpen ? 'OPEN' : 'CLOSED'}.`,
    data: formAvailability[formType],
  });
};
