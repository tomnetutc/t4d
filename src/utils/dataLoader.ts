import Papa from 'papaparse';

export interface SurveyRow {
  SurveyInstitution: string;
  gender: string;
  AgeGroup1: string;
  [key: string]: string;
}

export const MISSING = 'Seen but not answered';

const LIKERT_MAP: Record<string, number> = {
  'Strongly disagree': 1, 'Somewhat disagree': 2, 'Neutral': 3,
  'Somewhat agree': 4,    'Strongly agree': 5,
};

let cachedData: SurveyRow[] | null = null;

export async function loadSurveyData(): Promise<SurveyRow[]> {
  if (cachedData) return cachedData;
  return new Promise((resolve, reject) => {
    Papa.parse(`${process.env.PUBLIC_URL}/data/t4_survey_data.csv`, {
      download: true, header: true, skipEmptyLines: true,
      complete: (r) => { cachedData = r.data as SurveyRow[]; resolve(cachedData); },
      error: reject,
    });
  });
}

export function getLikertValue(val: string): number | null {
  if (!val || val === MISSING) return null;
  return LIKERT_MAP[val] ?? null;
}

export interface LikertCounts {
  stronglyDisagree: number; somewhatDisagree: number; neutral: number;
  somewhatAgree: number;    stronglyAgree: number;    total: number;
}

export function computeLikertCounts(data: SurveyRow[], variable: string): LikertCounts {
  const c = { stronglyDisagree: 0, somewhatDisagree: 0, neutral: 0, somewhatAgree: 0, stronglyAgree: 0, total: 0 };
  for (const row of data) {
    const v = row[variable];
    if (!v || v === MISSING) continue;
    c.total++;
    if (v === 'Strongly disagree')  c.stronglyDisagree++;
    else if (v === 'Somewhat disagree') c.somewhatDisagree++;
    else if (v === 'Neutral')           c.neutral++;
    else if (v === 'Somewhat agree')    c.somewhatAgree++;
    else if (v === 'Strongly agree')    c.stronglyAgree++;
  }
  return c;
}

export function computeMeanStd(data: SurveyRow[], variable: string) {
  const vals: number[] = [];
  for (const row of data) { const v = getLikertValue(row[variable]); if (v !== null) vals.push(v); }
  if (!vals.length) return { mean: 0, std: 0, n: 0, min: 0, max: 0 };
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const std  = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length);
  return { mean, std, n: vals.length, min: Math.min(...vals), max: Math.max(...vals) };
}

/* ── Generic / mobility compute helpers ─────────────────── */

const SKIP_VALUES = new Set([
  'Seen but not answered', 'Appropriate skip', 'Missing (other)',
  'Appropriate skip - Would never buy the AV', // av_willpay specific skip
]);

/** Count occurrences of each predefined category; ignores skip/missing rows. */
export function computeGenericCounts(
  data: SurveyRow[], variable: string, categories: string[]
): { counts: Record<string, number>; total: number } {
  const counts: Record<string, number> = {};
  categories.forEach(c => (counts[c] = 0));
  let total = 0;
  for (const row of data) {
    const v = row[variable];
    if (!v || SKIP_VALUES.has(v)) continue;
    if (categories.includes(v)) { counts[v]++; total++; }
  }
  return { counts, total };
}

/** Return frequency distribution for all valid values (no predefined list). */
export function computeDistribution(
  data: SurveyRow[], variable: string
): Array<{ label: string; count: number }> {
  const counts: Record<string, number> = {};
  for (const row of data) {
    const v = row[variable];
    if (!v || SKIP_VALUES.has(v)) continue;
    counts[v] = (counts[v] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

/** For binary "Option selected / not selected" style variables.
 *  Returns count of rows where value === selectedValue and total valid rows. */
export function computeSelectionRate(
  data: SurveyRow[], variable: string, selectedValue: string
): { selected: number; total: number } {
  let selected = 0, total = 0;
  for (const row of data) {
    const v = row[variable];
    if (!v || SKIP_VALUES.has(v)) continue;
    total++;
    if (v === selectedValue) selected++;
  }
  return { selected, total };
}

/* CSV export helpers */
export function buildCsvRows(variables: { shortLabel: string; counts: LikertCounts }[]): string {
  const header = 'Question,Strongly Disagree,Somewhat Disagree,Neutral,Somewhat Agree,Strongly Agree,Total';
  const rows = variables.map(v => {
    const { stronglyDisagree: sd, somewhatDisagree: d, neutral: n, somewhatAgree: a, stronglyAgree: sa, total } = v.counts;
    return `"${v.shortLabel}",${sd},${d},${n},${a},${sa},${total}`;
  });
  return [header, ...rows].join('\n');
}

export function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
