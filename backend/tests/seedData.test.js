const test = require('node:test');
const assert = require('node:assert');
const tpl = require('../db/seeds/templates');
const channels = require('../db/seeds/channels');
const migrations = require('../db/migrations');
const { matchTemplate } = require('../utils/templateMatcher');

const allTemplates = () => [...tpl.baseline, ...tpl.newTemplates].map((t, i) => ({ id: i + 1, ...t }));

test('template types are unique and fit VARCHAR(50)', () => {
  const types = [...tpl.baseline, ...tpl.newTemplates].map((t) => t.type);
  assert.strictEqual(new Set(types).size, types.length);
  types.forEach((t) => assert.ok(t.length <= 50, `${t} too long`));
});

test('severity values stay within the existing vocabulary', () => {
  const ok = ['Critical', 'High', 'Medium', 'Unknown'];
  [...tpl.baseline, ...tpl.newTemplates].forEach((t) => assert.ok(ok.includes(t.severity), t.type));
});

test('every existing template has guidance and every guidance key is a baseline type', () => {
  const base = tpl.baseline.map((t) => t.type);
  assert.deepStrictEqual(Object.keys(tpl.guidance).sort(), [...base].sort());
});

test('new templates carry guidance, checklist and keywords (lowercase, trimmed)', () => {
  tpl.newTemplates.forEach((t) => {
    assert.ok(t.preliminary_guidance.length > 40, t.type);
    assert.ok(t.evidence_checklist.length > 10, t.type);
    t.keywords.split(',').forEach((k) => {
      assert.strictEqual(k, k.trim().toLowerCase(), `${t.type}: "${k}"`);
      assert.ok(k.length >= 4, `${t.type}: keyword "${k}" too short/generic (substring matching)`);
    });
  });
});

test('channel codes unique; every mapped code exists; every template has a mapping', () => {
  const codes = channels.map((c) => c.code);
  assert.strictEqual(new Set(codes).size, codes.length);
  const types = [...tpl.baseline, ...tpl.newTemplates].map((t) => t.type);
  assert.deepStrictEqual(Object.keys(tpl.channelMap).sort(), [...types].sort());
  Object.entries(tpl.channelMap).forEach(([type, list]) => {
    assert.ok(list.length > 0, type);
    list.forEach((c) => assert.ok(codes.includes(c), `${type} -> unknown channel ${c}`));
  });
});

test('channels have at least one way to reach them and a verification date', () => {
  channels.forEach((c) => {
    assert.ok(c.phone || c.email || c.website_url || c.description, c.code);
    assert.match(c.last_verified_at, /^\d{4}-\d{2}-\d{2}$/);
  });
});

test('migrations are uniquely named, ordered and executable', () => {
  const names = migrations.map((m) => m.name);
  assert.strictEqual(new Set(names).size, names.length);
  assert.deepStrictEqual([...names].sort(), names);
  migrations.forEach((m) => assert.strictEqual(typeof m.up, 'function'));
});

test('migrations never contain destructive statements', () => {
  const src = require('fs').readFileSync(require.resolve('../db/migrations'), 'utf8')
    + require('fs').readFileSync(require.resolve('../db/migrationHelpers'), 'utf8');
  // ignore comments - the header documents the rule by naming the forbidden words
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  assert.ok(!/\bDROP\s+(TABLE|COLUMN|DATABASE)/i.test(code));
  assert.ok(!/\bTRUNCATE\b/i.test(code));
  assert.ok(!/\bDELETE\s+FROM\b/i.test(code));
});

test('Bangladesh scenarios match the right template', () => {
  const t = allTemplates();
  const cases = [
    ['someone is threatening to leak my private video unless i pay', 'Sextortion / Intimate Image Abuse'],
    ['i paid advance payment to a facebook page seller and product not delivered', 'F-commerce Fraud'],
    ['a fake call from bank asked for my pin', 'Fake Call / Vishing Fraud'],
    ['my bkash pin shared and unauthorized transaction happened', 'Mobile Banking Fraud'],
    ['they offered an overseas job and took registration fee for job', 'Fake Job / Overseas Job Scam'],
    ['i downloaded a fake bkash app apk file', 'Malicious Mobile App (Fake APK)'],
    ['my sim swap happened and sim blocked suddenly', 'SIM Swap / Unauthorized SIM'],
    ['our website defaced with hacker message on site', 'Website Defacement'],
    ['invested in a ponzi scheme with guaranteed profit', 'Investment / Ponzi Scam'],
  ];
  for (const [text, expected] of cases) {
    const r = matchTemplate(text, t);
    assert.strictEqual(r.template && r.template.type, expected, text);
  }
});

test('original v1 matching behaviour is unchanged for classic phrases', () => {
  const t = allTemplates();
  assert.strictEqual(matchTemplate('my website down and not loading', t).template.type, 'DDoS');
  assert.strictEqual(matchTemplate('facebook hacked yesterday', t).template.type, 'Social Media Hacking');
  assert.strictEqual(matchTemplate('ransom note on my desktop', t).template.type, 'Ransomware');
});
