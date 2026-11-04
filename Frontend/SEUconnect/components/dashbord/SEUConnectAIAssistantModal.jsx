import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './seu_ai_assistant.css';

/**
 * SEUConnect AI Assistant - macOS Floating Window Modal
 * 
 * Features:
 * - Rendered through React Portal directly into document.body
 * - Full-screen background blur (backdrop-filter: blur(18px))
 * - Authentic macOS window frame with traffic lights (🔴 Close, 🟡 Clear/Minimize, 🟢 Fullscreen Toggle)
 * - macOS folder opening and cancel zoom/shrink animation with spring easing
 * - Role-tailored institutional intelligence calibrated with South Eastern University of Sri Lanka regulations
 * - Interactive suggestion chips and direct navigation links into portal sections
 */

const KNOWLEDGE_RESPONSES = [
  {
    keywords: ['medical', 'sick', 'doctor', 'hospital', 'clinic', 'excuse', 'absence', 'health'],
    title: 'Medical Submission & Concessions Guideline',
    summary: 'Under SEUSL Faculty of Technology Examination By-Laws (Section 7.4):',
    points: [
      '**Strict 7-Day Deadline**: Official medical certificates must be submitted within 7 calendar days of the absence date.',
      '**CMO / UMO Endorsement**: Private medical certificates must be validated and endorsed by the Chief Medical Officer (CMO) at the University Health Centre, Oluvil Campus.',
      '**ESA Concession**: Approved medical excuses restore attendance eligibility back to active standing for Continuous Assessment (CA) and End Semester Assessment (ESA).'
    ],
    actions: [
      { label: 'Submit Medical Form Online', tab: 'medical_requests' },
      { label: 'Download Medical Submission PDF', tab: 'forms_medical' }
    ]
  },
  {
    keywords: ['repeat', 'ca repeat', 'exam repeat', 'resit', 'failed', 'esa repeat', 'rescrutiny'],
    title: 'Examination Repeat & Continuous Assessment (CA) Rules',
    summary: 'SEUSL Technology Faculty repeat candidate regulations:',
    points: [
      '**Remittance Fee**: LKR 400/= per course unit for both Continuous Assessment (CA) repeat and End Semester Assessment (ESA) repeat.',
      '**Bank Account**: Remit fee to South Eastern University of Sri Lanka, People\'s Bank Addalaichenai Branch, Account No: **228 1001 9000 1704**.',
      '**Mandatory PIV Voucher**: Retain the original bank-stamped Pay-In-Voucher (PIV) and attach it to your repeat registration form.',
      '**Grade Ceiling**: Maximum attainable grade for a repeat attempt is capped at Grade "C" (2.00 GP).'
    ],
    actions: [
      { label: 'Open Exam Registrations', tab: 'examinations' },
      { label: 'Download PIV Bank Voucher', tab: 'forms_piv' },
      { label: 'Repeat Examination Form', tab: 'forms_exam' }
    ]
  },
  {
    keywords: ['attendance', '80%', 'percentage', 'absent', 'eligibility', 'debarred', 'standing'],
    title: 'Attendance Regulations & 80% ESA Eligibility',
    summary: 'Attendance criteria enforced by the Faculty Board:',
    points: [
      '**80% Minimum Threshold**: Students must maintain at least 80% cumulative attendance in lectures and practical sessions separately.',
      '**Debarring Clause**: Candidates with attendance under 80% without an approved CMO medical waiver are barred from sitting the ESA examination.',
      '**Warning Level**: Students with 75% - 79% attendance receive a yellow provisional standing requiring immediate remediation.'
    ],
    actions: [
      { label: 'Inspect My Attendance Grid', tab: 'attendance' },
      { label: 'Submit Absence Medical', tab: 'medical_requests' }
    ]
  },
  {
    keywords: ['gpa', 'cgpa', 'sgpa', 'grade', 'first class', 'second class', 'calculation', 'formula'],
    title: 'SGPA & Cumulative CGPA Classification System',
    summary: 'Weighted GPA calculation according to SEUSL By-law standards:',
    points: [
      '**SGPA Formula**: Sum of (Credit Value × Grade Point) divided by Total Semester Registered Credits.',
      '**First Class Honours**: Cumulative CGPA of **3.70 or above** with no repeating units.',
      '**Second Class (Upper Division)**: Cumulative CGPA of **3.30 to 3.69**.',
      '**Second Class (Lower Division)**: Cumulative CGPA of **3.00 to 3.29**.',
      '**General Degree Pass**: Cumulative CGPA of **2.00 to 2.99** with minimum graduation credits cleared.'
    ],
    actions: [
      { label: 'Check GPA / CGPA Analytics', tab: 'gpa_cgpa' },
      { label: 'View Academic Progress', tab: 'academic_progress' }
    ]
  },
  {
    keywords: ['form', 'forms', 'piv', 'voucher', 'download', 'pdf', 'blank form', 'template'],
    title: 'Faculty Forms & Official Templates Catalog',
    summary: 'Available printable and digital submission forms:',
    points: [
      '**SEU-PIV-VOUCHER**: People\'s Bank 3-way Pay In Voucher for exam and institutional fees.',
      '**SEU-FORM-EX-01**: Application for End Semester Examination entry and repeat candidacy.',
      '**SEU-FORM-MED-03**: Official Medical Excuse form for lecture and exam concession.',
      '**SEU-FORM-RESCRUTINY**: Application for re-scrutinization of marks & final grades.'
    ],
    actions: [
      { label: 'Browse All Faculty Forms', tab: 'forms_all' },
      { label: 'Open PIV Voucher Template', tab: 'forms_piv' }
    ]
  },
  {
    keywords: ['officer', 'dean', 'hod', 'sar', 'cmo', 'contact', 'email', 'phone', 'staff'],
    title: 'Key Faculty Officials & Administrative Contacts',
    summary: 'Faculty of Technology leadership contacts:',
    points: [
      '**Dean of Faculty**: Prof. Rifai Kariapper (Dean\'s Office, Oluvil Campus)',
      '**Head of Dept (ICT)**: Mr. M.J. Ahamed Sabani (Department of ICT)',
      '**Senior Assistant Registrar (SAR)**: Mr. K.L.M. Riyas (Administrative Division)',
      '**Chief Medical Officer (CMO)**: University Health Centre, SEUSL Oluvil (Daily 08:30 AM - 04:30 PM)'
    ],
    actions: [
      { label: 'Institutional Guidance', tab: 'process_guidance' }
    ]
  }
];

export default function SEUConnectAIAssistantModal({
  user,
  onClose,
  onNavigate
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${user?.name || 'Student'}! 👋\n\nI am the **SEUConnect Institutional AI Assistant**, calibrated with the official academic handbooks, examination by-laws, and administrative procedures of the **South Eastern University of Sri Lanka (Faculty of Technology)**.\n\nHow can I help you today? You can choose a quick question below or ask me anything directly.`,
      timestamp: 'Just now',
      actions: null
    }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  // Handle ESC key to trigger macOS smooth close animation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleTriggerClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Graceful macOS close animation (250ms duration)
  const handleTriggerClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      if (typeof onClose === 'function') {
        onClose();
      }
    }, 250);
  };

  // Reset conversation to initial welcome
  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: `Conversation cleared. 🧹\n\nHow else can I assist you with **SEUSL Faculty of Technology** academic regulations, repeat forms, medical submissions, or portal services?`,
        timestamp: 'Just now',
        actions: null
      }
    ]);
  };

  // Match response from institutional knowledge base
  const generateResponse = (query) => {
    const lower = query.toLowerCase();

    for (const item of KNOWLEDGE_RESPONSES) {
      const match = item.keywords.some((kw) => lower.includes(kw));
      if (match) {
        let text = `### ${item.title}\n${item.summary}\n\n`;
        text += item.points.map((p) => `• ${p}`).join('\n\n');
        return {
          text,
          actions: item.actions || null
        };
      }
    }

    // Default institutional intelligence fallback
    return {
      text: `Thank you for your inquiry regarding **"${query}"**.\n\nAccording to **SEUSL Technology Faculty Academic Regulations**:\n\n• For continuous assessment or lecture concerns, consult your module coordinator or Department Head (**Mr. M.J. Ahamed Sabani**).\n• For official requests (Leave, Medicals, Repeat Exams, PIV vouchers), please use the digital forms in the portal under **Faculty Forms** or navigate through **Process Guidance**.\n• Official submissions must carry your University Registration Number (**${user?.regNo || '22ICT085'}**).\n\nWould you like me to guide you to any specific portal section?`,
      actions: [
        { label: 'View Process Guidance', tab: 'process_guidance' },
        { label: 'Browse Faculty Forms', tab: 'forms_all' }
      ]
    };
  };

  // Send message
  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Realistic assistant response delay
    setTimeout(() => {
      const aiReply = generateResponse(text);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: aiReply.text,
          actions: aiReply.actions,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 600);
  };

  const handleChipClick = (promptText) => {
    handleSendMessage(promptText);
  };

  const handleActionNavigate = (tabId) => {
    handleTriggerClose();
    if (typeof onNavigate === 'function') {
      onNavigate(tabId);
    }
  };

  const handleCopyText = (content) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(content);
    }
  };

  const modalElement = (
    <div
      className={`seu-ai-backdrop ${isClosing ? 'closing' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleTriggerClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="SEUConnect AI Assistant"
    >
      <div className={`seu-ai-window ${isClosing ? 'closing' : ''} ${isMaximized ? 'maximized' : ''}`}>
        
        {/* ==================================================================
            1. macOS TITLEBAR WITH TRAFFIC LIGHTS
            ================================================================== */}
        <div className="seu-ai-titlebar">
          {/* macOS Traffic Light Buttons */}
          <div className="seu-ai-traffic-lights">
            <button
              type="button"
              className="seu-ai-traffic-dot close"
              onClick={handleTriggerClose}
              title="Close Assistant (Esc)"
              aria-label="Close"
            >
              <svg width="6" height="6" viewBox="0 0 10 10" fill="none" stroke="#4c0000" strokeWidth="1.8" strokeLinecap="round">
                <line x1="1" y1="1" x2="9" y2="9" />
                <line x1="9" y1="1" x2="1" y2="9" />
              </svg>
            </button>

            <button
              type="button"
              className="seu-ai-traffic-dot minimize"
              onClick={handleResetChat}
              title="Clear Conversation / Reset"
              aria-label="Reset Chat"
            >
              <svg width="6" height="6" viewBox="0 0 10 10" fill="none" stroke="#7a5200" strokeWidth="1.8" strokeLinecap="round">
                <line x1="1" y1="5" x2="9" y2="5" />
              </svg>
            </button>

            <button
              type="button"
              className="seu-ai-traffic-dot maximize"
              onClick={() => setIsMaximized((prev) => !prev)}
              title={isMaximized ? "Restore window size" : "Expand to fullscreen"}
              aria-label="Maximize"
            >
              <svg width="6" height="6" viewBox="0 0 10 10" fill="none" stroke="#004c00" strokeWidth="1.8" strokeLinecap="round">
                <line x1="1" y1="5" x2="9" y2="5" />
                <line x1="5" y1="1" x2="5" y2="9" />
              </svg>
            </button>
          </div>

          {/* Center Brand Title */}
          <div className="seu-ai-title-wrap">
            <div className="seu-ai-title-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4" />
                <rect x="4" y="6" width="16" height="13" rx="3" />
                <circle cx="9" cy="12" r="1.5" fill="currentColor" />
                <circle cx="15" cy="12" r="1.5" fill="currentColor" />
                <path d="M9 16h6" />
              </svg>
            </div>
            <span className="seu-ai-title-text">SEUConnect AI Assistant</span>
            <span className="seu-ai-badge-status">
              <span className="seu-ai-pulse-dot" />
              Academic v2.6 Online
            </span>
          </div>

          {/* Right Tools */}
          <div className="seu-ai-titlebar-tools">
            <button
              type="button"
              className="seu-ai-tool-btn"
              onClick={handleResetChat}
              title="Clear Chat"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Clear
            </button>
          </div>
        </div>

        {/* ==================================================================
            2. CHAT BODY & MESSAGE FEED
            ================================================================== */}
        <div className="seu-ai-body">
          <div className="seu-ai-messages-scroll">
            
            {/* Initial Welcome Hero Card */}
            <div className="seu-ai-welcome-card">
              <div className="seu-ai-welcome-header">
                <div className="seu-ai-avatar-large">
                  <img
                    src="/seusl_logo.png"
                    alt="SEUSL Emblem"
                    style={{ width: '32px', height: '32px', maxWidth: '32px', maxHeight: '32px', objectFit: 'contain', display: 'block' }}
                  />
                </div>
                <div className="seu-ai-welcome-titles">
                  <h3>South Eastern University of Sri Lanka</h3>
                  <p>Faculty of Technology • Institutional Academic Intelligence Chatbot</p>
                </div>
              </div>

              <div className="seu-ai-suggestions-title">Quick Topics & Regulations</div>
              <div className="seu-ai-chips-grid">
                <button
                  type="button"
                  className="seu-ai-chip-btn"
                  onClick={() => handleChipClick('What are the rules for submitting a medical excuse?')}
                >
                  📋 Medical Excuse 7-Day Rule
                </button>

                <button
                  type="button"
                  className="seu-ai-chip-btn"
                  onClick={() => handleChipClick('How do I apply for a repeat exam or CA repeat?')}
                >
                  🎓 Repeat Exam & CA Guidelines
                </button>

                <button
                  type="button"
                  className="seu-ai-chip-btn"
                  onClick={() => handleChipClick('What are the bank account details for People\'s Bank PIV?')}
                >
                  💳 People's Bank PIV Remittance
                </button>

                <button
                  type="button"
                  className="seu-ai-chip-btn"
                  onClick={() => handleChipClick('How is SGPA and CGPA calculated for BICT/BST?')}
                >
                  📊 GPA & Degree Honours Formula
                </button>

                <button
                  type="button"
                  className="seu-ai-chip-btn"
                  onClick={() => handleChipClick('What is the attendance percentage required for ESA?')}
                >
                  ⚖️ 80% Attendance Threshold
                </button>

                <button
                  type="button"
                  className="seu-ai-chip-btn"
                  onClick={() => handleChipClick('Where can I download official faculty forms?')}
                >
                  📑 Official Faculty Forms Catalog
                </button>
              </div>
            </div>

            {/* Render Chat Messages */}
            {messages.map((msg) => (
              <div key={msg.id} className={`seu-ai-message-row ${msg.sender}`}>
                {msg.sender === 'assistant' && (
                  <div className="seu-ai-msg-avatar ai">
                    <img
                      src="/seusl_logo.png"
                      alt="AI"
                      style={{ width: '22px', height: '22px', maxWidth: '22px', maxHeight: '22px', objectFit: 'contain', display: 'block' }}
                    />
                  </div>
                )}

                <div className="seu-ai-msg-bubble">
                  <div className="seu-ai-msg-content">
                    {msg.text.split('\n').map((line, idx) => {
                      if (line.startsWith('### ')) {
                        return <h4 key={idx} style={{ margin: '0 0 0.4rem', color: 'inherit', fontWeight: 700 }}>{line.replace('### ', '')}</h4>;
                      }
                      if (line.startsWith('• ')) {
                        const raw = line.replace('• ', '');
                        const parts = raw.split(/(\*\*.*?\*\*)/g);
                        return (
                          <div key={idx} style={{ display: 'flex', gap: '0.45rem', marginBottom: '0.35rem' }}>
                            <span>•</span>
                            <div>
                              {parts.map((p, pIdx) => {
                                if (p.startsWith('**') && p.endsWith('**')) {
                                  return <strong key={pIdx}>{p.slice(2, -2)}</strong>;
                                }
                                return p;
                              })}
                            </div>
                          </div>
                        );
                      }
                      const parts = line.split(/(\*\*.*?\*\*)/g);
                      return (
                        <p key={idx} style={{ margin: '0 0 0.45rem' }}>
                          {parts.map((p, pIdx) => {
                            if (p.startsWith('**') && p.endsWith('**')) {
                              return <strong key={pIdx}>{p.slice(2, -2)}</strong>;
                            }
                            return p;
                          })}
                        </p>
                      );
                    })}
                  </div>

                  {/* Contextual Nav Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="seu-ai-msg-actions">
                      {msg.actions.map((act, actIdx) => (
                        <button
                          key={actIdx}
                          type="button"
                          className="seu-ai-link-btn"
                          onClick={() => handleActionNavigate(act.tab)}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="seu-ai-msg-meta">
                    <span>{msg.timestamp}</span>
                    <button
                      type="button"
                      className="seu-ai-copy-btn"
                      onClick={() => handleCopyText(msg.text)}
                      title="Copy response"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="seu-ai-msg-avatar user-av">
                    {user?.avatarInitial || 'ME'}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="seu-ai-message-row assistant">
                <div className="seu-ai-msg-avatar ai">
                  <img
                    src="/seusl_logo.png"
                    alt="AI"
                    style={{ width: '22px', height: '22px', maxWidth: '22px', maxHeight: '22px', objectFit: 'contain', display: 'block' }}
                  />
                </div>
                <div className="seu-ai-msg-bubble">
                  <div className="seu-ai-typing-indicator">
                    <span className="seu-ai-typing-dot" />
                    <span className="seu-ai-typing-dot" />
                    <span className="seu-ai-typing-dot" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ================================================================
              3. BOTTOM INPUT DOCK
              ================================================================ */}
          <div className="seu-ai-footer">
            <form
              className="seu-ai-input-wrapper"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <input
                ref={inputRef}
                type="text"
                className="seu-ai-input-field"
                placeholder="Ask about exam repeat, medical 7-day rule, GPA, PIV voucher..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />

              {inputText.trim() && (
                <button
                  type="button"
                  className="seu-ai-action-btn-sm"
                  onClick={() => setInputText('')}
                  title="Clear input"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}

              <button
                type="submit"
                className="seu-ai-send-btn"
                disabled={!inputText.trim() || isTyping}
                title="Send message (Enter)"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>

            <div className="seu-ai-disclaimer">
              <div className="seu-ai-disclaimer-left">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>Calibrated with SEUSL Faculty of Technology Examination By-Laws</span>
              </div>
              <div>
                Press <span className="seu-ai-esc-hint">Esc</span> to close
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  if (!isMounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(modalElement, document.body);
}
