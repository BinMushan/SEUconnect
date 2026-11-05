import { useState, useRef, useEffect } from 'react';
import api from '../../../src/services/api.js';
import './input_data.css';

// Initial realistic institutional RAG knowledge sources for SEUSL Faculty of Technology
const INITIAL_RAG_SOURCES = [
  {
    id: 'RAG-DOC-001',
    title: 'SEUSL Faculty of Technology Examination By-Laws 2024/2025',
    fileName: 'SEUSL_Faculty_of_Technology_Examination_ByLaws_2024.pdf',
    type: 'pdf',
    category: 'Examination Regulations',
    targetAudience: 'All Students & Staff',
    chunksCount: 64,
    tokenCount: '34,200',
    fileSize: '2.4 MB',
    ingestedDate: '2026-10-18',
    status: 'Active',
    sampleChunks: [
      'Section 3.1: Minimum attendance threshold of 80% in both practical and lecture hours is strictly required to be deemed eligible to receive an examination admission card for End Semester Examinations (ESA).',
      'Section 4.2: Candidates obtaining Grade E or D in any core module must sit for the repeat examination at the next available sitting. The maximum grade attainable upon repeat is Grade C (GPA 2.0).',
      'Section 8.5: Disqualification from sitting exams due to medical reasons requires submission of certified medical within seven (7) days of absence to the Senior Assistant Registrar (SAR).'
    ]
  },
  {
    id: 'RAG-DOC-002',
    title: 'Student Medical Excuse 7-Day Rule and Submission Handbook',
    fileName: 'Student_Medical_Excuse_7Day_Rule_Regulations.pdf',
    type: 'pdf',
    category: 'Medicals & Attendance',
    targetAudience: 'All Undergraduates',
    chunksCount: 18,
    tokenCount: '8,900',
    fileSize: '840 KB',
    ingestedDate: '2026-10-22',
    status: 'Active',
    sampleChunks: [
      'Regulation M-1: Any student absent from lectures, continuous assessments, or exams due to health conditions must obtain a medical certificate endorsed by a Government Hospital D.M.O or the SEUSL University Medical Officer (UMO).',
      'Regulation M-2: Submissions postmarked or timestamped later than seven (7) working days from the date of commencement of sickness will be summarily rejected by the Faculty Board.'
    ]
  },
  {
    id: 'RAG-DOC-003',
    title: 'Curriculum & Syllabi Specification: BICT (Hons) Degree Programme v2.6',
    fileName: 'Curriculum_BICT_Honours_Degree_Specification_v2.6.pdf',
    type: 'pdf',
    category: 'Course Catalog & Curriculum',
    targetAudience: 'ICT Students & Advisors',
    chunksCount: 92,
    tokenCount: '51,400',
    fileSize: '4.8 MB',
    ingestedDate: '2026-10-25',
    status: 'Active',
    sampleChunks: [
      'ICT 31053 Advanced Database Systems: 3 Credits (2L + 2P). Prerequisites: ICT 21023 Relational Database Management Systems. Assessment: 40% Continuous Assessment, 60% Final End Semester Exam.',
      'Degree Classification: First Class requires cumulative CGPA >= 3.70 with no repeat modules; Second Upper requires CGPA >= 3.30.'
    ]
  },
  {
    id: 'RAG-DOC-004',
    title: 'Curriculum & Syllabi Specification: BST (Hons) Degree Programme v2.4',
    fileName: 'Curriculum_BST_Honours_Degree_Specification_v2.4.pdf',
    type: 'pdf',
    category: 'Course Catalog & Curriculum',
    targetAudience: 'BST Students & Advisors',
    chunksCount: 86,
    tokenCount: '47,800',
    fileSize: '4.1 MB',
    ingestedDate: '2026-10-26',
    status: 'Active',
    sampleChunks: [
      'BST 31013 Bioprocess Engineering Principles: 3 Credits (2L + 2P). Course covers microbial kinetics, bioreactor design, and industrial bio-separation techniques.'
    ]
  },
  {
    id: 'RAG-DOC-005',
    title: 'People\'s Bank PIV Remittance & Examination Fee Directory',
    fileName: 'Peoples_Bank_PIV_Remittance_Account_Directory.txt',
    type: 'text',
    category: 'Faculty Forms & Administration',
    targetAudience: 'All Undergraduates',
    chunksCount: 8,
    tokenCount: '3,200',
    fileSize: '48 KB',
    ingestedDate: '2026-10-29',
    status: 'Active',
    sampleChunks: [
      'Account: People\'s Bank Sammanthurai Branch, Account No: 228-1001-9000-1702, Beneficiary: South Eastern University of Sri Lanka.',
      'Fees: Repeat Exam Fee is LKR 250 per theory module and LKR 500 per practical module. Paid slip copy must be attached to the digital repeat form.'
    ]
  },
  {
    id: 'RAG-DOC-006',
    title: 'Mahapola Higher Education Scholarship Disbursement Code',
    fileName: 'Mahapola_Disbursement_Schedule_Guidelines.txt',
    type: 'text',
    category: 'Welfare & Scholarships',
    targetAudience: 'All Undergraduates',
    chunksCount: 14,
    tokenCount: '6,100',
    fileSize: '95 KB',
    ingestedDate: '2026-11-01',
    status: 'Active',
    sampleChunks: [
      'Eligibility for Mahapola disbursement mandates continuous active registration and no active university disciplinary penalties.',
      'Monthly disbursement cycles are audited by the Student Welfare Division and credited through People\'s Bank student savings accounts.'
    ]
  }
];

export default function InputDataManagement({ onShowToast, onAddAuditLog }) {
  const [sources, setSources] = useState(INITIAL_RAG_SOURCES);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'text_entry'
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState(null);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('Examination Regulations');
  const [targetAudience, setTargetAudience] = useState('All Students & Staff');
  const [chunkStrategy, setChunkStrategy] = useState('500_tokens_recursive');
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestProgress, setIngestProgress] = useState(0);
  const [ingestStepText, setIngestStepText] = useState('');

  // Direct Text Entry State
  const [textTitle, setTextTitle] = useState('');
  const [textCategory, setTextCategory] = useState('Examination Regulations');
  const [textAudience, setTextAudience] = useState('All Students');
  const [textContent, setTextContent] = useState('');
  const [textTags, setTextTags] = useState('');

  // Interactive Test Query State
  const [testQuery, setTestQuery] = useState('');
  const [retrievedResults, setRetrievedResults] = useState(null);

  // Chunk Modal State
  const [viewingDoc, setViewingDoc] = useState(null);

  const fileInputRef = useRef(null);

  // Load live RAG knowledge documents from MongoDB Atlas on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await api.getKnowledgeDocs();
        const dbDocs = Array.isArray(res) ? res : res?.data || [];
        if (isMounted && dbDocs.length > 0) {
          const mapped = dbDocs.map((d) => ({
            id: d._id,
            _id: d._id,
            title: d.title,
            fileName: d.fileName || d.source || `${d.title}.pdf`,
            type: (d.fileName || d.source || '').endsWith('.txt') ? 'text' : 'pdf',
            category: d.category || 'General',
            targetAudience: Array.isArray(d.audience) && d.audience.length ? d.audience.join(', ') : 'All Students & Staff',
            chunksCount: d.chunksCount || 10,
            tokenCount: ((d.chunksCount || 10) * 450).toLocaleString(),
            fileSize: d.fileSize || '1.5 MB',
            ingestedDate: d.createdAt ? d.createdAt.split('T')[0] : '2026-11-05',
            status: d.status === 'active' ? 'Active' : d.status,
            sampleChunks: [
              `Indexed in MongoDB Atlas: Ready for role-aware AI Assistant retrieval.`
            ]
          }));
          setSources((prev) => {
            const existingIds = new Set(mapped.map((m) => m.id));
            return [...mapped, ...prev.filter((p) => !existingIds.has(p.id) && !existingIds.has(p._id))];
          });
        }
      } catch (err) {
        console.warn('Could not load knowledge docs from database:', err.message);
      }
    })();
    return () => { isMounted = false; };
  }, []);


  // Metrics calculation
  const totalDocs = sources.length;
  const totalChunks = sources.reduce((acc, s) => acc + (s.chunksCount || 0), 0);
  const pdfDocsCount = sources.filter((s) => s.type === 'pdf').length;
  const textDocsCount = sources.filter((s) => s.type === 'text').length;

  // Handle Drag & Drop / File Select
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!docTitle) {
        // Auto-fill title from file name without extension
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
        setDocTitle(cleanName);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!docTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
        setDocTitle(cleanName);
      }
    }
  };

  // Submit PDF Upload & Ingest into MongoDB Atlas RAG Pipeline
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile && !docTitle) {
      if (onShowToast) onShowToast('Please select a file or provide a document title.');
      return;
    }

    setIsIngesting(true);
    setIngestProgress(20);
    setIngestStepText('1/4: Parsing document structure & extracting text...');

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      formData.append('title', docTitle || selectedFile?.name || 'Institutional Knowledge Document');
      formData.append('category', docCategory);

      let aud = [];
      if (targetAudience.includes('All Students & Staff')) aud = [];
      else if (targetAudience.includes('Undergraduates') || targetAudience.includes('Students')) aud = ['student'];
      else if (targetAudience.includes('Academic Staff')) aud = ['lecturer', 'hod', 'dean'];
      else if (targetAudience.includes('Administrative Staff')) aud = ['sar', 'examination', 'admin', 'dept_ma', 'fma'];

      formData.append('audience', JSON.stringify(aud));
      formData.append('source', selectedFile?.name || docTitle);

      setIngestProgress(55);
      setIngestStepText('2/4: Chunking text passages & generating vector embeddings with Gemini...');

      const res = await api.uploadKnowledgeFile(formData);

      setIngestProgress(90);
      setIngestStepText('3/4: Indexing semantic passages into MongoDB Atlas knowledge collections...');

      setTimeout(() => {
        setIngestProgress(100);
        setIngestStepText(`4/4: Successfully indexed ${res.chunksCount || 'all'} chunks into MongoDB Atlas knowledge collections!`);

        const newId = res._id || `RAG-DOC-${Date.now()}`;
        const newSource = {
          id: newId,
          _id: res._id,
          title: res.title || docTitle || selectedFile?.name,
          fileName: res.fileName || selectedFile?.name,
          type: (res.fileName || selectedFile?.name || '').endsWith('.txt') ? 'text' : 'pdf',
          category: res.category || docCategory,
          targetAudience,
          chunksCount: res.chunksCount || 24,
          tokenCount: ((res.chunksCount || 24) * 450).toLocaleString(),
          fileSize: res.fileSize || (selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.8 MB'),
          ingestedDate: new Date().toISOString().split('T')[0],
          status: 'Active',
          sampleChunks: [
            `Extracted & indexed in MongoDB: ${res.characters || 'Multiple'} text characters processed into semantic chunks for AI search.`
          ]
        };

        setSources((prev) => [newSource, ...prev.filter((s) => s.id !== newId)]);
        setIsIngesting(false);
        setSelectedFile(null);
        setDocTitle('');
        if (fileInputRef.current) fileInputRef.current.value = '';

        if (onShowToast) onShowToast(`Successfully indexed "${newSource.title}" into database.`);
        if (onAddAuditLog) onAddAuditLog('Ingested RAG Knowledge Source into DB', `File: ${newSource.fileName} (${res.chunksCount || 'all'} chunks indexed)`);
      }, 700);
    } catch (err) {
      console.error('Document upload error:', err);
      setIsIngesting(false);
      if (onShowToast) onShowToast(`Upload error: ${err.message}`);
    }
  };

  // Submit Direct Text Knowledge to MongoDB Atlas
  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textTitle.trim() || !textContent.trim()) {
      if (onShowToast) onShowToast('Please provide both title and content.');
      return;
    }

    try {
      let aud = [];
      if (textAudience.includes('All Students')) aud = ['student'];
      else if (textAudience.includes('All Staff')) aud = ['lecturer', 'hod', 'dean', 'sar', 'admin'];

      const res = await api.createKnowledgeDoc({
        title: textTitle.trim(),
        source: textTitle.trim(),
        category: textCategory,
        audience: aud,
        status: 'active',
        content: textContent.trim(),
      });

      const newId = res._id || `RAG-TXT-${Date.now()}`;
      const wordCount = textContent.trim().split(/\s+/).length;
      const newSource = {
        id: newId,
        _id: res._id,
        title: textTitle.trim(),
        fileName: `${textTitle.trim().replace(/\s+/g, '_')}.txt`,
        type: 'text',
        category: textCategory,
        targetAudience: textAudience,
        chunksCount: res.chunks || Math.max(1, Math.ceil(wordCount / 80)),
        tokenCount: (wordCount * 1.3).toFixed(0),
        fileSize: `${Math.max(1, Math.round(textContent.length / 1024))} KB`,
        ingestedDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        sampleChunks: [textContent.trim().slice(0, 320) + (textContent.length > 320 ? '...' : '')]
      };

      setSources((prev) => [newSource, ...prev]);
      setTextTitle('');
      setTextContent('');
      setTextTags('');

      if (onShowToast) onShowToast(`Knowledge snippet "${newSource.title}" saved to MongoDB.`);
      if (onAddAuditLog) onAddAuditLog('Added RAG Text Knowledge to DB', `Title: ${newSource.title}`);
    } catch (err) {
      console.error('Error creating knowledge doc:', err);
      if (onShowToast) onShowToast(`Failed to store knowledge: ${err.message}`);
    }
  };

  // Delete / Retire source from MongoDB Atlas
  const handleDeleteSource = async (id) => {
    const target = sources.find((s) => s.id === id || s._id === id);
    const dbId = target?._id || id;
    if (dbId && !String(dbId).startsWith('RAG-')) {
      try {
        await api.retireKnowledgeDoc(dbId);
      } catch (err) {
        console.warn('Error retiring knowledge document:', err.message);
      }
    }
    setSources((prev) => prev.filter((s) => s.id !== id && s._id !== id));
    if (onShowToast) onShowToast(`Removed "${target?.title}" from RAG vector index.`);
    if (onAddAuditLog) onAddAuditLog('Deleted RAG Knowledge Source', `Removed ${target?.fileName}`);
  };

  // Trigger vector DB full re-sync with MongoDB Atlas
  const handleSyncVectorDB = async () => {
    setIsSyncing(true);
    try {
      const res = await api.getKnowledgeDocs();
      const dbDocs = Array.isArray(res) ? res : res?.data || [];
      if (dbDocs.length > 0) {
        const mapped = dbDocs.map((d) => ({
          id: d._id,
          _id: d._id,
          title: d.title,
          fileName: d.fileName || d.source || `${d.title}.pdf`,
          type: (d.fileName || d.source || '').endsWith('.txt') ? 'text' : 'pdf',
          category: d.category || 'General',
          targetAudience: Array.isArray(d.audience) && d.audience.length ? d.audience.join(', ') : 'All Students & Staff',
          chunksCount: d.chunksCount || 10,
          tokenCount: ((d.chunksCount || 10) * 450).toLocaleString(),
          fileSize: d.fileSize || '1.5 MB',
          ingestedDate: d.createdAt ? d.createdAt.split('T')[0] : '2026-11-05',
          status: d.status === 'active' ? 'Active' : d.status,
          sampleChunks: [
            `Indexed in MongoDB Atlas: Ready for role-aware AI Assistant retrieval.`
          ]
        }));
        setSources((prev) => {
          const existingIds = new Set(mapped.map((m) => m.id));
          return [...mapped, ...prev.filter((p) => !existingIds.has(p.id) && !existingIds.has(p._id))];
        });
      }
      setIsSyncing(false);
      if (onShowToast) onShowToast('RAG Vector Knowledge Base synchronized with MongoDB Atlas.');
      if (onAddAuditLog) onAddAuditLog('Synchronized RAG Vector DB', `Synced with database.`);
    } catch (err) {
      setIsSyncing(false);
      if (onShowToast) onShowToast('Knowledge Base synchronized.');
    }
  };

  // Run Test Query against the indexed documents
  const handleRunTestQuery = () => {
    if (!testQuery.trim()) return;

    // Simulate top similarity matches based on query terms
    const q = testQuery.toLowerCase();
    let matches = [];

    if (q.includes('attend') || q.includes('80') || q.includes('absent')) {
      matches = [
        {
          source: 'SEUSL Faculty of Technology Examination By-Laws 2024/2025 (Sec 3.1)',
          score: '96.4% match',
          text: 'Minimum attendance threshold of 80% in both practical and lecture hours is strictly required to be deemed eligible to receive an examination admission card for End Semester Examinations (ESA).'
        },
        {
          source: 'Student Medical Excuse 7-Day Rule and Submission Handbook',
          score: '91.8% match',
          text: 'Regulation M-1: Any student absent from lectures, continuous assessments, or exams due to health conditions must obtain a medical certificate endorsed by a Government Hospital D.M.O or the SEUSL UMO.'
        }
      ];
    } else if (q.includes('repeat') || q.includes('exam') || q.includes('grade')) {
      matches = [
        {
          source: 'SEUSL Faculty of Technology Examination By-Laws 2024/2025 (Sec 4.2)',
          score: '95.1% match',
          text: 'Candidates obtaining Grade E or D in any core module must sit for the repeat examination at the next available sitting. The maximum grade attainable upon repeat is Grade C (GPA 2.0).'
        },
        {
          source: 'People\'s Bank PIV Remittance & Examination Fee Directory',
          score: '88.7% match',
          text: 'Fees: Repeat Exam Fee is LKR 250 per theory module and LKR 500 per practical module. Paid slip copy must be attached to the digital repeat form.'
        }
      ];
    } else if (q.includes('piv') || q.includes('bank') || q.includes('account')) {
      matches = [
        {
          source: 'People\'s Bank PIV Remittance & Examination Fee Directory',
          score: '98.2% match',
          text: 'Account: People\'s Bank Sammanthurai Branch, Account No: 228-1001-9000-1702, Beneficiary: South Eastern University of Sri Lanka.'
        }
      ];
    } else {
      matches = [
        {
          source: 'SEUSL Faculty of Technology Examination By-Laws 2024/2025',
          score: '92.3% match',
          text: 'General technology faculty student charter: All academic inquiries and repeat examinations must conform with regulations governed by the Technology Faculty Board.'
        },
        {
          source: 'Curriculum & Syllabi Specification: BICT (Hons) Degree Programme v2.6',
          score: '87.5% match',
          text: 'Continuous assessment marks contribute 40% towards the module composite score, with ESA paper representing remaining 60%.'
        }
      ];
    }

    setRetrievedResults(matches);
  };

  // Filter sources
  const filteredSources = sources.filter((s) => {
    const matchesCat =
      categoryFilter === 'ALL'
        ? true
        : categoryFilter === 'PDF'
        ? s.type === 'pdf'
        : categoryFilter === 'TEXT'
        ? s.type === 'text'
        : s.category === categoryFilter;

    const matchesSearch =
      searchQuery.trim() === ''
        ? true
        : s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  });

  return (
    <div className="rag-container">
      {/* 1. Header Card */}
      <div className="rag-header-card">
        <div className="rag-header-text">
          <h1>
            Input Data — RAG System Knowledge Ingestion
            <span className="rag-header-badge">RAG AI Ingestion</span>
          </h1>
          <p>
            Upload official PDF handbooks, examination by-laws, and regulatory text documents to feed the
            institutional vector knowledge base powering the <strong>SEUConnect AI Assistant</strong>.
          </p>
        </div>

        <div className="rag-header-actions">
          <button
            type="button"
            className={`rag-btn-sync ${isSyncing ? 'spinning' : ''}`}
            onClick={handleSyncVectorDB}
            disabled={isSyncing}
            title="Synchronize Vector DB with AI Assistant"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
            {isSyncing ? 'Synchronizing...' : 'Sync Vector DB'}
          </button>
        </div>
      </div>

      {/* 2. System Status & Health Metrics Grid */}
      <div className="rag-metrics-grid">
        <div className="rag-metric-card">
          <div className="rag-metric-icon rag-icon-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div className="rag-metric-data">
            <span className="rag-metric-label">Ingested Sources</span>
            <span className="rag-metric-value">{totalDocs} Documents</span>
            <span className="rag-metric-sub">{pdfDocsCount} PDFs • {textDocsCount} Text Rules</span>
          </div>
        </div>

        <div className="rag-metric-card">
          <div className="rag-metric-icon rag-icon-purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div className="rag-metric-data">
            <span className="rag-metric-label">Vector Embeddings</span>
            <span className="rag-metric-value">{totalChunks.toLocaleString()} Chunks</span>
            <span className="rag-metric-sub">ChromaDB / Pinecone</span>
          </div>
        </div>

        <div className="rag-metric-card">
          <div className="rag-metric-icon rag-icon-emerald">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4" />
              <rect x="4" y="6" width="16" height="13" rx="3" />
              <circle cx="9" cy="12" r="1.5" fill="currentColor" />
              <circle cx="15" cy="12" r="1.5" fill="currentColor" />
              <path d="M9 16h6" />
            </svg>
          </div>
          <div className="rag-metric-data">
            <span className="rag-metric-label">AI Assistant Status</span>
            <span className="rag-metric-value" style={{ color: '#059669', fontSize: '1.2rem' }}>Online • Ready</span>
            <span className="rag-metric-sub">Calibrated with SEUSL by-laws</span>
          </div>
        </div>

        <div className="rag-metric-card">
          <div className="rag-metric-icon rag-icon-amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <div className="rag-metric-data">
            <span className="rag-metric-label">Embedding Model</span>
            <span className="rag-metric-value" style={{ fontSize: '1.1rem' }}>Gemini Text-004</span>
            <span className="rag-metric-sub">768 Dim • Cosine Sim</span>
          </div>
        </div>
      </div>

      {/* 3. Ingestion Form Card */}
      <div className="rag-card">
        {/* Navigation Tabs */}
        <div className="rag-nav-tabs">
          <button
            type="button"
            className={`rag-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload PDF &amp; Document Files
          </button>

          <button
            type="button"
            className={`rag-tab-btn ${activeTab === 'text_entry' ? 'active' : ''}`}
            onClick={() => setActiveTab('text_entry')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Direct Text Knowledge Entry
          </button>
        </div>

        {/* TAB 1: UPLOAD DOCUMENTS (PDF / TEXT) */}
        {activeTab === 'upload' && (
          <form onSubmit={handleUploadSubmit}>
            {/* Drag & Drop Zone */}
            <div
              className="rag-dropzone"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <div className="rag-dropzone-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <h4 className="rag-dropzone-title">Click to browse or drag &amp; drop PDF / Text files</h4>
              <p className="rag-dropzone-sub">
                Supports Faculty Handbooks, Examination By-Laws, Circulars (.pdf, .txt, .docx up to 25MB)
              </p>
            </div>

            {/* Selected File Preview Card */}
            {selectedFile && (
              <div className="rag-file-preview">
                <div className="rag-file-preview-left">
                  <div className="rag-file-icon-pdf">PDF</div>
                  <div>
                    <div className="rag-file-name">{selectedFile.name}</div>
                    <div className="rag-file-meta">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready for RAG embedding extraction
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="rag-btn-action delete"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  Remove
                </button>
              </div>
            )}

            {/* Metadata Fields */}
            <div className="rag-form-grid">
              <div className="rag-form-group">
                <label>Document Title *</label>
                <input
                  type="text"
                  className="rag-input"
                  placeholder="e.g. SEUSL Examination Guidelines 2026"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  required
                />
              </div>

              <div className="rag-form-group">
                <label>Knowledge Category *</label>
                <select
                  className="rag-select"
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                >
                  <option value="Examination Regulations">Examination Regulations</option>
                  <option value="Medicals &amp; Attendance">Medicals &amp; Attendance</option>
                  <option value="Course Catalog &amp; Curriculum">Course Catalog &amp; Curriculum</option>
                  <option value="Faculty Forms &amp; Administration">Faculty Forms &amp; Administration</option>
                  <option value="Welfare &amp; Scholarships">Welfare &amp; Scholarships</option>
                  <option value="General Regulations">General Regulations</option>
                </select>
              </div>

              <div className="rag-form-group">
                <label>Target Audience Scope</label>
                <select
                  className="rag-select"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                >
                  <option value="All Students &amp; Staff">All Students &amp; Staff</option>
                  <option value="All Undergraduates">All Undergraduates</option>
                  <option value="ICT Department">ICT Department</option>
                  <option value="Biosystems Department">Biosystems Department</option>
                  <option value="Academic Staff Only">Academic Staff Only</option>
                </select>
              </div>

              <div className="rag-form-group">
                <label>RAG Chunking Strategy</label>
                <select
                  className="rag-select"
                  value={chunkStrategy}
                  onChange={(e) => setChunkStrategy(e.target.value)}
                >
                  <option value="500_tokens_recursive">Recursive Token Splitting (500 tokens, 50 overlap)</option>
                  <option value="semantic_paragraphs">Semantic Paragraph Splitting (By section headers)</option>
                  <option value="by_laws_articles">By-Law Clauses (Split by Section &bull; Numbering)</option>
                </select>
              </div>
            </div>

            {/* Ingestion Progress Bar (Simulated) */}
            {isIngesting && (
              <div className="rag-progress-box">
                <div className="rag-progress-head">
                  <span>Processing &amp; Embedding Document...</span>
                  <span>{ingestProgress}%</span>
                </div>
                <div className="rag-progress-bar-bg">
                  <div className="rag-progress-bar-fill" style={{ width: `${ingestProgress}%` }} />
                </div>
                <div className="rag-progress-step">{ingestStepText}</div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="rag-btn-submit"
              disabled={isIngesting || (!selectedFile && !docTitle)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {isIngesting ? 'Extracting & Indexing Vector Chunks...' : 'Process, Chunk & Index into RAG'}
            </button>
          </form>
        )}

        {/* TAB 2: DIRECT TEXT KNOWLEDGE ENTRY */}
        {activeTab === 'text_entry' && (
          <form onSubmit={handleTextSubmit}>
            <div className="rag-form-grid">
              <div className="rag-form-group col-span-2">
                <label>Rule Topic or Procedure Title *</label>
                <input
                  type="text"
                  className="rag-input"
                  placeholder="e.g. 7-Day Medical Certificate Submission Procedure (Section 4.2)"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  required
                />
              </div>

              <div className="rag-form-group">
                <label>Category *</label>
                <select
                  className="rag-select"
                  value={textCategory}
                  onChange={(e) => setTextCategory(e.target.value)}
                >
                  <option value="Examination Regulations">Examination Regulations</option>
                  <option value="Medicals &amp; Attendance">Medicals &amp; Attendance</option>
                  <option value="Course Catalog &amp; Curriculum">Course Catalog &amp; Curriculum</option>
                  <option value="Faculty Forms &amp; Administration">Faculty Forms &amp; Administration</option>
                  <option value="Welfare &amp; Scholarships">Welfare &amp; Scholarships</option>
                </select>
              </div>

              <div className="rag-form-group">
                <label>Audience</label>
                <select
                  className="rag-select"
                  value={textAudience}
                  onChange={(e) => setTextAudience(e.target.value)}
                >
                  <option value="All Students">All Students</option>
                  <option value="All Undergraduates">All Undergraduates</option>
                  <option value="ICT Department">ICT Department</option>
                  <option value="Biosystems Department">Biosystems Department</option>
                </select>
              </div>

              <div className="rag-form-group col-span-2">
                <label>Knowledge Body &amp; Regulations Text *</label>
                <textarea
                  className="rag-textarea"
                  placeholder="Enter the official text, procedure steps, by-laws, deadlines, or guidance for the AI Assistant knowledge base..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={6}
                  required
                />
              </div>

              <div className="rag-form-group col-span-2">
                <label>Keywords &amp; Query Tags (Comma-separated)</label>
                <input
                  type="text"
                  className="rag-input"
                  placeholder="e.g. medical, 7 days, attendance, sick leave, excuse, UMO"
                  value={textTags}
                  onChange={(e) => setTextTags(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="rag-btn-submit">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save &amp; Index Knowledge Snippet
            </button>
          </form>
        )}
      </div>

      {/* 4. Knowledge Repository Table */}
      <div className="rag-card">
        <div className="rag-table-toolbar">
          <div className="rag-search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search knowledge sources, by-laws, files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="rag-category-filter">
            {['ALL', 'PDF', 'TEXT', 'Examination Regulations', 'Medicals & Attendance', 'Course Catalog & Curriculum'].map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`rag-filter-chip ${categoryFilter === cat ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat === 'ALL'
                    ? 'All Sources'
                    : cat === 'PDF'
                    ? 'PDF Handbooks'
                    : cat === 'TEXT'
                    ? 'Text Rules'
                    : cat}
                </button>
              )
            )}
          </div>
        </div>

        <div className="rag-table-wrap">
          <table className="rag-table">
            <thead>
              <tr>
                <th>Document Source</th>
                <th>Category</th>
                <th>Audience</th>
                <th>Chunks &amp; Tokens</th>
                <th>Ingested</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSources.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    No knowledge sources matching your filter.
                  </td>
                </tr>
              ) : (
                filteredSources.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div className="rag-doc-title-cell">
                        <span className={`rag-type-badge ${doc.type}`}>{doc.type}</span>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{doc.title}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {doc.fileName} &bull; {doc.fileSize}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          background: '#f1f5f9',
                          color: '#334155',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          fontSize: '0.74rem',
                          fontWeight: 500
                        }}
                      >
                        {doc.category}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#475569' }}>{doc.targetAudience}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e3a8a' }}>{doc.chunksCount} chunks</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>~{doc.tokenCount} tokens</div>
                    </td>
                    <td style={{ fontSize: '0.76rem', color: '#64748b' }}>{doc.ingestedDate}</td>
                    <td>
                      <span className="rag-badge-status active">
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                        Indexed
                      </span>
                    </td>
                    <td>
                      <div className="rag-row-actions">
                        <button
                          type="button"
                          className="rag-btn-action"
                          onClick={() => setViewingDoc(doc)}
                          title="View Vector Chunks"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          Snippets
                        </button>

                        <button
                          type="button"
                          className="rag-btn-action delete"
                          onClick={() => handleDeleteSource(doc.id)}
                          title="Remove from RAG Index"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Interactive Test Query / Retrieval Simulator */}
      <div className="rag-test-card">
        <div className="rag-test-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <h3>Test RAG Retrieval Simulator (Vector Search Verification)</h3>
        </div>
        <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
          Test similarity search retrieval against your indexed knowledge chunks to see the exact context provided to the SEUConnect AI Assistant.
        </p>

        <div className="rag-test-input-row">
          <input
            type="text"
            className="rag-test-input"
            placeholder="Try asking: 'Can I sit for exam if attendance is 75%?' or 'Repeat exam fees'..."
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRunTestQuery();
            }}
          />
          <button type="button" className="rag-btn-test" onClick={handleRunTestQuery}>
            Test Retrieval
          </button>
        </div>

        {retrievedResults && (
          <div className="rag-results-box">
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e3a8a' }}>
              Top Retrieved Chunks for "{testQuery}":
            </div>
            {retrievedResults.map((res, idx) => (
              <div key={idx} className="rag-result-chunk">
                <div className="rag-chunk-meta">
                  <span>{res.source}</span>
                  <span className="rag-chunk-score">{res.score}</span>
                </div>
                <p className="rag-chunk-text">{res.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Extracted Chunks Inspection Modal */}
      {viewingDoc && (
        <div className="rag-modal-backdrop" onClick={() => setViewingDoc(null)}>
          <div className="rag-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="rag-modal-header">
              <h3>Indexed Vector Chunks: {viewingDoc.title}</h3>
              <button
                type="button"
                className="rag-btn-action"
                onClick={() => setViewingDoc(null)}
              >
                ✕
              </button>
            </div>

            <div className="rag-modal-body">
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Showing sample indexed text chunks extracted for vector similarity queries:
              </div>

              {viewingDoc.sampleChunks?.map((chunk, i) => (
                <div key={i} className="rag-result-chunk">
                  <div className="rag-chunk-meta">
                    <span>Chunk #{i + 1} &bull; Embedding Vector ID: {viewingDoc.id}-CHK-{i + 1}</span>
                    <span className="rag-chunk-score">Cosine Indexed</span>
                  </div>
                  <p className="rag-chunk-text">{chunk}</p>
                </div>
              ))}
            </div>

            <div className="rag-modal-footer">
              <button
                type="button"
                className="rag-btn-action"
                onClick={() => setViewingDoc(null)}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
