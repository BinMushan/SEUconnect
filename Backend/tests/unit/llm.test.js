process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const llm = require('../../modules/assistant/llm');
const { chooseTier } = require('../../modules/assistant/service');
const { allowedFor, TOOLS } = require('../../modules/assistant/tools');

beforeEach(() => llm.resetCooldowns());

const err = (status, message = 'x') => Object.assign(new llm.LlmError(message), { status });

test('fallback chain: own tier first, then the other tier, no duplicates', () => {
  const fast = llm.chainFor('fast');
  const smart = llm.chainFor('smart');
  assert.equal(new Set(fast).size, fast.length);
  assert.deepEqual([...fast].sort(), [...smart].sort()); // same models, different order
  assert.equal(fast[0], llm.describe().fast[0]);
  assert.equal(smart[0], llm.describe().smart[0]);
  assert.notEqual(fast[0], smart[0]);
});

test('a failing model falls through to the next one and is skipped on the next request', async () => {
  const calls = [];
  const call = async (m) => {
    calls.push(m);
    if (m === 'a') throw err(429, 'quota');
    return `ok-${m}`;
  };
  const first = await llm.runChain(['a', 'b', 'c'], call);
  assert.deepEqual([first.model, first.value], ['b', 'ok-b']);
  assert.deepEqual(calls, ['a', 'b']);
  assert.ok(llm.isDown('a'));
  calls.length = 0;
  const second = await llm.runChain(['a', 'b', 'c'], call);
  assert.equal(second.model, 'b');
  assert.deepEqual(calls, ['b'], 'the model on cooldown is not tried again');
});

test('when every model is cooling down the chain still tries them instead of failing outright', async () => {
  await assert.rejects(llm.runChain(['a'], async () => { throw err(0, 'timeout'); }));
  assert.ok(llm.isDown('a'));
  const r = await llm.runChain(['a'], async () => 'back');
  assert.equal(r.value, 'back');
});

test('all models failing surfaces the last error; the time budget stops further attempts', async () => {
  await assert.rejects(llm.runChain(['a', 'b'], async (m) => { throw err(503, `down-${m}`); }), /down-b/);
  llm.resetCooldowns();
  let t = 0;
  const calls = [];
  await assert.rejects(
    llm.runChain(['a', 'b', 'c'], async (m) => { calls.push(m); t += 20000; throw err(0, 'timeout'); }, { budgetMs: 30000, now: () => t })
  );
  assert.deepEqual(calls, ['a', 'b'], 'third model is not attempted once the budget is spent');
});

test('retired / not-allowed models are parked far longer than a transient failure', async () => {
  const realNow = Date.now;
  await assert.rejects(llm.runChain(['gone'], async () => { throw err(404); }));
  await assert.rejects(llm.runChain(['blip'], async () => { throw err(503); }));
  Date.now = () => realNow() + 5 * 60 * 1000;
  try {
    assert.ok(llm.isDown('gone'), 'retired model still parked after 5 minutes');
    assert.ok(!llm.isDown('blip'), 'transient failure recovered after 5 minutes');
  } finally {
    Date.now = realNow;
  }
});

test('tier routing: short knowledge questions go to the fast tier, data / multi-part / reasoning questions to the smart tier', () => {
  const student = allowedFor({ studentId: 's1', permissions: new Map(TOOLS.map((t) => [t.permission, 'own'])) });
  assert.equal(chooseTier('What is the medical certificate rule?', student), 'fast');
  assert.equal(chooseTier('What is my GPA?', student), 'smart');
  assert.equal(chooseTier('Compare the repeat fee and the grade ceiling', student), 'smart');
  assert.equal(chooseTier('What is the rule? And the fee?', student), 'smart');
  assert.equal(chooseTier('x'.repeat(200), student), 'smart');
});

test('Gemini 3 thought signatures survive the tool round trip (otherwise the next turn is rejected with HTTP 400)', () => {
  const answer = llm.parseAnswer({ candidates: [{ content: { parts: [{ functionCall: { name: 'my_gpa', args: {} }, thoughtSignature: 'sig-abc' }] } }] });
  assert.equal(answer.toolCalls[0].signature, 'sig-abc');
  const contents = llm.toGemini([
    { role: 'user', text: 'What is my GPA?' },
    { role: 'assistant', text: '', toolCalls: answer.toolCalls },
    { role: 'tool', results: [{ name: 'my_gpa', result: [] }] },
  ]);
  assert.equal(contents[1].role, 'model');
  assert.equal(contents[1].parts[0].thoughtSignature, 'sig-abc');
  assert.deepEqual(contents[1].parts[0].functionCall, { name: 'my_gpa', args: {} });
  assert.deepEqual(contents[2].parts[0].functionResponse, { name: 'my_gpa', response: { result: [] } });
  // a call without a signature (older models) is sent without one
  assert.equal('thoughtSignature' in llm.toGemini([{ role: 'assistant', toolCalls: [{ name: 'x', args: {} }] }])[0].parts[0], false);
  assert.throws(() => llm.parseAnswer({ candidates: [{ content: { parts: [] } }] }), /Empty response/);
});

test('a rejected request (HTTP 400) does not park the model, since the request was at fault', async () => {
  await assert.rejects(llm.runChain(['m1'], async () => { throw err(400, 'bad request'); }));
  assert.ok(!llm.isDown('m1'));
});
