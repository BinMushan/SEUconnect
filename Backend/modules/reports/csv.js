/** CSV serialisation that is safe to open in spreadsheet software (formula-injection and quote escaping). */

const FORMULA_START = /^[=+\-@\t\r]/;

const cell = (value) => {
  if (value === null || value === undefined) return '';
  let text = value instanceof Date ? value.toISOString() : typeof value === 'object' ? JSON.stringify(value) : String(value);
  // A cell that starts with = + - @ (or tab / CR) would be executed as a formula: neutralise it with a leading apostrophe.
  if (FORMULA_START.test(text)) text = `'${text}`;
  if (/[",\r\n]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
};

/** columns: [{ key, label }]; rows: array of plain objects. Lines end with CRLF (RFC 4180). */
const toCsv = (columns, rows) => {
  const head = columns.map((c) => cell(c.label || c.key)).join(',');
  const body = rows.map((r) => columns.map((c) => cell(r[c.key])).join(','));
  return `${[head, ...body].join('\r\n')}\r\n`;
};

module.exports = { toCsv, cell };
