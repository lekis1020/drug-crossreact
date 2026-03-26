import type { DrugNodeData } from '../types';
import type { ContrastNodeData } from '../contrast/types';
import type { OncologyNodeData } from '../oncology/types';

export interface SearchHit {
  id: string;
  label: string;
  color: string;
  secondaryLabel: string;
  matchType: 'ingredient' | 'brand';
  matchedAlias?: string;
}

const ANTIBIOTIC_BRAND_ALIASES: Record<string, string[]> = {
  amoxicillin: ['amoxil'],
  ampicillin: ['principen'],
  'penicillin-g': ['pfizerpen'],
  'penicillin-v': ['veetids'],
  oxacillin: ['bactocill'],
  dicloxacillin: ['dynapen'],
  nafcillin: ['nafcillin sodium'],
  piperacillin: ['zosyn', 'tazocin'],
  cephalexin: ['keflex'],
  cefadroxil: ['duricef'],
  cefaclor: ['ceclor'],
  cefuroxime: ['ceftin', 'zinacef'],
  ceftriaxone: ['rocephin'],
  cefotaxime: ['claforan'],
  cefepime: ['maxipime'],
  ceftazidime: ['fortaz', 'tazicef'],
  cefixime: ['suprax'],
  cefdinir: ['omnicef'],
  cefpodoxime: ['vantin'],
  cefditoren: ['spectracef'],
  ceftaroline: ['teflaro'],
  ceftobiprole: ['zevtera'],
  aztreonam: ['azactam'],
  meropenem: ['merrem'],
  imipenem: ['primaxin'],
  ertapenem: ['invanz'],
  doripenem: ['doribax'],
  ciprofloxacin: ['cipro'],
  levofloxacin: ['levaquin'],
  moxifloxacin: ['avelox'],
  vancomycin: ['vancocin'],
  linezolid: ['zyvox'],
  daptomycin: ['cubicin'],
  azithromycin: ['zithromax'],
  clarithromycin: ['biaxin'],
  erythromycin: ['erythrocin'],
  doxycycline: ['vibramycin'],
  minocycline: ['minocin'],
  metronidazole: ['flagyl'],
  tinidazole: ['tindamax'],
  'trimethoprim-sulfamethoxazole': ['bactrim', 'septra'],
  sulfamethoxazole: ['gantrisin'],
  sulfasalazine: ['azulfidine'],
};

const CONTRAST_BRAND_ALIASES: Record<string, string[]> = {
  iohexol: ['omnipaque'],
  iopamidol: ['isovue', 'isovist'],
  ioversol: ['optiray'],
  iopromide: ['ultravist'],
  iomeprol: ['iomeron'],
  iodixanol: ['visipaque'],
  iobitridol: ['xenetix'],
  diatrizoate: ['gastrografin', 'urografine', 'hypaque'],
  ioxaglate: ['hexabrix'],
  ioxitalamate: ['telebrix'],
};

const ONCOLOGY_BRAND_ALIASES: Record<string, string[]> = {
  paclitaxel: ['taxol', 'genexol'],
  docetaxel: ['taxotere'],
  nab_paclitaxel: ['abraxane'],
  cabazitaxel: ['jevtana'],
  carboplatin: ['paraplatin'],
  cisplatin: ['platinol'],
  oxaliplatin: ['eloxatin'],
  pegaspargase: ['oncaspar'],
  asparaginase_erwinia: ['erwinaze', 'rylaze'],
  calaspargase_pegol: ['asparlas'],
  doxorubicin: ['adriamycin'],
  pegylated_liposomal_doxorubicin: ['doxil', 'caelyx'],
  daunorubicin: ['cerubidine'],
};

function normalizeTerm(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '');
}

function calculateMatchScore(query: string, candidate: string, matchType: 'ingredient' | 'brand'): number {
  if (candidate === query) return matchType === 'ingredient' ? 0 : 1;
  if (candidate.startsWith(query)) return matchType === 'ingredient' ? 2 : 3;
  return matchType === 'ingredient' ? 4 : 5;
}

export function searchAntibioticNodes(nodes: DrugNodeData[], query: string, classLabelById: Record<string, string>): SearchHit[] {
  const normalizedQuery = normalizeTerm(query);
  if (!normalizedQuery) return [];

  const hits: Array<SearchHit & { score: number }> = [];

  for (const node of nodes) {
    const normalizedLabel = normalizeTerm(node.label);
    if (normalizedLabel.includes(normalizedQuery)) {
      hits.push({
        id: node.id,
        label: node.label,
        color: node.color,
        secondaryLabel: classLabelById[node.id] ?? node.drugClass,
        matchType: 'ingredient',
        score: calculateMatchScore(normalizedQuery, normalizedLabel, 'ingredient'),
      });
    }

    const aliases = ANTIBIOTIC_BRAND_ALIASES[node.id] ?? [];
    for (const alias of aliases) {
      const normalizedAlias = normalizeTerm(alias);
      if (!normalizedAlias.includes(normalizedQuery)) continue;

      hits.push({
        id: node.id,
        label: node.label,
        color: node.color,
        secondaryLabel: `상품명: ${alias}`,
        matchType: 'brand',
        matchedAlias: alias,
        score: calculateMatchScore(normalizedQuery, normalizedAlias, 'brand'),
      });
    }
  }

  return hits
    .sort((a, b) => a.score - b.score || a.label.localeCompare(b.label))
    .slice(0, 12)
    .map(({ score: _score, ...rest }) => rest);
}

export function searchContrastNodes(nodes: ContrastNodeData[], query: string): SearchHit[] {
  const normalizedQuery = normalizeTerm(query);
  if (!normalizedQuery) return [];

  const hits: Array<SearchHit & { score: number }> = [];

  for (const node of nodes) {
    const normalizedLabel = normalizeTerm(node.label);
    if (normalizedLabel.includes(normalizedQuery)) {
      hits.push({
        id: node.id,
        label: node.label,
        color: node.color,
        secondaryLabel: node.groupName,
        matchType: 'ingredient',
        score: calculateMatchScore(normalizedQuery, normalizedLabel, 'ingredient'),
      });
    }

    const aliases = CONTRAST_BRAND_ALIASES[node.id] ?? [];
    for (const alias of aliases) {
      const normalizedAlias = normalizeTerm(alias);
      if (!normalizedAlias.includes(normalizedQuery)) continue;

      hits.push({
        id: node.id,
        label: node.label,
        color: node.color,
        secondaryLabel: `상품명: ${alias}`,
        matchType: 'brand',
        matchedAlias: alias,
        score: calculateMatchScore(normalizedQuery, normalizedAlias, 'brand'),
      });
    }
  }

  return hits
    .sort((a, b) => a.score - b.score || a.label.localeCompare(b.label))
    .slice(0, 12)
    .map(({ score: _score, ...rest }) => rest);
}

export function searchOncologyNodes(nodes: OncologyNodeData[], query: string): SearchHit[] {
  const normalizedQuery = normalizeTerm(query);
  if (!normalizedQuery) return [];

  const hits: Array<SearchHit & { score: number }> = [];

  for (const node of nodes) {
    const normalizedLabel = normalizeTerm(node.label);
    if (normalizedLabel.includes(normalizedQuery)) {
      hits.push({
        id: node.id,
        label: node.label,
        color: node.color,
        secondaryLabel: node.groupName,
        matchType: 'ingredient',
        score: calculateMatchScore(normalizedQuery, normalizedLabel, 'ingredient'),
      });
    }

    const aliases = ONCOLOGY_BRAND_ALIASES[node.id] ?? [];
    for (const alias of aliases) {
      const normalizedAlias = normalizeTerm(alias);
      if (!normalizedAlias.includes(normalizedQuery)) continue;

      hits.push({
        id: node.id,
        label: node.label,
        color: node.color,
        secondaryLabel: `상품명: ${alias}`,
        matchType: 'brand',
        matchedAlias: alias,
        score: calculateMatchScore(normalizedQuery, normalizedAlias, 'brand'),
      });
    }
  }

  return hits
    .sort((a, b) => a.score - b.score || a.label.localeCompare(b.label))
    .slice(0, 12)
    .map(({ score: _score, ...rest }) => rest);
}
