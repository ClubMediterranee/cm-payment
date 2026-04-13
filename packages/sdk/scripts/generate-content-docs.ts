import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { defaultContent } from '../src/content/default';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type ContentValue = string | { [key: string]: ContentValue };

const extractVariables = (template: string): string[] => {
  const matches = template.match(/\{(\w+)\}/g);
  return matches ? matches.map((m) => m.slice(1, -1)) : [];
};

const camelToTitle = (str: string): string =>
  str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

const flattenContent = (
  obj: ContentValue,
  parentKey = '',
): Array<{ path: string; value: string; variables: string[] }> => {
  if (typeof obj === 'string') {
    return [{ path: parentKey, value: obj, variables: extractVariables(obj) }];
  }

  return Object.entries(obj).flatMap(([key, value]) => {
    const path = parentKey ? `${parentKey}.${key}` : key;
    return flattenContent(value, path);
  });
};

const generateTables = (): string => {
  const rows = flattenContent(defaultContent);
  const sections = new Map<string, typeof rows>();

  rows.forEach((row) => {
    const section = row.path.split('.')[0];
    if (!sections.has(section)) sections.set(section, []);
    sections.get(section)!.push(row);
  });

  let markdown = '';

  sections.forEach((rows, section) => {
    markdown += `## ${camelToTitle(section)}\n\n`;
    markdown += `<div class="content-keys-table">\n\n`;
    markdown += `| Clé | Valeur par défaut | Variables |\n`;
    markdown += `|-----|-------------------|----------|\n`;

    rows.forEach(({ path, value, variables }) => {
      const escapedValue = value.replace(/{/g, '\\{').replace(/}/g, '\\}');
      const vars = variables.length > 0 ? variables.map((v) => `\`{${v}}\``).join(', ') : '-';
      markdown += `| \`${path}\` | ${escapedValue} | ${vars} |\n`;
    });

    markdown += '\n</div>\n\n';
  });

  return markdown;
};

const outputPath = path.join(__dirname, '../../docs/docs/content-keys-tables.md');
fs.writeFileSync(outputPath, generateTables(), 'utf-8');
console.log(`✅ Tableaux générés : ${outputPath}`);
