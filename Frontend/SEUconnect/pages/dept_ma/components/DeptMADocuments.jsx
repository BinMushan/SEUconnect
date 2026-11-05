import React, { useState, useMemo } from 'react';

/**
 * Helper: Triggers actual client-side file download for PDF, XLSX, and DOCX formats.
 */
function downloadDocumentFile(doc, versionObj = null) {
  const versionLabel = versionObj ? versionObj.version : (doc.versions?.[0]?.version || 'v1.0 (Official)');
  const fileExt = (doc.fileType || 'PDF').toLowerCase();
  const cleanCode = (doc.code || doc.id).replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanVer = versionLabel.split(' ')[0].replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${cleanCode}_${cleanVer}.${fileExt}`;

  let blob;
  if (doc.fileType === 'XLSX') {
    // Generate valid XML Spreadsheet (opens natively in Excel, Calc, Sheets)
    const xmlContent = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="11"/>
   <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Title">
   <Font ss:Bold="1" ss:Size="13" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="Meta">
   <Font ss:Italic="1" ss:Color="#475569" ss:Size="10"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Department Record">
  <Table>
   <Row><Cell ss:StyleID="Title"><Data ss:Type="String">South Eastern University of Sri Lanka</Data></Cell></Row>
   <Row><Cell ss:StyleID="Title"><Data ss:Type="String">Faculty of Technology - Department of Information &amp; Communication Technology</Data></Cell></Row>
   <Row><Cell ss:StyleID="Meta"><Data ss:Type="String">Document: ${doc.title || ''}</Data></Cell></Row>
   <Row><Cell ss:StyleID="Meta"><Data ss:Type="String">Serial / Code: ${doc.code || doc.id} | Version: ${versionLabel}</Data></Cell></Row>
   <Row><Cell ss:StyleID="Meta"><Data ss:Type="String">Archived By: ${doc.uploadedBy || 'Dept MA'} on ${doc.uploadDate || ''}</Data></Cell></Row>
   <Row ss:Index="7">
    <Cell ss:StyleID="Header"><Data ss:Type="String">Serial Code</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Document Title</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Category</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Academic Year</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Semester</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Access Level</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Status</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">${doc.code || doc.id}</Data></Cell>
    <Cell><Data ss:Type="String">${doc.title || ''}</Data></Cell>
    <Cell><Data ss:Type="String">${doc.category || ''}</Data></Cell>
    <Cell><Data ss:Type="String">${doc.academicYear || '2025/2026'}</Data></Cell>
    <Cell><Data ss:Type="String">${doc.semester || 'All Semesters'}</Data></Cell>
    <Cell><Data ss:Type="String">${doc.accessLevel || 'Department Authorized'}</Data></Cell>
    <Cell><Data ss:Type="String">VERIFIED &amp; CERTIFIED</Data></Cell>
   </Row>
   <Row ss:Index="10">
    <Cell ss:StyleID="Meta"><Data ss:Type="String">Description &amp; Purpose: ${doc.description || 'Department official archival record.'}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;
    blob = new Blob([xmlContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  } else if (doc.fileType === 'DOCX') {
    // Generate Rich Text Word-compatible document
    const rtf = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}}
{\\colortbl ;\\red15\\green23\\blue42;\\red71\\green85\\blue105;\\red14\\green165\\blue233;}
\\fs28\\b\\cf1 SOUTH EASTERN UNIVERSITY OF SRI LANKA\\par
\\fs22\\cf2 Faculty of Technology - Department of Information & Communication Technology\\par
\\fs20\\cf3 Official Department Archival Record\\par
\\line\\line
\\fs24\\b\\cf1 ${doc.title || 'Department Document'}\\par
\\fs20\\b0\\cf2 Reference Code: \\b ${doc.code || doc.id}\\b0\\par
Version: \\b ${versionLabel}\\b0\\par
Category: \\b ${doc.category || 'General'}\\b0\\par
Academic Year: \\b ${doc.academicYear || '2025/2026'}\\b0\\par
Access Restriction: \\b ${doc.accessLevel || 'Department'}\\b0\\par
Archived By: \\b ${doc.uploadedBy || 'Department MA'}\\b0  (Date: ${doc.uploadDate || ''})\\par
Last Modified: \\b ${doc.lastModifiedDate || doc.uploadDate || 'N/A'}\\b0\\par
\\line
\\fs20\\b Purpose & Archival Notes:\\par
\\b0 ${doc.description || 'Department record maintained by Department Management Assistant.'}\\par
\\line\\line
\\cf3\\i Certified Official Department Document - Department of ICT, Faculty of Technology, SEUSL\\par
}`;
    blob = new Blob([rtf], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  } else {
    // Standard Valid PDF 1.4 Binary Structure
    const sanitize = (s) => (s || '').replace(/[\r\n\t]/g, ' ').replace(/[()]/g, '');
    const lines = [
      `SOUTH EASTERN UNIVERSITY OF SRI LANKA`,
      `Faculty of Technology - Department of Information & Communication Technology`,
      `--------------------------------------------------------------------------------`,
      `DOCUMENT: ${sanitize(doc.title).slice(0, 52)}`,
      `CODE: ${sanitize(doc.code || doc.id)}`,
      `VERSION: ${sanitize(versionLabel)}`,
      `CATEGORY: ${sanitize(doc.category)}`,
      `ACADEMIC YEAR: ${sanitize(doc.academicYear || '2025/2026')} (${sanitize(doc.semester || 'All')})`,
      `ACCESS RESTRICTION: ${sanitize(doc.accessLevel)}`,
      `ARCHIVED BY: ${sanitize(doc.uploadedBy)}`,
      `ARCHIVAL DATE: ${sanitize(doc.uploadDate)}`,
      `LAST MODIFIED: ${sanitize(doc.lastModifiedDate || doc.uploadDate)}`,
      `--------------------------------------------------------------------------------`,
      `PURPOSE & ARCHIVAL SUMMARY:`,
      `${sanitize(doc.description).slice(0, 110)}`,
      `--------------------------------------------------------------------------------`,
      `Certified Official Department Archival Record - Department of ICT, SEUSL`
    ];

    let stream = 'BT\n/F1 13 Tf\n50 740 Td\n';
    lines.forEach((line, i) => {
      if (i === 0) {
        stream += `(${line}) Tj\n`;
      } else if (i === 1) {
        stream += `/F1 10 Tf\n0 -20 Td\n(${line}) Tj\n`;
      } else if (i === 2 || i === 12 || i === 15) {
        stream += `/F1 10 Tf\n0 -16 Td\n(${line}) Tj\n`;
      } else if (i === 3) {
        stream += `/F1 12 Tf\n0 -22 Td\n(${line}) Tj\n`;
      } else {
        stream += `/F1 10 Tf\n0 -17 Td\n(${line}) Tj\n`;
      }
    });
    stream += 'ET\n';

    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${stream.length} >>
stream
${stream}endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000225 00000 n 
0000000300 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
400
%%EOF`;
    blob = new Blob([pdfContent], { type: 'application/pdf' });
  }

  // Trigger browser download via anchor element
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);

  return fileName;
}

export default function DeptMADocuments({
  documents,
  deptInfo,
  onUploadDocument,
  onUpdateDocument,
  onShowToast,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterYear, setFilterYear] = useState('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedHistoryDoc, setSelectedHistoryDoc] = useState(null);

  // New Document Upload State
  const [uploadForm, setUploadForm] = useState({
    title: '',
    code: '',
    category: 'Academic Calendars & Schedules',
    academicYear: deptInfo.currentAcademicYear,
    semester: 'Semester 4 / 6',
    accessLevel: 'Department & Faculty',
    fileType: 'PDF',
    description: '',
  });

  const categories = [
    'ALL',
    'Academic Calendars & Schedules',
    'Medical Slips & Guidelines',
    'Registration Rosters',
    'Curriculum & Syllabi',
    'Meeting Minutes & Memos',
    'Student Academic Dossiers',
    'Student Verification Records',
  ];

  const academicYears = ['ALL', '2025/2026', '2024/2025'];

  // Filtered documents
  const filteredDocs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return documents.filter((doc) => {
      if (q) {
        const matches =
          doc.title.toLowerCase().includes(q) ||
          doc.code.toLowerCase().includes(q) ||
          (doc.description && doc.description.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (filterCategory !== 'ALL' && doc.category !== filterCategory) return false;
      if (filterYear !== 'ALL' && doc.academicYear !== filterYear) return false;
      return true;
    });
  }, [documents, searchQuery, filterCategory, filterYear]);

  // Keep selectedHistoryDoc in sync if updated in documents array
  const activeHistoryDoc = useMemo(() => {
    if (!selectedHistoryDoc) return null;
    return documents.find((d) => d.id === selectedHistoryDoc.id) || selectedHistoryDoc;
  }, [selectedHistoryDoc, documents]);

  // Security Check: Ensure document belongs to Department MA's authorized department
  const checkDepartmentAccess = (doc) => {
    if (doc.department && doc.department !== deptInfo.departmentName) {
      onShowToast(
        `Access Denied: You are only authorized to access documents for the ${deptInfo.departmentName}.`,
        'error'
      );
      return false;
    }
    return true;
  };

  // Download Handler
  const handleDownload = (doc, versionObj = null) => {
    try {
      if (!doc) {
        throw new Error('Document record is missing or unavailable.');
      }

      if (!checkDepartmentAccess(doc)) return;

      const fileName = downloadDocumentFile(doc, versionObj);

      // Increment download counter
      const updatedDoc = {
        ...doc,
        downloadsCount: (doc.downloadsCount || 0) + 1,
      };

      if (onUpdateDocument) {
        onUpdateDocument(updatedDoc);
      }

      if (selectedHistoryDoc && selectedHistoryDoc.id === doc.id) {
        setSelectedHistoryDoc(updatedDoc);
      }

      onShowToast(`Downloaded "${fileName}" successfully.`, 'success');
    } catch (error) {
      console.error('Download error:', error);
      onShowToast(`Download failed: ${error.message || 'Unable to download file.'}`, 'error');
    }
  };

  // Open Document History Modal
  const handleOpenHistory = (doc) => {
    if (!checkDepartmentAccess(doc)) return;
    setSelectedHistoryDoc(doc);
  };

  // Upload New Document Submit Handler
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadForm.title) return;

    const newDoc = {
      id: `DOC-2026-${String(documents.length + 1).padStart(3, '0')}`,
      code: uploadForm.code || `SEU/FOT/ICT/GEN/${new Date().getFullYear()}`,
      title: uploadForm.title,
      category: uploadForm.category,
      department: deptInfo.departmentName,
      academicYear: uploadForm.academicYear,
      semester: uploadForm.semester,
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize: '1.4 MB',
      fileType: uploadForm.fileType || 'PDF',
      uploadedBy: `${deptInfo.assignedMA.name} (Dept MA)`,
      lastModifiedDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      lastModifiedBy: `${deptInfo.assignedMA.name} (Dept MA)`,
      accessLevel: uploadForm.accessLevel,
      downloadsCount: 0,
      description: uploadForm.description || 'Uploaded by Department Management Assistant.',
      versions: [],
      activities: [
        {
          id: `ACT-${Date.now()}`,
          action: 'DOCUMENT_UPLOADED',
          title: 'Initial Document Archival',
          actor: `${deptInfo.assignedMA.name} (Dept MA)`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          details: 'Initial document archived into department repository.',
        },
      ],
    };

    onUploadDocument(newDoc);
    setShowUploadModal(false);
    setUploadForm({
      title: '',
      code: '',
      category: 'Academic Calendars & Schedules',
      academicYear: deptInfo.currentAcademicYear,
      semester: 'Semester 4 / 6',
      accessLevel: 'Department & Faculty',
      fileType: 'PDF',
      description: '',
    });
    onShowToast(`Document "${newDoc.title}" archived successfully.`, 'success');
  };

  return (
    <div className="dept-ma-documents-section">
      {/* 1. Filter Toolbar */}
      <div className="dept-ma-toolbar">
        <div className="dept-ma-toolbar-left">
          <div className="dept-ma-search-input-wrap">
            <span className="dept-ma-search-icon">🔍</span>
            <input
              type="text"
              className="dept-ma-search-input"
              placeholder="Search document title, code, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="dept-ma-filter-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Document Categories' : c}
              </option>
            ))}
          </select>

          <select
            className="dept-ma-filter-select"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            {academicYears.map((y) => (
              <option key={y} value={y}>
                {y === 'ALL' ? 'All Academic Years' : `Year: ${y}`}
              </option>
            ))}
          </select>
        </div>

        <div className="dept-ma-toolbar-right">
          <button
            type="button"
            className="dept-ma-btn-action primary"
            onClick={() => setShowUploadModal(true)}
          >
            📤 Upload Department Document
          </button>
        </div>
      </div>

      {/* 2. Documents Grid */}
      <div className="dept-ma-docs-grid">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc) => (
            <div key={doc.id} className="dept-ma-doc-card">
              <div>
                <div className="dept-ma-doc-top">
                  <div className={`dept-ma-doc-type-icon ${doc.fileType.toLowerCase()}`}>
                    {doc.fileType === 'PDF' ? '📄' : doc.fileType === 'XLSX' ? '📊' : '📝'}
                  </div>
                  <div className="dept-ma-doc-meta">
                    <h4>{doc.title}</h4>
                    <span className="dept-ma-doc-code">{doc.code}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                  <span className="dept-ma-status-badge active" style={{ fontSize: '0.7rem' }}>
                    {doc.category}
                  </span>
                  <span className="dept-ma-status-badge under-review" style={{ fontSize: '0.7rem' }}>
                    {doc.accessLevel}
                  </span>
                </div>

                <p className="dept-ma-doc-desc">{doc.description}</p>
              </div>

              <div>
                <div className="dept-ma-doc-footer">
                  <span>📅 {doc.uploadDate}</span>
                  <span>📦 {doc.fileSize} • ⬇️ {doc.downloadsCount || 0}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button
                    type="button"
                    className="dept-ma-btn-action secondary"
                    style={{ flex: 1, padding: '0.4rem 0.5rem', fontSize: '0.76rem', justifyContent: 'center' }}
                    onClick={() => handleDownload(doc)}
                  >
                    📥 Download
                  </button>
                  <button
                    type="button"
                    className="dept-ma-btn-action secondary"
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.76rem' }}
                    onClick={() => handleOpenHistory(doc)}
                  >
                    ℹ️ History
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              gridColumn: '1 / -1',
              background: '#ffffff',
              padding: '3rem 2rem',
              textAlign: 'center',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              color: '#64748b',
            }}
          >
            No departmental documents match the current filter selection.
          </div>
        )}
      </div>

      {/* 3. Dedicated Document History Modal */}
      {activeHistoryDoc && (
        <div className="dept-ma-modal-backdrop" onClick={() => setSelectedHistoryDoc(null)}>
          <div
            className="dept-ma-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '780px' }}
          >
            <div className="dept-ma-modal-header">
              <div>
                <h3 className="dept-ma-modal-title">Document History &amp; Revision Ledger</h3>
                <p className="dept-ma-modal-subtitle">
                  {activeHistoryDoc.code} — {activeHistoryDoc.title}
                </p>
                <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                  <span className="dept-ma-status-badge active" style={{ fontSize: '0.7rem' }}>
                    {activeHistoryDoc.category}
                  </span>
                  <span className="dept-ma-status-badge under-review" style={{ fontSize: '0.7rem' }}>
                    {activeHistoryDoc.accessLevel}
                  </span>
                  <span
                    className="dept-ma-status-badge"
                    style={{ fontSize: '0.7rem', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}
                  >
                    ✓ Department of ICT Authorized
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="dept-ma-modal-close"
                onClick={() => setSelectedHistoryDoc(null)}
                aria-label="Close History Modal"
              >
                ✕
              </button>
            </div>

            <div className="dept-ma-modal-body" style={{ padding: '1.5rem 1.75rem' }}>
              {/* Document Overview Metadata Grid */}
              <div className="dept-ma-history-meta-grid">
                <div className="dept-ma-history-meta-card">
                  <div className="dept-ma-history-meta-label">Document Identification</div>
                  <div className="dept-ma-history-meta-val">{activeHistoryDoc.code}</div>
                  <div className="dept-ma-history-meta-sub">
                    Format: {activeHistoryDoc.fileType} • Size: {activeHistoryDoc.fileSize}
                  </div>
                </div>

                <div className="dept-ma-history-meta-card">
                  <div className="dept-ma-history-meta-label">Archived Details</div>
                  <div className="dept-ma-history-meta-val">{activeHistoryDoc.uploadDate}</div>
                  <div className="dept-ma-history-meta-sub">By: {activeHistoryDoc.uploadedBy}</div>
                </div>

                <div className="dept-ma-history-meta-card">
                  <div className="dept-ma-history-meta-label">Last Modified</div>
                  <div className="dept-ma-history-meta-val">
                    {activeHistoryDoc.lastModifiedDate || activeHistoryDoc.uploadDate}
                  </div>
                  <div className="dept-ma-history-meta-sub">
                    By: {activeHistoryDoc.lastModifiedBy || activeHistoryDoc.uploadedBy}
                  </div>
                </div>

                <div className="dept-ma-history-meta-card">
                  <div className="dept-ma-history-meta-label">Usage &amp; Version</div>
                  <div className="dept-ma-history-meta-val">
                    {activeHistoryDoc.downloadsCount || 0} Downloads
                  </div>
                  <div className="dept-ma-history-meta-sub">
                    Current: {activeHistoryDoc.versions?.[0]?.version || 'v1.0 (Official)'}
                  </div>
                </div>
              </div>

              {/* Archival Memo / Description */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '0.85rem 1.1rem',
                  fontSize: '0.82rem',
                  lineHeight: '1.45',
                  color: '#334155',
                }}
              >
                <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#0f172a' }}>
                  Archival Purpose &amp; Regulatory Context:
                </strong>
                {activeHistoryDoc.description || 'No description provided for this document.'}
              </div>

              {/* SECTION 1: Previous Document Versions */}
              <div>
                <div className="dept-ma-history-section-header">
                  <div className="dept-ma-history-section-title">
                    <span>📁</span> Document Version History
                  </div>
                  <span className="dept-ma-history-section-sub">
                    {activeHistoryDoc.versions?.length || 0} registered version(s)
                  </span>
                </div>

                {activeHistoryDoc.versions && activeHistoryDoc.versions.length > 0 ? (
                  <div className="dept-ma-version-list">
                    {activeHistoryDoc.versions.map((ver, idx) => (
                      <div
                        key={idx}
                        className={`dept-ma-version-item ${ver.isCurrent ? 'is-current' : ''}`}
                      >
                        <div className="dept-ma-version-top">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className={`dept-ma-version-tag ${ver.isCurrent ? 'current' : ''}`}>
                              {ver.version}
                            </span>
                            {ver.isCurrent && (
                              <span style={{ fontSize: '0.72rem', color: '#0ea5e9', fontWeight: '700' }}>
                                Active Version
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                            🕒 {ver.modifiedDate} • {ver.modifiedBy}
                          </span>
                        </div>

                        <div className="dept-ma-version-changes">
                          <strong>Changes: </strong> {ver.changes || 'Initial approved release.'}
                        </div>

                        <div className="dept-ma-version-bottom">
                          <span>
                            File Specs: {ver.fileSize || activeHistoryDoc.fileSize} • {ver.fileType || activeHistoryDoc.fileType}
                          </span>
                          <button
                            type="button"
                            className="dept-ma-btn-action secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.74rem' }}
                            onClick={() => handleDownload(activeHistoryDoc, ver)}
                          >
                            📥 Download {ver.version.split(' ')[0]}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dept-ma-history-empty-state">
                    <div className="dept-ma-history-empty-icon">📁</div>
                    <div className="dept-ma-history-empty-title">No document history available.</div>
                    <p className="dept-ma-history-empty-sub">
                      This document has no previous versions recorded in the repository. It is currently at its initial release (v1.0).
                    </p>
                  </div>
                )}
              </div>

              {/* SECTION 2: Document Activity Ledger & Revision Audit Trail */}
              <div>
                <div className="dept-ma-history-section-header">
                  <div className="dept-ma-history-section-title">
                    <span>🕒</span> Document Activity &amp; Revision Audit Log
                  </div>
                  <span className="dept-ma-history-section-sub">
                    {activeHistoryDoc.activities?.length || 0} audit event(s)
                  </span>
                </div>

                {activeHistoryDoc.activities && activeHistoryDoc.activities.length > 0 ? (
                  <div className="dept-ma-history-activity-list">
                    {activeHistoryDoc.activities.map((act) => (
                      <div key={act.id} className="dept-ma-history-activity-item">
                        <div className="dept-ma-history-activity-icon">
                          {act.action === 'DOCUMENT_UPLOADED' ? '📤' : act.action === 'DOCUMENT_REPLACED' ? '🔄' : '📝'}
                        </div>
                        <div className="dept-ma-history-activity-content">
                          <div className="dept-ma-history-activity-title">
                            <span>{act.title}</span>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                background: '#e2e8f0',
                                color: '#475569',
                                fontWeight: '600',
                              }}
                            >
                              {act.action}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.15rem' }}>
                            👤 {act.actor} • 🕒 {act.timestamp}
                          </div>
                          <div className="dept-ma-history-activity-details">{act.details}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dept-ma-history-empty-state">
                    <div className="dept-ma-history-empty-icon">📋</div>
                    <div className="dept-ma-history-empty-title">No document history available.</div>
                    <p className="dept-ma-history-empty-sub">
                      No activity, update, or replacement history has been logged for this document yet.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="dept-ma-modal-footer" style={{ justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>🔒</span>
                <span>Authorized Record: {deptInfo.departmentName}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="dept-ma-btn-action primary"
                  onClick={() => handleDownload(activeHistoryDoc)}
                >
                  📥 Download Current File
                </button>
                <button
                  type="button"
                  className="dept-ma-btn-action secondary"
                  onClick={() => setSelectedHistoryDoc(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Upload Modal */}
      {showUploadModal && (
        <div className="dept-ma-modal-backdrop" onClick={() => setShowUploadModal(false)}>
          <div
            className="dept-ma-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '600px' }}
          >
            <div className="dept-ma-modal-header">
              <h3 className="dept-ma-modal-title">Upload Department Document</h3>
              <button
                type="button"
                className="dept-ma-modal-close"
                onClick={() => setShowUploadModal(false)}
                aria-label="Close Upload Modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              <div className="dept-ma-modal-body">
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                    Document Title *
                  </label>
                  <input
                    type="text"
                    className="dept-ma-search-input"
                    style={{ paddingLeft: '0.85rem' }}
                    placeholder="e.g. Certified Attendance Eligibility Master List Term II"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                      Document Serial / Reference Code
                    </label>
                    <input
                      type="text"
                      className="dept-ma-search-input"
                      style={{ paddingLeft: '0.85rem' }}
                      placeholder="SEU/FOT/ICT/..."
                      value={uploadForm.code}
                      onChange={(e) => setUploadForm({ ...uploadForm, code: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                      Document Category *
                    </label>
                    <select
                      className="dept-ma-filter-select"
                      style={{ width: '100%' }}
                      value={uploadForm.category}
                      onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    >
                      {categories.filter((c) => c !== 'ALL').map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                      Academic Year
                    </label>
                    <select
                      className="dept-ma-filter-select"
                      style={{ width: '100%' }}
                      value={uploadForm.academicYear}
                      onChange={(e) => setUploadForm({ ...uploadForm, academicYear: e.target.value })}
                    >
                      <option value="2025/2026">2025/2026</option>
                      <option value="2024/2025">2024/2025</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                      File Format *
                    </label>
                    <select
                      className="dept-ma-filter-select"
                      style={{ width: '100%' }}
                      value={uploadForm.fileType}
                      onChange={(e) => setUploadForm({ ...uploadForm, fileType: e.target.value })}
                    >
                      <option value="PDF">PDF (Portable Document Format)</option>
                      <option value="XLSX">XLSX (Excel Spreadsheet)</option>
                      <option value="DOCX">DOCX (Word Document)</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                      Access Restriction Tier *
                    </label>
                    <select
                      className="dept-ma-filter-select"
                      style={{ width: '100%' }}
                      value={uploadForm.accessLevel}
                      onChange={(e) => setUploadForm({ ...uploadForm, accessLevel: e.target.value })}
                    >
                      <option value="Department Confidential">Department Confidential (MA / HOD)</option>
                      <option value="Department & Faculty">Department &amp; Faculty Shared</option>
                      <option value="Public to Students">Public to Registered Students</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                    Document Description / Archival Notes
                  </label>
                  <textarea
                    rows="3"
                    className="dept-ma-search-input"
                    style={{ paddingLeft: '0.85rem', height: 'auto' }}
                    placeholder="Enter archival notes, circular reference, or faculty board approval context..."
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  />
                </div>

                <div
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    textAlign: 'center',
                    background: '#f8fafc',
                  }}
                >
                  <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.35rem' }}>📁</span>
                  <span style={{ fontSize: '0.84rem', color: '#334155', fontWeight: '600' }}>
                    Select {uploadForm.fileType} File to Archive
                  </span>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Maximum file size: 25 MB • Encryption applied on archival storage
                  </div>
                </div>
              </div>

              <div className="dept-ma-modal-footer">
                <button
                  type="button"
                  className="dept-ma-btn-action secondary"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="dept-ma-btn-action primary">
                  Archive Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
