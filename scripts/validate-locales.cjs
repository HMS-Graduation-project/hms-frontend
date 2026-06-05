#!/usr/bin/env node
/**
 * Locale Key Parity Validator
 *
 * Compares all translation JSON files across en/ar/tr
 * and reports any missing or extra keys.
 *
 * Usage: node scripts/validate-locales.js
 * Exit code 0 = all aligned, 1 = mismatches found
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'src', 'locales');
const LANGUAGES = ['en', 'ar', 'tr'];
const REFERENCE_LANG = 'en';

function getKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

let hasErrors = false;
let totalFiles = 0;
let totalKeys = 0;

// Get namespace files from reference language
const refDir = path.join(LOCALES_DIR, REFERENCE_LANG);
const namespaces = fs.readdirSync(refDir).filter(f => f.endsWith('.json'));

console.log(`Validating ${namespaces.length} namespaces across ${LANGUAGES.length} languages\n`);

for (const ns of namespaces) {
  const nsName = ns.replace('.json', '');
  const files = {};
  const keys = {};
  let nsError = false;

  for (const lang of LANGUAGES) {
    const filePath = path.join(LOCALES_DIR, lang, ns);
    if (!fs.existsSync(filePath)) {
      console.log(`  MISSING: ${lang}/${ns}`);
      hasErrors = true;
      nsError = true;
      continue;
    }

    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      files[lang] = content;
      keys[lang] = new Set(getKeys(content));
      totalFiles++;
    } catch (e) {
      console.log(`  INVALID JSON: ${lang}/${ns} — ${e.message}`);
      hasErrors = true;
      nsError = true;
    }
  }

  if (nsError) continue;

  const refKeys = keys[REFERENCE_LANG];
  totalKeys += refKeys.size;

  for (const lang of LANGUAGES) {
    if (lang === REFERENCE_LANG) continue;

    const langKeys = keys[lang];
    const missing = [...refKeys].filter(k => !langKeys.has(k));
    const extra = [...langKeys].filter(k => !refKeys.has(k));

    if (missing.length > 0) {
      console.log(`  ${nsName}: ${lang} missing ${missing.length} keys:`);
      missing.forEach(k => console.log(`    - ${k}`));
      hasErrors = true;
    }
    if (extra.length > 0) {
      console.log(`  ${nsName}: ${lang} has ${extra.length} extra keys:`);
      extra.forEach(k => console.log(`    + ${k}`));
      hasErrors = true;
    }
  }

  if (!nsError) {
    const allMatch = LANGUAGES.every(l => l === REFERENCE_LANG || keys[l].size === refKeys.size);
    if (allMatch) {
      console.log(`  ${nsName}: OK (${refKeys.size} keys)`);
    }
  }
}

console.log(`\n${totalFiles} files checked, ${totalKeys} reference keys\n`);

if (hasErrors) {
  console.log('FAIL — locale key mismatches found');
  process.exit(1);
} else {
  console.log('PASS — all locale files aligned');
  process.exit(0);
}
