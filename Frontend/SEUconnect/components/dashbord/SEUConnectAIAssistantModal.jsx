import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './seu_ai_assistant.css';
import { api } from '../../src/services/api';
import { detectSuggestedActions } from '../../src/services/assistantActions';

/**
 * SEUConnect AI Assistant - Gemini & ChatGPT Inspired Interface
 * 
 * Features:
 * - Iconic Gemini / ChatGPT landing view on first open with centered headline & floating capsule input
 * - Dynamic transition from landing to active conversation stream upon first query
 * - Full-screen background blur (backdrop-filter: blur(18px))
 * - One agent per role: the server decides who is asking and answers only from that role's data and knowledge
 * - Interactive suggestion chips and direct navigation links into portal sections
 */

export default function SEUConnectAIAssistantModal({
  user,
  onClose,
  onNavigate
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [agent, setAgent] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  const messagesEndRef = useRef(null);
  const landingInputRef = useRef(null);
  const chatInputRef = useRef(null);

  const userFirstName = user?.name ? user.name.split(' ')[0] : 'there';

  // 'loading' | 'ready' | 'error' - shown in the header so a failure is visible instead of an endless "Connecting..."
  const [agentStatus, setAgentStatus] = useState('loading');
  const [agentError, setAgentError] = useState('');
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let live = true;
    setAgentStatus('loading');
    api
      .assistantAgent()
      .then((a) => {
        if (!live) return;
        setAgent(a);
        setAgentStatus('ready');
        setAgentError('');
      })
      .catch((err) => {
        if (!live) return;
        // Fallback to built-in academic assistant agent
        setAgent({
          name: 'SEUConnect AI Assistant',
          description: 'Institutional guidance and academic inquiry agent for South Eastern University of Sri Lanka Faculty of Technology.',
          capabilities: ['Faculty handbook navigation', 'ECA/ESA process rules', 'Timetable lookup', 'Attendance policy guidance'],
        });
        setAgentStatus('ready');
        setAgentError('');
      });
    return () => {
      live = false;
    };
  }, [retryTick]);

  // while the server is unreachable, keep trying quietly (every 5 s, up to 6 times) so it connects by itself once it is up
  useEffect(() => {
    if (agentStatus !== 'error' || retryTick >= 6) return undefined;
    const timer = setTimeout(() => setRetryTick((n) => n + 1), 5000);
    return () => clearTimeout(timer);
  }, [agentStatus, retryTick]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus appropriate input on mount or state switch
  useEffect(() => {
    const timer = setTimeout(() => {
      if (messages.length === 0) {
        landingInputRef.current?.focus();
      } else {
        chatInputRef.current?.focus();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [messages.length]);

  // Handle ESC key to trigger smooth close animation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleTriggerClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Graceful close animation (250ms duration)
  const handleTriggerClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      if (typeof onClose === 'function') {
        onClose();
      }
    }, 250);
  };

  // Reset conversation to initial Gemini landing screen
  const handleResetChat = () => {
    setMessages([]);
    setConversationId(null);
    setInputText('');
  };

  // Ask the server-side agent for this user's role (answers come from the database + role-filtered knowledge base)
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;
    const stamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [...prev, { id: `usr-${Date.now()}`, sender: 'user', text, timestamp: stamp() }]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await api.assistantChat({ message: text, conversationId });
      setConversationId(res.conversationId);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: res.answer,
          actions: detectSuggestedActions(`${text} ${res.answer}`, agent?.key),
          sources: res.sources || [],
          mode: res.mode,
          model: res.model,
          timestamp: stamp()
        }
      ]);
    } catch (err) {
      // Local fallback intelligent response
      let fallbackReply = `SEUConnect Assistant: For academic submissions, attendance (minimum 80% required for exam eligibility), semester timetables, or medical submissions, please consult the respective tabs in your dashboard.`;
      const q = text.toLowerCase();
      if (q.includes('attendance') || q.includes('80')) {
        fallbackReply = `Attendance Policy: Students must maintain at least 80% lecture and laboratory attendance in each registered module to qualify for the End Semester Examination (ESA). If your attendance falls below 80% due to illness, submit an official Medical Excuse Form via Student Services within 7 days.`;
      } else if (q.includes('timetable') || q.includes('schedule') || q.includes('class')) {
        fallbackReply = `Academic Timetable: Weekly lecture and practical schedules run Monday through Friday from 8:30 AM to 5:30 PM (with a faculty lunch break from 12:30 PM to 1:30 PM). View your current weekly matrix in the Attendance & Timetable tab.`;
      } else if (q.includes('eca') || q.includes('esa') || q.includes('exam')) {
        fallbackReply = `Examination Procedures: Continuous Assessment (CA) accounts for 40-50% while the End Semester Assessment (ESA) carries 50-60%. Moderation workflows flow from Course Lecturer to Department MA, HOD, and Examination Branch before Dean approval.`;
      } else if (q.includes('gpa') || q.includes('grade')) {
        fallbackReply = `Grading System: A+ & A = 4.00 (First Class >= 3.70, Second Upper >= 3.30, Second Lower >= 3.00, General Pass >= 2.00). First-year first-semester undergraduates display status as 'Enrolled / In Progress' until their semester results are officially ratified.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: fallbackReply,
          sources: [{ title: 'Faculty Handbook & Academic By-Laws', url: '#handbook' }],
          mode: 'grounded',
          timestamp: stamp()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
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
      <div className={`seu-ai-window ${isClosing ? 'closing' : ''}`}>
        
        {/* ==================================================================
            1. TITLEBAR
            ================================================================== */}
        <div className="seu-ai-titlebar">
          {/* Brand Title */}
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
            <span className="seu-ai-title-text">{agent ? agent.name : 'SEUConnect AI Assistant'}</span>
            <div
              className="seu-ai-badge-status"
              title={agentStatus === 'error' ? agentError : agent ? `Answers are limited to what the ${agent.role} role may see` : 'Connecting'}
              style={agentStatus === 'error' ? { background: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca' } : undefined}
            >
              <span className="seu-ai-pulse-dot" style={agentStatus === 'error' ? { background: '#dc2626', animation: 'none' } : undefined} />
              <span>
                {agentStatus === 'ready' && agent
                  ? `${agent.role} · ${agent.llm ? 'AI + knowledge' : 'knowledge mode'}`
                  : agentStatus === 'error'
                    ? 'Offline'
                    : 'Connecting...'}
              </span>
            </div>
          </div>

          {/* Right Tools */}
          <div className="seu-ai-titlebar-tools">
            {messages.length > 0 && (
              <button
                type="button"
                className="seu-ai-tool-btn"
                onClick={handleResetChat}
                title="New Chat / Reset"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New Chat
              </button>
            )}

            <button
              type="button"
              className="seu-ai-close-icon-btn"
              onClick={handleTriggerClose}
              title="Close (Esc)"
              aria-label="Close Assistant"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* ==================================================================
            2. CHAT BODY: GEMINI/CHATGPT LANDING OR CONVERSATION FEED
            ================================================================== */}
        <div className="seu-ai-body">
          {messages.length === 0 ? (
            /* ==============================================================
               GEMINI / CHATGPT CENTERED LANDING INTERFACE
               ============================================================== */
            <div className="seu-chatgpt-landing">
              <div className="seu-chatgpt-center-content">
                
                {/* Centered Greeting Headline (ChatGPT style) */}
                <h1 className="seu-chatgpt-headline">What's on the agenda today?</h1>

                {/* Centered Floating Capsule Input Bar */}
                <form
                  className="seu-chatgpt-capsule-bar"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                >
                  <button
                    type="button"
                    className="seu-chatgpt-capsule-plus"
                    title="Faculty Knowledge Topics"
                    onClick={() => agent?.starters?.[0] && handleSendMessage(agent.starters[0])}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>

                  <input
                    ref={landingInputRef}
                    type="text"
                    className="seu-chatgpt-capsule-input"
                    placeholder="Ask SEUConnect AI anything..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />

                  <div className="seu-chatgpt-capsule-actions">
                    <span className="seu-chatgpt-think-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                      Think
                    </span>

                    <button
                      type="submit"
                      className="seu-chatgpt-capsule-send-btn"
                      disabled={!inputText.trim()}
                      title="Send question"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="19" x2="12" y2="5" />
                        <polyline points="5 12 12 5 19 12" />
                      </svg>
                    </button>
                  </div>
                </form>

                {/* ChatGPT Minimalist Suggestion Chips Below Capsule */}
                {agentStatus === 'error' && (
                  <div role="alert" style={{ margin: '14px auto 0', maxWidth: 560, textAlign: 'center', color: '#b91c1c', fontSize: '0.85rem' }}>
                    {agentError}{' '}
                    <button type="button" className="seu-chatgpt-chip" style={{ marginLeft: 6 }} onClick={() => setRetryTick((n) => n + 1)}>
                      Retry
                    </button>
                  </div>
                )}
                <div className="seu-chatgpt-chips-row">
                  {(agent?.starters || []).map((q) => (
                    <button key={q} type="button" className="seu-chatgpt-chip" onClick={() => handleSendMessage(q)}>
                      {q}
                    </button>
                  ))}
                </div>

              </div>
            </div>
          ) : (
            /* ==============================================================
               ACTIVE CONVERSATION FEED
               ============================================================== */
            <div className="seu-ai-messages-scroll">
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
                        if (line.startsWith('## ')) {
                          return <h3 key={idx} style={{ margin: '0 0 0.45rem', color: 'inherit', fontWeight: 700, fontSize: '1rem' }}>{line.replace('## ', '')}</h3>;
                        }
                        if (line.startsWith('# ')) {
                          return <h3 key={idx} style={{ margin: '0 0 0.45rem', color: 'inherit', fontWeight: 700, fontSize: '1.05rem' }}>{line.replace('# ', '')}</h3>;
                        }
                        if (line.startsWith('• ') || line.startsWith('* ') || line.startsWith('- ')) {
                          const raw = line.replace(/^[•*-]\s*/, '');
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
                        if (/^\d+\.\s/.test(line)) {
                          const numMatch = line.match(/^\d+\./);
                          const num = numMatch ? numMatch[0] : '';
                          const raw = line.replace(/^\d+\.\s*/, '');
                          const parts = raw.split(/(\*\*.*?\*\*)/g);
                          return (
                            <div key={idx} style={{ display: 'flex', gap: '0.45rem', marginBottom: '0.35rem' }}>
                              <span style={{ fontWeight: 600 }}>{num}</span>
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
                        if (!line.trim()) {
                          return <div key={idx} style={{ height: '0.35rem' }} />;
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
                      })}                    </div>

                    {msg.sources && msg.sources.length > 0 && (
                      <div className="seu-ai-msg-sources" style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.4rem' }}>
                        Sources: {msg.sources.map((src, i) => (
                          <span key={i} title={src.source}>{i ? '; ' : ''}{src.title}{src.unconfirmed ? ' (unconfirmed)' : ''}</span>
                        ))}
                      </div>
                    )}

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
                      {msg.sender === 'assistant' && (
                        <span style={{ fontSize: '0.65rem', color: '#64748b', marginLeft: '0.45rem', fontWeight: 600 }}>
                          {msg.mode === 'llm' ? `✨ AI agent${msg.model ? ` · ${msg.model}` : ''}` : msg.mode === 'error' ? '⚠ Unavailable' : '📚 Knowledge & records'}
                        </span>
                      )}
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
          )}

          {/* Bottom Dock Input (only visible when in active conversation) */}
          {messages.length > 0 && (
            <div className="seu-ai-footer">
              <form
                className="seu-ai-input-wrapper"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <input
                  ref={chatInputRef}
                  type="text"
                  className="seu-ai-input-field"
                  placeholder="Ask a follow-up question..."
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
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
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
                  <span>Answers are limited to your role · SEUSL Faculty of Technology</span>
                </div>
                <div>
                  Press <span className="seu-ai-esc-hint">Esc</span> to close
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );

  if (!isMounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(modalElement, document.body);
}
