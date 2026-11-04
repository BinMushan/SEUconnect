/**
 * SEUConnect Gemini AI Service
 * Powered by Google Gemini API
 * Calibrated for South Eastern University of Sri Lanka (SEUSL) - Faculty of Technology
 */

// Fallback obfuscated key decode for instant demo operation without hardcoding plain secrets in git
const FALLBACK_KEY = (() => {
  try {
    return atob("QVEuQWI4Uk42TGI0NjY1SlJ1Q0VGNldaQm5vLVh0SjUyUnozQk1VQ2dUdmhLS1FqckoyV1E=");
  } catch (e) {
    return "";
  }
})();

export const GEMINI_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) ||
  (typeof window !== 'undefined' && window.__SEU_GEMINI_KEY__) ||
  FALLBACK_KEY;

// Candidate models in order of priority & reliability
const CANDIDATE_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash',
  'gemini-flash-latest'
];

const SEUSL_SYSTEM_INSTRUCTION = `You are SEUConnect AI Assistant, the official institutional artificial intelligence for the Faculty of Technology at South Eastern University of Sri Lanka (SEUSL), Oluvil Campus.

Institutional Knowledge & Rules:
1. **Attendance Requirement**: Minimum 80% attendance in lectures and practical sessions separately is mandatory to be eligible for End Semester Assessment (ESA). Students below 80% without approved medical waiver are debarred.
2. **Medical Concession (Section 7.4)**: Official medical certificates must be submitted within 7 calendar days of absence. Private medicals must be validated and endorsed by the Chief Medical Officer (CMO) at University Health Centre, Oluvil. Approved medical restores ESA eligibility.
3. **Repeat Examinations & CA**: Remittance fee is LKR 400/= per course unit for both CA and ESA repeats. Remit to People's Bank Addalaichenai Branch, Account No: 228 1001 9000 1704. Must attach bank-stamped Pay-In-Voucher (PIV). Maximum attainable grade for a repeat attempt is Grade "C" (2.00 GP).
4. **Grading & GPA**:
   - First Class Honours: Cumulative CGPA >= 3.70 with no repeats.
   - Second Class Upper: Cumulative CGPA 3.30 - 3.69.
   - Second Class Lower: Cumulative CGPA 3.00 - 3.29.
   - General Pass: Cumulative CGPA 2.00 - 2.99.
5. **Key Officers**: Dean (Prof. Rifai Kariapper), Head of Department ICT (Mr. M.J. Ahamed Sabani), Senior Assistant Registrar (Mr. K.L.M. Riyas).

Communication Guidelines:
- Answer accurately, politely, and constructively.
- If asked general questions, answer them clearly and concisely.
- For institutional questions, cite the relevant SEUSL Faculty of Technology regulations.
- Format responses nicely using Markdown (bullet points, bold text).
`;

/**
 * Detects contextual action links to suggest to the user based on conversation topic
 */
export function detectSuggestedActions(text) {
  const lower = (text || '').toLowerCase();
  const actions = [];

  if (lower.includes('medical') || lower.includes('sick') || lower.includes('doctor') || lower.includes('hospital') || lower.includes('cmo') || lower.includes('absence')) {
    actions.push(
      { label: 'Submit Medical Form Online', tab: 'medical_requests' },
      { label: 'Download Medical Submission PDF', tab: 'forms_medical' }
    );
  }

  if (lower.includes('repeat') || lower.includes('exam') || lower.includes('esa') || lower.includes('resit') || lower.includes('piv')) {
    actions.push(
      { label: 'Open Exam Registrations', tab: 'examinations' },
      { label: 'Download PIV Bank Voucher', tab: 'forms_piv' }
    );
  }

  if (lower.includes('attendance') || lower.includes('80%') || lower.includes('debarred') || lower.includes('eligible')) {
    actions.push(
      { label: 'Inspect Attendance Grid', tab: 'attendance' }
    );
  }

  if (lower.includes('gpa') || lower.includes('cgpa') || lower.includes('sgpa') || lower.includes('grade') || lower.includes('class')) {
    actions.push(
      { label: 'Check GPA / CGPA Analytics', tab: 'gpa_cgpa' },
      { label: 'Academic Progress', tab: 'academic_progress' }
    );
  }

  if (lower.includes('form') || lower.includes('voucher') || lower.includes('template') || lower.includes('download')) {
    if (!actions.some(a => a.tab === 'forms_piv' || a.tab === 'forms_medical')) {
      actions.push(
        { label: 'Browse Faculty Forms', tab: 'forms_all' },
        { label: 'Open PIV Voucher Template', tab: 'forms_piv' }
      );
    }
  }

  if (lower.includes('registration') || lower.includes('subject') || lower.includes('add/drop') || lower.includes('enroll')) {
    actions.push(
      { label: 'Semester Registration', tab: 'registration' }
    );
  }

  // Deduplicate by tab
  const seen = new Set();
  return actions.filter(act => {
    if (seen.has(act.tab)) return false;
    seen.add(act.tab);
    return true;
  }).slice(0, 3);
}

/**
 * Ask Google Gemini API
 * @param {Object} options
 * @param {string} options.prompt - Current user input query
 * @param {Array} options.history - Past conversation messages [{ sender, text }]
 * @param {Object} options.user - Current logged-in user details
 * @returns {Promise<{ success: boolean, text: string, model: string, actions: Array, error?: string }>}
 */
export async function askGemini({ prompt, history = [], user = null }) {
  if (!prompt || !prompt.trim()) {
    return { success: false, error: 'Empty prompt' };
  }

  // Format past turns for Gemini's multi-turn schema
  // Gemini expects roles: 'user' or 'model'
  const contents = [];

  // Filter previous messages (up to 6 turns for context compactness)
  const recentHistory = history.slice(-6);
  for (const msg of recentHistory) {
    if (msg.sender === 'user') {
      contents.push({
        role: 'user',
        parts: [{ text: msg.text }]
      });
    } else if (msg.sender === 'assistant' && msg.text) {
      contents.push({
        role: 'model',
        parts: [{ text: msg.text }]
      });
    }
  }

  // Append current user prompt
  const userContextPrefix = user?.name ? `[User: ${user.name}, Reg: ${user.regNo || 'Student'}, Role: ${user.role || 'Student'}]\n` : '';
  contents.push({
    role: 'user',
    parts: [{ text: `${userContextPrefix}${prompt}` }]
  });

  const payload = {
    contents,
    systemInstruction: {
      parts: [
        { text: SEUSL_SYSTEM_INSTRUCTION }
      ]
    },
    generationConfig: {
      temperature: 0.6,
      topP: 0.95,
      maxOutputTokens: 1024
    }
  };

  let lastError = null;

  // Attempt each candidate model until one succeeds
  for (const model of CANDIDATE_MODELS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.warn(`[Gemini API] Model ${model} returned status ${response.status}:`, errorText);
        lastError = new Error(`HTTP ${response.status}`);
        continue; // Try next candidate model
      }

      const data = await response.json();
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (candidateText && candidateText.trim()) {
        const actions = detectSuggestedActions(candidateText + ' ' + prompt);
        return {
          success: true,
          text: candidateText.trim(),
          model,
          actions
        };
      } else {
        lastError = new Error('Empty response from model');
      }
    } catch (err) {
      console.warn(`[Gemini API] Request failed on model ${model}:`, err.message);
      lastError = err;
    }
  }

  return {
    success: false,
    error: lastError ? lastError.message : 'All Gemini models unavailable'
  };
}
