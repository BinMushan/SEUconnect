const { test } = require('node:test');
const assert = require('node:assert/strict');
const { toCsv, cell } = require('../../modules/reports/csv');

test('formula-looking cells are neutralised with a leading apostrophe', () => {
  for (const evil of ['=1+1', '+SUM(A1)', '-2+3', '@cmd', '\t=1', '=HYPERLINK("http://x","y")']) {
    assert.ok(cell(evil).replace(/^"/, '').startsWith("'"), `not neutralised: ${evil}`);
  }
  assert.equal(cell('plain'), 'plain');
  assert.equal(cell(42), '42');
  assert.equal(cell(null), '');
});

test('quotes, commas and newlines are escaped (RFC 4180)', () => {
  assert.equal(cell('a,b'), '"a,b"');
  assert.equal(cell('say "hi"'), '"say ""hi"""');
  assert.equal(cell('line1\nline2'), '"line1\nline2"');
  assert.equal(cell('=A1,"x"'), `"'=A1,""x"""`);
});

test('toCsv writes a header and CRLF rows', () => {
  const csv = toCsv([{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }], [{ a: '=x', b: 'ok' }, { a: 1, b: new Date('2026-01-01T00:00:00Z') }]);
  assert.equal(csv, "A,B\r\n'=x,ok\r\n1,2026-01-01T00:00:00.000Z\r\n");
});
