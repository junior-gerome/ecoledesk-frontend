/* Apply the sockjs-client deprecation fix after every npm install.
 * sockjs-client registers a window 'unload' listener (lib/utils/event.js),
 * which Chromium now flags as deprecated. Replace it with 'pagehide'.
 * Idempotent: does nothing if the patch is already applied.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(root, 'node_modules', 'sockjs-client', 'lib', 'utils', 'event.js');

if (!existsSync(target)) {
  console.warn('[patch-sockjs] sockjs-client not found, skipping.');
  process.exit(0);
}

const original = readFileSync(target, 'utf8');

const fromUnload = "module.exports.attachEvent('unload', unloadTriggered);";
const toPagehide = "module.exports.attachEvent('pagehide', unloadTriggered);";

if (original.includes(toPagehide)) {
  console.log('[patch-sockjs] already patched.');
  process.exit(0);
}

if (!original.includes(fromUnload)) {
  console.error('[patch-sockjs] unexpected sockjs-client content, not patching.');
  process.exit(1);
}

writeFileSync(target, original.replace(fromUnload, toPagehide), 'utf8');
console.log('[patch-sockjs] patched unload -> pagehide in sockjs-client.');