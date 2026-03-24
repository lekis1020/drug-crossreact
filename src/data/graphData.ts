import { drugDatabase } from './drugDatabase';
import { getDrugColor } from './colors';
import type { DrugNodeData, CrossReactEdgeData, DrugClass, CrossReactInfo } from '../types';

function drugId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

function formatLabel(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

const DRUG_CLASS_MAP: Record<string, DrugClass> = {
  amoxicillin: 'penicillin',
  ampicillin: 'penicillin',
  'penicillin G': 'penicillin',
  'penicillin V': 'penicillin',
  oxacillin: 'penicillin',
  dicloxacillin: 'penicillin',
  nafcillin: 'penicillin',
  piperacillin: 'penicillin',
  cephalexin: 'cephalosporin',
  cefaclor: 'cephalosporin',
  cefadroxil: 'cephalosporin',
  cefprozil: 'cephalosporin',
  ceftriaxone: 'cephalosporin',
  cefotaxime: 'cephalosporin',
  cefepime: 'cephalosporin',
  ceftazidime: 'cephalosporin',
  ceftibuten: 'cephalosporin',
  cefuroxime: 'cephalosporin',
  cefazolin: 'cephalosporin',
  cefoxitin: 'cephalosporin',
  aztreonam: 'monobactam',
  meropenem: 'carbapenem',
  imipenem: 'carbapenem',
  ertapenem: 'carbapenem',
  doripenem: 'carbapenem',
};

const NON_BETA_LACTAM_NODES: DrugNodeData[] = [
  { id: 'ciprofloxacin', label: 'Ciprofloxacin', drugClass: 'quinolone', color: getDrugColor(undefined, 'quinolone') },
  { id: 'moxifloxacin', label: 'Moxifloxacin', drugClass: 'quinolone', color: getDrugColor(undefined, 'quinolone') },
  { id: 'levofloxacin', label: 'Levofloxacin', drugClass: 'quinolone', color: getDrugColor(undefined, 'quinolone') },
  { id: 'vancomycin', label: 'Vancomycin', drugClass: 'glycopeptide', color: getDrugColor(undefined, 'glycopeptide') },
  { id: 'teicoplanin', label: 'Teicoplanin', drugClass: 'glycopeptide', color: getDrugColor(undefined, 'glycopeptide') },
  { id: 'dalbavancin', label: 'Dalbavancin', drugClass: 'glycopeptide', color: getDrugColor(undefined, 'glycopeptide') },
  { id: 'sulfamethoxazole', label: 'Sulfamethoxazole', drugClass: 'sulfonamide', color: getDrugColor(undefined, 'sulfonamide') },
  { id: 'sulfasalazine', label: 'Sulfasalazine', drugClass: 'sulfonamide', color: getDrugColor(undefined, 'sulfonamide') },
];

let cache: { nodes: DrugNodeData[]; edges: CrossReactEdgeData[] } | null = null;

export function buildGraphElements(): { nodes: DrugNodeData[]; edges: CrossReactEdgeData[] } {
  if (cache) return cache;

  const nodes: DrugNodeData[] = [];
  const edges: CrossReactEdgeData[] = [];
  const { drug_r1_map, drug_structures, r1_groups, prediction_rules } = drugDatabase;

  // Build beta-lactam nodes
  for (const [name, r1Data] of Object.entries(drug_r1_map)) {
    const id = drugId(name);
    const drugClass: DrugClass = DRUG_CLASS_MAP[name] ?? 'cephalosporin';
    const structure = drug_structures[name];
    nodes.push({
      id,
      label: formatLabel(name),
      drugClass,
      r1Group: r1Data.group,
      r1Name: r1Data.r1_name,
      formula: structure?.formula,
      pubchemCid: structure?.cid,
      color: getDrugColor(r1Data.group),
    });
  }

  // Add non-beta-lactam nodes
  nodes.push(...NON_BETA_LACTAM_NODES);

  const rule001Pmids = prediction_rules.find(r => r.rule_id === 'R001')?.pmids ?? [];
  const rule002Pmids = prediction_rules.find(r => r.rule_id === 'R002')?.pmids ?? [];

  // Group beta-lactam drugs by R1 group
  const byGroup: Record<string, string[]> = {};
  for (const [name, r1Data] of Object.entries(drug_r1_map)) {
    if (!byGroup[r1Data.group]) byGroup[r1Data.group] = [];
    byGroup[r1Data.group].push(name);
  }

  // Same R1 group → high
  for (const [groupId, drugs] of Object.entries(byGroup)) {
    const groupPmids = r1_groups.find(g => g.group_id === groupId)?.pmids ?? [];
    const pmids = [...new Set([...rule001Pmids, ...groupPmids])];
    for (let i = 0; i < drugs.length; i++) {
      for (let j = i + 1; j < drugs.length; j++) {
        const source = drugId(drugs[i]);
        const target = drugId(drugs[j]);
        edges.push({ id: `edge-${source}-${target}`, source, target, crossReactivity: 'high', pmids });
      }
    }
  }

  // G1 ↔ G2 (aminobenzyl variants) → moderate
  const g1 = byGroup['G1'] ?? [];
  const g2 = byGroup['G2'] ?? [];
  for (const d1 of g1) {
    for (const d2 of g2) {
      const source = drugId(d1);
      const target = drugId(d2);
      edges.push({ id: `edge-${source}-${target}`, source, target, crossReactivity: 'moderate', pmids: rule002Pmids });
    }
  }

  // Quinolone internal → moderate
  const quinolones = ['ciprofloxacin', 'moxifloxacin', 'levofloxacin'];
  for (let i = 0; i < quinolones.length; i++) {
    for (let j = i + 1; j < quinolones.length; j++) {
      const source = quinolones[i];
      const target = quinolones[j];
      edges.push({ id: `edge-${source}-${target}`, source, target, crossReactivity: 'moderate', pmids: [] });
    }
  }

  // Glycopeptide internal → moderate
  const glycopeptides = ['vancomycin', 'teicoplanin', 'dalbavancin'];
  for (let i = 0; i < glycopeptides.length; i++) {
    for (let j = i + 1; j < glycopeptides.length; j++) {
      const source = glycopeptides[i];
      const target = glycopeptides[j];
      edges.push({ id: `edge-${source}-${target}`, source, target, crossReactivity: 'moderate', pmids: [] });
    }
  }


  // === New evidence: Stevenson 2026, Hutten 2025 ===

  // Cefazolin → Penicillins: low cross-reactivity (10.2% ST+, 0% OPC confirmed)
  // Stevenson 2026: unique R1, but unexplained ST positivity
  edges.push({
    id: 'edge-cefazolin-penicillin-g',
    source: 'cefazolin',
    target: 'penicillin-g',
    crossReactivity: 'low',
    pmids: ['Stevenson2026_JACIG'],
    clinicalNote: '10.2% ST positive in cefazolin-allergic patients without PAL, but 0% confirmed by OPC. May be false positives.',
  });

  // Disputed: Aztreonam ↔ Ceftriaxone (Hutten 2025)
  // Trubiano: safe; Romano & Zagursky: identical R1 ring
  edges.push({
    id: 'edge-aztreonam-ceftriaxone',
    source: 'aztreonam',
    target: 'ceftriaxone',
    crossReactivity: 'disputed',
    pmids: ['Hutten2025_Allergy'],
    clinicalNote: 'DISPUTED: Trubiano considers safe; Romano & Zagursky report identical R1 ring. Exercise caution.',
  });

  cache = { nodes, edges };
  return cache;
}

export function getCrossReactiveDrugs(selectedId: string): CrossReactInfo[] {
  const { nodes, edges } = buildGraphElements();
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const results: CrossReactInfo[] = [];

  for (const edge of edges) {
    let otherId: string | null = null;
    if (edge.source === selectedId) otherId = edge.target;
    else if (edge.target === selectedId) otherId = edge.source;
    if (!otherId) continue;

    const other = nodeMap.get(otherId);
    if (other) {
      results.push({
        drugId: other.id,
        drugName: other.label,
        crossReactivity: edge.crossReactivity,
        pmids: edge.pmids,
        r1Group: other.r1Group,
        r1Name: other.r1Name,
        drugClass: other.drugClass,
        clinicalNote: edge.clinicalNote,
      });
    }
  }

  const riskOrder: Record<string, number> = { high: 0, disputed: 1, moderate: 2, low: 3 };
  return results.sort((a, b) => {
    const ra = riskOrder[a.crossReactivity] ?? 4;
    const rb = riskOrder[b.crossReactivity] ?? 4;
    if (ra !== rb) return ra - rb;
    return a.drugName.localeCompare(b.drugName);
  });
}

export function getSafeAlternatives(selectedId: string): DrugNodeData[] {
  const { nodes, edges } = buildGraphElements();
  const connectedIds = new Set<string>();
  for (const edge of edges) {
    if (edge.source === selectedId) connectedIds.add(edge.target);
    if (edge.target === selectedId) connectedIds.add(edge.source);
  }
  return nodes
    .filter(n => n.id !== selectedId && !connectedIds.has(n.id))
    .sort((a, b) => a.drugClass.localeCompare(b.drugClass) || a.label.localeCompare(b.label));
}
