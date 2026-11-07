process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { chunkText, tokenize, cosine } = require('../../modules/assistant/rag');

test('tokenizer drops stop words, lower-cases and stems simple plurals', () => {
  assert.deepEqual(tokenize('What are the Attendance Requirements?'), ['attendance', 'requirement']);
  assert.deepEqual(tokenize(''), []);
});

test('chunker keeps paragraphs together up to the limit and never returns empty chunks', () => {
  const para = 'A'.repeat(500);
  const chunks = chunkText(`${para}\n\n${para}\n\n${para}`);
  assert.equal(chunks.length, 3); // 500 + 500 > 900, so one paragraph each
  assert.ok(chunks.every((c) => c.length > 0));
  assert.deepEqual(chunkText('Short one.\n\nShort two.'), ['Short one.\n\nShort two.']);
  assert.deepEqual(chunkText('   \n\n  '), []);
});

test('chunker splits an over-long paragraph on sentence boundaries', () => {
  const sentence = 'This is a sentence of moderate length used for testing. ';
  const chunks = chunkText(sentence.repeat(40));
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((c) => c.length <= 900 && c.endsWith('.')));
});

test('cosine similarity', () => {
  assert.equal(cosine([1, 0], [1, 0]), 1);
  assert.equal(cosine([1, 0], [0, 1]), 0);
  assert.equal(cosine([0, 0], [1, 1]), 0);
  assert.ok(Math.abs(cosine([1, 1], [2, 2]) - 1) < 1e-9);
});

test('rulesAnswer fallback accurately answers the user query "1yaer 2nd semester what are the subject we has ??" with subjects and no TOC dots', async () => {
  const { rulesAnswer } = require('../../modules/assistant/service');
  const { allowedFor } = require('../../modules/assistant/tools');

  const tools = allowedFor({ studentId: 'stu-1', permissions: new Map([['courses.read', 'faculty'], ['students.read', 'own']]) });
  const agent = { key: 'student', roleLabel: 'Student', starters: ['What is my attendance?'] };
  const req = { body: { message: '1yaer 2nd semester what are the subject we has ??' }, user: { id: 'stu-1', name: 'Afnan' }, access: { permissions: new Map([['courses.read', 'faculty']]) } };

  // Even with Table of Contents hits from the RAG retriever:
  const hits = [
    { title: 'Handbook 2023 2024 FT', source: 'Handbook', status: 'active', text: 'General Information .............. 133\n7.1 Student Enrolment ........ 133', score: 0.8 },
  ];

  const ans = await rulesAnswer({ req, agent, tools, message: '1yaer 2nd semester what are the subject we has ??', hits });
  assert.ok(ans.used.includes('curriculum_subjects'));
  assert.match(ans.text, /Year 1 Semester 2/);
  assert.match(ans.text, /SWT12012/);
  assert.match(ans.text, /Object Oriented Programming/);
  assert.match(ans.text, /SWT12022/);
  assert.match(ans.text, /Web systems and Technologies/);
  assert.match(ans.text, /NST12012/);
  assert.match(ans.text, /Computer Networks/);
  // Must NOT include the unhelpful TOC dots
  assert.doesNotMatch(ans.text, /General Information \.\.\.\.\.\./);
});
