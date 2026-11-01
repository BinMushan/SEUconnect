const ProcessRequest = require('../models/ProcessRequest');
const { SEED_PROCESSES } = require('../seedData');
const { getStatus } = require('../config/db');

// In-memory cache fallback to ensure 100% uptime and resilience
let memoryProcesses = JSON.parse(JSON.stringify(SEED_PROCESSES));

const generateTrackingNumber = (type = 'medical_excuse') => {
  const prefix = type === 'medical_excuse' ? 'MED' : type === 'repeat_exam' ? 'REP' : 'REQ';
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${rand}`;
};

/**
 * Get all processes (optionally filtered by role or student email)
 */
exports.getAllProcesses = async (req, res) => {
  try {
    const { role, email, status, type } = req.query;

    if (getStatus()) {
      let query = {};
      if (role === 'student' && email) {
        query['student.email'] = email.toLowerCase();
      }
      if (status && status !== 'all') {
        query.status = status;
      }
      if (type && type !== 'all') {
        query.type = type;
      }

      const processes = await ProcessRequest.find(query).sort({ updatedAt: -1 });
      if (processes && processes.length > 0) {
        return res.json({ success: true, count: processes.length, data: processes });
      }
    }

    // Memory Fallback
    let filtered = [...memoryProcesses];
    if (role === 'student' && email) {
      filtered = filtered.filter(p => p.student.email.toLowerCase() === email.toLowerCase());
    }
    if (status && status !== 'all') {
      filtered = filtered.filter(p => p.status.toLowerCase() === status.toLowerCase());
    }
    if (type && type !== 'all') {
      filtered = filtered.filter(p => p.type === type);
    }

    return res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    console.error('Error fetching processes:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching processes', error: error.message });
  }
};

/**
 * Get single process by ID or Tracking Number
 */
exports.getProcessById = async (req, res) => {
  try {
    const { id } = req.params;

    if (getStatus()) {
      let process = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        process = await ProcessRequest.findById(id);
      }
      if (!process) {
        process = await ProcessRequest.findOne({ trackingNumber: id });
      }
      if (process) {
        return res.json({ success: true, data: process });
      }
    }

    const found = memoryProcesses.find(p => p.trackingNumber === id || p._id === id);
    if (!found) {
      return res.status(404).json({ success: false, message: 'Process request not found' });
    }
    return res.json({ success: true, data: found });
  } catch (error) {
    console.error('Error fetching process by ID:', error);
    res.status(500).json({ success: false, message: 'Error retrieving process', error: error.message });
  }
};

/**
 * Create a new Process Request (Student applies for Medical or other request)
 */
exports.createProcess = async (req, res) => {
  try {
    const {
      type = 'medical_excuse',
      title,
      student,
      details,
      priority = 'Standard',
    } = req.body;

    const trackingNumber = generateTrackingNumber(type);
    const now = new Date();

    // Standard Multi-Stage Workflow Stages for Medical Excuse & Academic Requests
    const stages = [
      {
        stageKey: 'submission',
        label: 'Student Application Submission',
        role: 'student',
        status: 'COMPLETED',
        actionTakenBy: `${student?.name || 'Student'} (${student?.regNo || 'Undergraduate'})`,
        actionTakenRole: 'Student',
        actionDate: now,
        remarks: 'Application submitted with certified medical/supporting documents.',
        digitalStamp: `SEU-STU-SUBMIT#${student?.regNo || 'STU'}-${Math.floor(1000 + Math.random() * 9000)}`,
      },
      {
        stageKey: 'lecturer_verification',
        label: 'Course Lecturer Verification & Recommendation',
        role: 'lecturer',
        status: 'CURRENT',
        actionTakenBy: null,
        actionTakenRole: null,
        actionDate: null,
        remarks: '',
        digitalStamp: null,
      },
      {
        stageKey: 'medical_verification',
        label: 'Medical Officer / Records Endorsement',
        role: 'examination',
        status: 'PENDING',
        actionTakenBy: null,
        actionTakenRole: null,
        actionDate: null,
        remarks: '',
        digitalStamp: null,
      },
      {
        stageKey: 'hod_approval',
        label: 'Head of Department (HOD) Approval',
        role: 'hod',
        status: 'PENDING',
        actionTakenBy: null,
        actionTakenRole: null,
        actionDate: null,
        remarks: '',
        digitalStamp: null,
      },
      {
        stageKey: 'dean_endorsement',
        label: 'Faculty Dean Executive Endorsement',
        role: 'dean',
        status: 'PENDING',
        actionTakenBy: null,
        actionTakenRole: null,
        actionDate: null,
        remarks: '',
        digitalStamp: null,
      },
    ];

    const auditLog = [
      {
        action: 'SUBMITTED',
        actorName: student?.name || 'Student Applicant',
        actorRole: `Student (${student?.regNo || 'STU'})`,
        actorEmail: student?.email || '',
        timestamp: now,
        stage: 'Student Application Submission',
        comment: `Application submitted for ${details?.courseCodes?.join(', ') || 'lectures'} on ${details?.absenceDate || 'date'}.`,
      },
    ];

    const newProcessData = {
      trackingNumber,
      type,
      title: title || `Medical Excuse Request (${details?.absenceDate || 'Scheduled Lecture'})`,
      category: 'Academic & Medical Affairs',
      status: 'Pending Lecturer',
      priority,
      student: {
        name: student?.name || 'M.N.M. Afnan',
        regNo: student?.regNo || '22ICT085',
        email: student?.email || 'student@gmail.com',
        department: student?.department || 'Department of Information and Communication Technology',
        faculty: student?.faculty || 'Faculty of Technology',
        programme: student?.programme || 'BICT (Hons)',
        semester: student?.semester || 'Semester 05',
      },
      details: {
        absenceDate: details?.absenceDate || new Date().toISOString().split('T')[0],
        endDate: details?.endDate || details?.absenceDate || new Date().toISOString().split('T')[0],
        missedSessions: details?.missedSessions || 'Full Day Lectures',
        courseCodes: details?.courseCodes || ['ICT 3112 - Web Application Development'],
        reason: details?.reason || 'Medical illness',
        doctorName: details?.doctorName || 'Dr. Medical Officer',
        hospitalClinic: details?.hospitalClinic || 'University Health Centre',
        medicalCertNo: details?.medicalCertNo || `MC-${Math.floor(10000 + Math.random() * 90000)}`,
        issueDate: details?.issueDate || new Date().toISOString().split('T')[0],
        attachedDocumentName: details?.attachedDocumentName || 'medical_certificate.pdf',
        notes: details?.notes || '',
      },
      currentStageIndex: 1,
      currentAssignedRole: 'lecturer',
      stages,
      auditLog,
    };

    let savedProcess = null;
    if (getStatus()) {
      savedProcess = await ProcessRequest.create(newProcessData);
    } else {
      newProcessData._id = 'mem_' + Date.now();
      savedProcess = newProcessData;
    }

    // Update memory cache
    memoryProcesses.unshift(savedProcess);

    res.status(201).json({
      success: true,
      message: `Process ${trackingNumber} created successfully and routed to Lecturer for verification.`,
      data: savedProcess,
    });
  } catch (error) {
    console.error('Error creating process:', error);
    res.status(500).json({ success: false, message: 'Failed to create process request', error: error.message });
  }
};

/**
 * Approve or Verify Current Stage (Advances to the next reviewer in sequence)
 */
exports.approveStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { actorName, actorRole, actorEmail, remarks } = req.body;
    const now = new Date();

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
      process = memoryProcesses.find(p => p.trackingNumber === id || p._id === id);
    }

    if (!process) {
      return res.status(404).json({ success: false, message: 'Process request not found' });
    }

    if (process.status === 'Approved' || process.status === 'Declined') {
      return res.status(400).json({ success: false, message: `Cannot approve a process that is already ${process.status}` });
    }

    const curIndex = process.currentStageIndex;
    const currentStage = process.stages[curIndex];

    if (!currentStage) {
      return res.status(400).json({ success: false, message: 'Invalid stage index' });
    }

    // Complete current stage
    currentStage.status = 'COMPLETED';
    currentStage.actionTakenBy = actorName || actorRole;
    currentStage.actionTakenRole = actorRole;
    currentStage.actionDate = now;
    currentStage.remarks = remarks || `Verified and approved by ${actorRole}`;
    currentStage.digitalStamp = `SEU-${actorRole.toUpperCase().replace(/\s+/g, '_')}-VERIFIED#${Math.floor(10000 + Math.random() * 90000)}`;

    // Add Audit Log
    const auditAction = curIndex === process.stages.length - 1 ? 'APPROVED' : 'RECOMMENDED';
    process.auditLog.push({
      action: auditAction,
      actorName: actorName || 'Authorized Officer',
      actorRole: actorRole || 'Reviewer',
      actorEmail: actorEmail || '',
      timestamp: now,
      stage: currentStage.label,
      comment: remarks || `Endorsed stage: ${currentStage.label}`,
    });

    // Check if next stage exists
    if (curIndex + 1 < process.stages.length) {
      process.currentStageIndex = curIndex + 1;
      const nextStage = process.stages[curIndex + 1];
      nextStage.status = 'CURRENT';
      process.currentAssignedRole = nextStage.role;

      // Update status string
      if (nextStage.role === 'lecturer') process.status = 'Pending Lecturer';
      else if (nextStage.role === 'examination') process.status = 'Pending Medical Verification';
      else if (nextStage.role === 'hod') process.status = 'Pending HOD';
      else if (nextStage.role === 'dean') process.status = 'Pending Dean';
      else process.status = 'In Progress';
    } else {
      // Final stage reached & completed!
      process.status = 'Approved';
      process.currentAssignedRole = 'completed';
      process.approvalDetails = {
        approvedAt: now,
        finalApprovalCode: `SEU-FOT-AUTH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        endorsementSeal: 'OFFICIALLY VERIFIED AND APPROVED BY SOUTH EASTERN UNIVERSITY FACULTY BOARD',
      };
    }

    if (getStatus() && process.save) {
      await process.save();
    } else {
      const idx = memoryProcesses.findIndex(p => p.trackingNumber === process.trackingNumber);
      if (idx !== -1) memoryProcesses[idx] = process;
    }

    res.json({
      success: true,
      message: `Stage "${currentStage.label}" successfully approved! Process advanced to: ${process.status}.`,
      data: process,
    });
  } catch (error) {
    console.error('Error approving stage:', error);
    res.status(500).json({ success: false, message: 'Server error while approving stage', error: error.message });
  }
};

/**
 * Decline Process with Mandatory Reason (Records who declined and why)
 */
exports.declineProcess = async (req, res) => {
  try {
    const { id } = req.params;
    const { actorName, actorRole, actorEmail, reason } = req.body;
    const now = new Date();

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'A specific decline reason is mandatory.' });
    }

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
      process = memoryProcesses.find(p => p.trackingNumber === id || p._id === id);
    }

    if (!process) {
      return res.status(404).json({ success: false, message: 'Process request not found' });
    }

    const curIndex = process.currentStageIndex;
    const currentStage = process.stages[curIndex];

    if (currentStage) {
      currentStage.status = 'DECLINED';
      currentStage.actionTakenBy = actorName || actorRole;
      currentStage.actionTakenRole = actorRole;
      currentStage.actionDate = now;
      currentStage.remarks = `DECLINED: ${reason}`;
      currentStage.digitalStamp = `SEU-${actorRole.toUpperCase().replace(/\s+/g, '_')}-DECLINED#${Math.floor(10000 + Math.random() * 90000)}`;
    }

    process.status = 'Declined';
    process.declineDetails = {
      declinedBy: actorName || 'Authorized Authority',
      declinedByRole: actorRole || 'Department Authority',
      declinedAt: now,
      stage: currentStage ? currentStage.label : 'Review',
      reason: reason.trim(),
    };

    // Add Audit Log
    process.auditLog.push({
      action: 'DECLINED',
      actorName: actorName || 'Authorized Authority',
      actorRole: actorRole || 'Department Authority',
      actorEmail: actorEmail || '',
      timestamp: now,
      stage: currentStage ? currentStage.label : 'Review',
      comment: `DECLINED: ${reason.trim()}`,
    });

    if (getStatus() && process.save) {
      await process.save();
    } else {
      const idx = memoryProcesses.findIndex(p => p.trackingNumber === process.trackingNumber);
      if (idx !== -1) memoryProcesses[idx] = process;
    }

    res.json({
      success: true,
      message: `Process ${process.trackingNumber} declined by ${actorName || actorRole}. Decline justification logged.`,
      data: process,
    });
  } catch (error) {
    console.error('Error declining process:', error);
    res.status(500).json({ success: false, message: 'Server error while declining process', error: error.message });
  }
};

/**
 * Add Comment to Audit Log
 */
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { actorName, actorRole, actorEmail, comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required.' });
    }

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
      process = memoryProcesses.find(p => p.trackingNumber === id || p._id === id);
    }

    if (!process) {
      return res.status(404).json({ success: false, message: 'Process not found' });
    }

    process.auditLog.push({
      action: 'COMMENTED',
      actorName: actorName || 'User',
      actorRole: actorRole || 'Stakeholder',
      actorEmail: actorEmail || '',
      timestamp: new Date(),
      stage: 'General Discussion',
      comment: comment.trim(),
    });

    if (getStatus() && process.save) {
      await process.save();
    }

    res.json({ success: true, message: 'Comment appended to audit trail', data: process });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding comment', error: error.message });
  }
};
