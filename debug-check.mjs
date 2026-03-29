import { createRequire } from 'module';
// tsx経由で実行するためのデバッグスクリプト
const items = [
  { item: 'HbA1c', value: 8.5, unit: '%' },
  { item: 'HBAIC', value: 8.5, unit: '%' },
  { item: 'HBA1C', value: 8.5, unit: '%' },
  { item: 'ヘモグロビンA1c', value: 8.5, unit: '%' },
  { item: 'ALT(GPT)', value: 60, unit: 'U/L' },
  { item: 'ALT (GPT)', value: 60, unit: 'U/L' },
  { item: 'AST(GOT)', value: 50, unit: 'U/L' },
  { item: 'GGT', value: 80, unit: 'U/L' },
  { item: 'LDLコレステロール', value: 160, unit: 'mg/dL' },
  { item: 'LDL-コレステロール', value: 160, unit: 'mg/dL' },
];
console.log(JSON.stringify(items));
