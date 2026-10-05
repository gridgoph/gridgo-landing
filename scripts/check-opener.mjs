/**
 * The opener's yellow field shrinks onto the Print stop on its own. While it does,
 * the full-screen skip button must keep taking clicks, or a click meant to skip
 * falls through to whatever sits underneath. The nav fades in above the overlay
 * during the hand-off, so a window capture listener catches clicks on it too.
 * A scroll-driven hand-off still lets clicks through once the field starts moving.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const opener = readFileSync(resolve(scriptDir, '../src/components/OpenerIntro.tsx'), 'utf8');

const pointer = opener.match(/const skipPointer = useTransform\(([\s\S]*?)\);\n/);
assert(pointer, 'OpenerIntro should derive the skip button pointer events in skipPointer.');
assert(/autoHandoff\.get\(\)/.test(pointer[1]), 'skipPointer should stay clickable while the automatic hand-off runs.');
assert(/progress\.get\(\)\s*<\s*0\.02/.test(pointer[1]), 'skipPointer should still let clicks through once a scroll moves the field.');
assert(
  /autoHandoff\.set\(1\);[^}]*?handoffRun = animate\(progress/.test(opener),
  'The automatic hand-off should mark itself before it starts moving progress.',
);
assert(
  /addEventListener\('click', skipOnClick, true\)/.test(opener) &&
    /removeEventListener\('click', skipOnClick, true\)/.test(opener),
  'The nav sits above the overlay, so the automatic hand-off should catch clicks in the capture phase and release them when it stops.',
);
assert(/skipOnClick = \(event: MouseEvent\) => \{[\s\S]*?preventDefault\(\);[\s\S]*?finish\('top'\)/.test(opener), 'A caught click should not follow a link and should land on the hero.');
assert(/style=\{\{ pointerEvents: skipPointer \}\}[\s\S]{0,80}onClick=\{\(\) => finish\('top'\)\}/.test(opener), 'The skip button should finish onto the hero.');

console.log('opener ok');
