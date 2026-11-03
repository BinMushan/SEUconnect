const ProcessRequest = require('../models/ProcessRequest');
const { getStatus } = require('../config/db');
const { createNotification } = require('./notificationController');

exports.addAdministrativeRemark = async (req, res) => {
  try {
    const { id } = req.params;
    const { actorName, actorRole = 'Senior Assistant Registrar (SAR)', actorEmail, remark, documentCheckStatus } = req.body;

    if (!remark || !remark.trim()) {
      return res.status(400).json({ success: false, message: 'Administrative remark content is required.' });
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
      // In-memory lookup from processController's memory cache
      const processController = require('./processController');
      if (processController.getMemoryProcesses) {
        process = processController.getMemoryProcesses().find(p => p.trackingNumber === id || p._id === id);
      }
    }

    const checkNote = documentCheckStatus ? ` [Doc Check: ${documentCheckStatus}]` : '';
    const fullComment = `${remark.trim()}${checkNote}`;

    if (process) {
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
    }

    await createNotification({
      title: `Administrative Note: ${process?.trackingNumber || id}`,
      message: `SAR recorded an administrative remark on ${process?.title || 'request'}`,
      type: 'ADMIN_REVIEW',
      recipientRole: 'dean',
      relatedRequestId: process?.trackingNumber || id,
      department: process?.student?.department,
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

exports.requestClarification = async (req, res) => {
  try {
    const { id } = req.params;
    const { actorName, actorRole = 'Senior Assistant Registrar (SAR)', actorEmail, issuesIdentified, notes } = req.body;

    if (!notes || !notes.trim()) {
      return res.status(400).json({ success: false, message: 'Clarification details are required.' });
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
      const processController = require('./processController');
      if (processController.getMemoryProcesses) {
        process = processController.getMemoryProcesses().find(p => p.trackingNumber === id || p._id === id);
      }
    }

    const issuesText = issuesIdentified && issuesIdentified.length > 0 ? ` [Deficiencies: ${issuesIdentified.join(', ')}]` : '';

    if (process) {
      process.auditLog.push({
        action: 'CORRECTION_REQUESTED',
        actorName: actorName || 'Mr. K.L.M. Riyas',
        actorRole: actorRole || 'Senior Assistant Registrar (SAR)',
        actorEmail: actorEmail || 'sar@gmail.com',
        timestamp: new Date(),
        stage: 'Administrative Review & Compliance',
        comment: `CORRECTION REQUESTED:${issuesText} ${notes.trim()}`,
      });

      if (getStatus() && process.save) {
        await process.save();
      }
    }

    await createNotification({
      title: `Clarification Requested: ${process?.trackingNumber || id}`,
      message: `SAR identified incomplete documents or requested clarification: ${notes.trim().slice(0, 80)}...`,
      type: 'CORRECTION',
      recipientRole: 'sar',
      relatedRequestId: process?.trackingNumber || id,
      department: process?.student?.department,
    });

    res.json({
      success: true,
      message: 'Correction request flagged and registered in audit ledger.',
      data: process,
    });
  } catch (error) {
    console.error('Error requesting clarification:', error);
    res.status(500).json({ success: false, message: 'Server error requesting clarification', error: error.message });
  }
};

exports.routeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { actorName, actorRole = 'Senior Assistant Registrar (SAR)', actorEmail, destinationOfficer, routingNote } = req.body;

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

    if (process) {
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
    }

    await createNotification({
      title: `Request Routed: ${process?.trackingNumber || id}`,
      message: `SAR forwarded ${process?.title || 'request'} to ${destinationOfficer || 'Executive Office'}.`,
      type: 'ADMIN_REVIEW',
      recipientRole: 'sar',
      relatedRequestId: process?.trackingNumber || id,
      department: process?.student?.department,
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
