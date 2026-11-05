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
