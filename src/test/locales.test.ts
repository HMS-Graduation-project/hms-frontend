import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const LOCALES_DIR = path.join(__dirname, '..', 'locales');
const LANGUAGES = ['en', 'ar', 'tr'];

function getKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

const namespaces = fs.readdirSync(path.join(LOCALES_DIR, 'en')).filter(f => f.endsWith('.json'));

describe('Locale key parity', () => {
  for (const ns of namespaces) {
    const nsName = ns.replace('.json', '');

    it(`${nsName}: en/ar/tr should have identical key sets`, () => {
      const keysByLang: Record<string, string[]> = {};

      for (const lang of LANGUAGES) {
        const filePath = path.join(LOCALES_DIR, lang, ns);
        expect(fs.existsSync(filePath), `${lang}/${ns} should exist`).toBe(true);

        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        keysByLang[lang] = getKeys(content);
      }

      const enKeys = keysByLang['en'];
      for (const lang of ['ar', 'tr']) {
        const langKeys = keysByLang[lang];
        const missing = enKeys.filter(k => !langKeys.includes(k));
        const extra = langKeys.filter(k => !enKeys.includes(k));

        expect(missing, `${nsName}: ${lang} missing keys`).toEqual([]);
        expect(extra, `${nsName}: ${lang} extra keys`).toEqual([]);
      }
    });
  }

  it('all locale files should be valid JSON', () => {
    for (const lang of LANGUAGES) {
      const dir = path.join(LOCALES_DIR, lang);
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
      for (const f of files) {
        expect(() => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))).not.toThrow();
      }
    }
  });
});
