// `node --test scripts/checkConsumers.test.mts`: W-js3. A consumer whose vendored.json names the
// right version but a commit that is not the release (or a descendant of it) must be reported.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
// @ts-expect-error plain .mjs without types
import { behind } from './check-consumers.mjs';
import { siblingPath } from './siblings.mjs';

const TAG_COMMIT = 'a'.repeat(40);
const OLD = 'b'.repeat(40);
const NEWER = 'c'.repeat(40);
const consumer = (version: string | null, commit: string | null) => [
  { repo: 'o/consumer', manifest: 'vendored.json', version, commit, update: 'sync {version}' },
];
// The release commit and NEWER descend from it; OLD does not; anything else is unknown locally.
const contains = (commit: string): boolean | null => (commit === TAG_COMMIT || commit === NEWER ? true : commit === OLD ? false : null);

test('the right version at an old commit is reported', () => {
  const out = behind('0.1.0', consumer('0.1.0', OLD), contains);
  assert.equal(out.length, 1);
  assert.match(out[0], new RegExp(OLD.slice(0, 12)));
});

test('the release commit and a descendant of it pass', () => {
  assert.equal(behind('0.1.0', consumer('0.1.0', TAG_COMMIT), contains).length, 0);
  assert.equal(behind('0.1.0', consumer('0.1.0', NEWER), contains).length, 0);
});

test('a commit this checkout cannot see, or none at all, is reported rather than trusted', () => {
  assert.equal(behind('0.1.0', consumer('0.1.0', 'd'.repeat(40)), contains).length, 1);
  assert.equal(behind('0.1.0', consumer('0.1.0', null), contains).length, 1);
});

test('an older version is reported once, whatever the commit', () => {
  assert.equal(behind('0.1.1', consumer('0.1.0', TAG_COMMIT), contains).length, 1);
});

test('without a commit check the version rule alone applies (callers that pass none)', () => {
  assert.equal(behind('0.1.0', consumer('0.1.0', OLD)).length, 0);
});

const consumers = JSON.parse(readFileSync(new URL('./consumers.json', import.meta.url), 'utf8')) as { repo: string; manifest: string }[];

test('every consumer names its manifest as vendored.json, the one name the syncs write', () => {
  assert.ok(consumers.length > 0, 'consumers.json lists no consumer');
  for (const c of consumers) assert.match(c.manifest, /(^|\/)vendored\.json$/, `${c.repo}: ${c.manifest}`);
});

for (const c of consumers) {
  // The manifest is read from GitHub at release time. When the consumer is checked out beside this
  // repository, its path is checked here too, so a move in the consumer fails before a release does.
  const local = siblingPath(c.repo, c.manifest);
  test(`${c.repo} keeps ${c.manifest} where consumers.json says`, { skip: local === null ? `${c.repo} is not checked out beside this repo` : false }, () => {
    assert.ok(existsSync(local!), `${local} does not exist`);
  });
}
