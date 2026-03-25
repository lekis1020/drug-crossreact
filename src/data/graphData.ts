import { drugDatabase } from './drugDatabase';
import { getDrugColor } from './colors';
import type { DrugNodeData, CrossReactEdgeData, DrugClass, CrossReactInfo, SpectrumTag } from '../types';

export const DRUG_SPECTRUM_TAGS: Record<string, SpectrumTag[]> = {
  // === MRSA coverage ===
  'vancomycin': ['mrsa'],
  'teicoplanin': ['mrsa'],
  'dalbavancin': ['mrsa'],
  'oritavancin': ['mrsa'],
  'telavancin': ['mrsa'],
  'linezolid': ['mrsa'],
  'tedizolid': ['mrsa'],
  'clindamycin': ['mrsa', 'anaerobe'],
  'trimethoprim-sulfamethoxazole': ['mrsa'],
  'doxycycline': ['mrsa', 'atypical'],
  'minocycline': ['mrsa', 'atypical'],
  'tigecycline': ['mrsa', 'anaerobe'],
  'ceftaroline': ['mrsa'],
  'ceftobiprole': ['mrsa', 'pseudomonas'],
  'delafloxacin': ['mrsa'],
  // === Pseudomonas coverage ===
  'piperacillin': ['pseudomonas'],
  'ceftazidime': ['pseudomonas'],
  'cefepime': ['pseudomonas'],
  'aztreonam': ['pseudomonas'],
  'meropenem': ['pseudomonas', 'anaerobe', 'esbl'],
  'imipenem': ['pseudomonas', 'anaerobe', 'esbl'],
  'doripenem': ['pseudomonas', 'anaerobe', 'esbl'],
  'ciprofloxacin': ['pseudomonas'],
  'levofloxacin': ['pseudomonas', 'atypical'],
  'gentamicin': ['pseudomonas'],
  'tobramycin': ['pseudomonas'],
  'amikacin': ['pseudomonas'],
  // === Anaerobe coverage ===
  'metronidazole': ['anaerobe'],
  'tinidazole': ['anaerobe'],
  'ertapenem': ['anaerobe', 'esbl'],
  'amoxicillin': ['anaerobe'],  // amox-clav
  // === Atypical coverage ===
  'azithromycin': ['atypical'],
  'clarithromycin': ['atypical'],
  'erythromycin': ['atypical'],
  'moxifloxacin': ['atypical', 'anaerobe'],
  'daptomycin': ['mrsa'],
  'tetracycline': ['atypical'],
};

function drugId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

function formatLabel(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function canonicalTerm(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function mapLiteratureRisk(value: string): CrossReactEdgeData['crossReactivity'] | null {
  const key = value.toLowerCase().trim();
  if (key === 'high' || key === 'moderate' || key === 'low' || key === 'disputed') return key;
  return null;
}

function edgeKey(source: string, target: string): string {
  return source < target ? `${source}|${target}` : `${target}|${source}`;
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
  cephalothin: 'cephalosporin',
  cefixime: 'cephalosporin',
  cefdinir: 'cephalosporin',
  cefpodoxime: 'cephalosporin',
  cefditoren: 'cephalosporin',
  ceftaroline: 'cephalosporin',
  ceftobiprole: 'cephalosporin',
  aztreonam: 'monobactam',
  meropenem: 'carbapenem',
  imipenem: 'carbapenem',
  ertapenem: 'carbapenem',
  doripenem: 'carbapenem',
};

const NON_BETA_LACTAM_NODES: DrugNodeData[] = [
  // Quinolones
  { id: 'ciprofloxacin', label: 'Ciprofloxacin', drugClass: 'quinolone', color: getDrugColor(undefined, 'quinolone') },
  { id: 'moxifloxacin', label: 'Moxifloxacin', drugClass: 'quinolone', color: getDrugColor(undefined, 'quinolone') },
  { id: 'levofloxacin', label: 'Levofloxacin', drugClass: 'quinolone', color: getDrugColor(undefined, 'quinolone') },
  { id: 'delafloxacin', label: 'Delafloxacin', drugClass: 'quinolone', color: getDrugColor(undefined, 'quinolone') },
  { id: 'ofloxacin', label: 'Ofloxacin', drugClass: 'quinolone', color: getDrugColor(undefined, 'quinolone') },
  // Glycopeptides
  { id: 'vancomycin', label: 'Vancomycin', drugClass: 'glycopeptide', color: getDrugColor(undefined, 'glycopeptide') },
  { id: 'teicoplanin', label: 'Teicoplanin', drugClass: 'glycopeptide', color: getDrugColor(undefined, 'glycopeptide') },
  { id: 'dalbavancin', label: 'Dalbavancin', drugClass: 'glycopeptide', color: getDrugColor(undefined, 'glycopeptide') },
  { id: 'oritavancin', label: 'Oritavancin', drugClass: 'glycopeptide', color: getDrugColor(undefined, 'glycopeptide') },
  { id: 'telavancin', label: 'Telavancin', drugClass: 'glycopeptide', color: getDrugColor(undefined, 'glycopeptide') },
  // Macrolides
  { id: 'azithromycin', label: 'Azithromycin', drugClass: 'macrolide', color: getDrugColor(undefined, 'macrolide') },
  { id: 'clarithromycin', label: 'Clarithromycin', drugClass: 'macrolide', color: getDrugColor(undefined, 'macrolide') },
  { id: 'erythromycin', label: 'Erythromycin', drugClass: 'macrolide', color: getDrugColor(undefined, 'macrolide') },
  // Aminoglycosides
  { id: 'gentamicin', label: 'Gentamicin', drugClass: 'aminoglycoside', color: getDrugColor(undefined, 'aminoglycoside') },
  { id: 'tobramycin', label: 'Tobramycin', drugClass: 'aminoglycoside', color: getDrugColor(undefined, 'aminoglycoside') },
  { id: 'amikacin', label: 'Amikacin', drugClass: 'aminoglycoside', color: getDrugColor(undefined, 'aminoglycoside') },
  // Tetracyclines
  { id: 'doxycycline', label: 'Doxycycline', drugClass: 'tetracycline', color: getDrugColor(undefined, 'tetracycline') },
  { id: 'minocycline', label: 'Minocycline', drugClass: 'tetracycline', color: getDrugColor(undefined, 'tetracycline') },
  { id: 'tetracycline', label: 'Tetracycline', drugClass: 'tetracycline', color: getDrugColor(undefined, 'tetracycline') },
  { id: 'tigecycline', label: 'Tigecycline', drugClass: 'tetracycline', color: getDrugColor(undefined, 'tetracycline') },
  // Lincosamides
  { id: 'clindamycin', label: 'Clindamycin', drugClass: 'lincosamide', color: getDrugColor(undefined, 'lincosamide') },
  // Oxazolidinones
  { id: 'linezolid', label: 'Linezolid', drugClass: 'oxazolidinone', color: getDrugColor(undefined, 'oxazolidinone') },
  { id: 'tedizolid', label: 'Tedizolid', drugClass: 'oxazolidinone', color: getDrugColor(undefined, 'oxazolidinone') },
  // Sulfonamides
  { id: 'sulfamethoxazole', label: 'Sulfamethoxazole', drugClass: 'sulfonamide', color: getDrugColor(undefined, 'sulfonamide') },
  { id: 'sulfasalazine', label: 'Sulfasalazine', drugClass: 'sulfonamide', color: getDrugColor(undefined, 'sulfonamide') },
  { id: 'trimethoprim-sulfamethoxazole', label: 'TMP-SMX', drugClass: 'sulfonamide', color: getDrugColor(undefined, 'sulfonamide') },
  // Lipopeptide
  { id: 'daptomycin', label: 'Daptomycin', drugClass: 'lipopeptide', color: getDrugColor(undefined, 'lipopeptide') },
  // Nitroimidazoles
  { id: 'metronidazole', label: 'Metronidazole', drugClass: 'nitroimidazole', color: getDrugColor(undefined, 'nitroimidazole') },
  { id: 'tinidazole', label: 'Tinidazole', drugClass: 'nitroimidazole', color: getDrugColor(undefined, 'nitroimidazole') },
];

function makePairs(ids: string[]): Array<[string, string]> {
  const pairs: Array<[string, string]> = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      pairs.push([ids[i], ids[j]]);
    }
  }
  return pairs;
}

const EDGE_RISK_PRIORITY: Record<CrossReactEdgeData['crossReactivity'], number> = {
  high: 4,
  disputed: 3,
  moderate: 2,
  low: 1,
};


export const DRUG_SUBGROUP_MAP: Record<string, string> = {
  // Penicillins
  'penicillin-g': 'Penicillin (Natural)',
  'penicillin-v': 'Penicillin (Natural)',
  'amoxicillin': 'Penicillin (Amino)',
  'ampicillin': 'Penicillin (Amino)',
  'oxacillin': 'Penicillin (Anti-staph)',
  'dicloxacillin': 'Penicillin (Anti-staph)',
  'nafcillin': 'Penicillin (Anti-staph)',
  'piperacillin': 'Penicillin (Extended)',
  // Cephalosporins
  'cephalexin': 'Cephalosporin 1G',
  'cefadroxil': 'Cephalosporin 1G',
  'cefazolin': 'Cephalosporin 1G',
  'cefaclor': 'Cephalosporin 1G',
  'cephalothin': 'Cephalosporin 1G',
  'cefuroxime': 'Cephalosporin 2G',
  'cefprozil': 'Cephalosporin 2G',
  'cefoxitin': 'Cephalosporin 2G',
  'ceftriaxone': 'Cephalosporin 3G',
  'cefotaxime': 'Cephalosporin 3G',
  'ceftazidime': 'Cephalosporin 3G',
  'ceftibuten': 'Cephalosporin 3G',
  'cefixime': 'Cephalosporin 3G',
  'cefdinir': 'Cephalosporin 3G',
  'cefpodoxime': 'Cephalosporin 3G',
  'cefditoren': 'Cephalosporin 3G',
  'cefepime': 'Cephalosporin 4G',
  'ceftaroline': 'Cephalosporin 5G',
  'ceftobiprole': 'Cephalosporin 5G',
  // Others
  'meropenem': 'Carbapenem',
  'imipenem': 'Carbapenem',
  'ertapenem': 'Carbapenem',
  'doripenem': 'Carbapenem',
  'aztreonam': 'Monobactam',
  // Non-BL
  'ciprofloxacin': 'Fluoroquinolone',
  'moxifloxacin': 'Fluoroquinolone',
  'levofloxacin': 'Fluoroquinolone',
  'delafloxacin': 'Fluoroquinolone',
  'ofloxacin': 'Fluoroquinolone',
  'vancomycin': 'Glycopeptide',
  'teicoplanin': 'Glycopeptide',
  'dalbavancin': 'Glycopeptide',
  'oritavancin': 'Glycopeptide',
  'telavancin': 'Glycopeptide',
  'azithromycin': 'Macrolide',
  'clarithromycin': 'Macrolide',
  'erythromycin': 'Macrolide',
  'gentamicin': 'Aminoglycoside',
  'tobramycin': 'Aminoglycoside',
  'amikacin': 'Aminoglycoside',
  'doxycycline': 'Tetracycline',
  'minocycline': 'Tetracycline',
  'tetracycline': 'Tetracycline',
  'tigecycline': 'Tetracycline',
  'clindamycin': 'Lincosamide',
  'linezolid': 'Oxazolidinone',
  'tedizolid': 'Oxazolidinone',
  'sulfamethoxazole': 'Sulfonamide',
  'sulfasalazine': 'Sulfonamide',
  'trimethoprim-sulfamethoxazole': 'Sulfonamide',
  'metronidazole': 'Nitroimidazole',
  'tinidazole': 'Nitroimidazole',
  'daptomycin': 'Lipopeptide',
};

function subgroupId(name: string): string {
  return 'group-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

let cache: { nodes: DrugNodeData[]; edges: CrossReactEdgeData[]; parentNodes: Array<{id: string; label: string; isGroup: boolean}>; nodeParents: Record<string, string> } | null = null;

export function buildGraphElements(): { nodes: DrugNodeData[]; edges: CrossReactEdgeData[]; parentNodes: Array<{id: string; label: string; isGroup: boolean}>; nodeParents: Record<string, string> } {
  if (cache) return cache;

  const nodes: DrugNodeData[] = [];
  const edges: CrossReactEdgeData[] = [];
  const { drug_r1_map, drug_structures, r1_groups, prediction_rules, literature_confirmed_pairs } = drugDatabase;

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
      spectrumTags: DRUG_SPECTRUM_TAGS[drugId(name)],
    });
  }

  // Add non-beta-lactam nodes with spectrum tags
  for (const nbl of NON_BETA_LACTAM_NODES) {
    nodes.push({ ...nbl, spectrumTags: DRUG_SPECTRUM_TAGS[nbl.id] });
  }

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
  const quinolones = ['ciprofloxacin', 'moxifloxacin', 'levofloxacin', 'delafloxacin', 'ofloxacin'];
  for (const [s, t] of makePairs(quinolones)) {
    edges.push({ id: `edge-${s}-${t}`, source: s, target: t, crossReactivity: 'moderate', pmids: [] });
  }

  // Glycopeptide internal → moderate
  const glycopeptides = ['vancomycin', 'teicoplanin', 'dalbavancin', 'oritavancin', 'telavancin'];
  for (const [s, t] of makePairs(glycopeptides)) {
    edges.push({ id: `edge-${s}-${t}`, source: s, target: t, crossReactivity: 'moderate', pmids: [] });
  }

  // Macrolide internal → moderate
  const macrolides = ['azithromycin', 'clarithromycin', 'erythromycin'];
  for (const [s, t] of makePairs(macrolides)) {
    edges.push({ id: `edge-${s}-${t}`, source: s, target: t, crossReactivity: 'moderate', pmids: [] });
  }

  // Aminoglycoside internal → moderate
  const aminoglycosides = ['gentamicin', 'tobramycin', 'amikacin'];
  for (const [s, t] of makePairs(aminoglycosides)) {
    edges.push({ id: `edge-${s}-${t}`, source: s, target: t, crossReactivity: 'moderate', pmids: [] });
  }

  // Tetracycline core → moderate; tigecycline ↔ core → low (structural divergence)
  const tetracyclineCore = ['doxycycline', 'minocycline', 'tetracycline'];
  for (const [s, t] of makePairs(tetracyclineCore)) {
    edges.push({ id: `edge-${s}-${t}`, source: s, target: t, crossReactivity: 'moderate', pmids: [] });
  }
  for (const core of tetracyclineCore) {
    edges.push({
      id: `edge-tigecycline-${core}`,
      source: 'tigecycline',
      target: core,
      crossReactivity: 'low',
      pmids: [],
      clinicalNote: 'Tigecycline is structurally distinct (glycylcycline); lower cross-reactivity expected.',
    });
  }

  // Oxazolidinone internal → moderate
  edges.push({ id: 'edge-linezolid-tedizolid', source: 'linezolid', target: 'tedizolid', crossReactivity: 'moderate', pmids: [] });

  // Sulfonamide internal → moderate
  const sulfonamideList = ['sulfamethoxazole', 'sulfasalazine', 'trimethoprim-sulfamethoxazole'];
  for (const [s, t] of makePairs(sulfonamideList)) {
    edges.push({ id: `edge-${s}-${t}`, source: s, target: t, crossReactivity: 'moderate', pmids: [] });
  }

  // Nitroimidazole internal → moderate
  edges.push({ id: 'edge-metronidazole-tinidazole', source: 'metronidazole', target: 'tinidazole', crossReactivity: 'moderate', pmids: [] });





  // === Cefoxitin cross-reactivity ===
  // Cefoxitin ↔ Penicillin G: in vitro data (Zagursky, disputed)
  edges.push({
    id: 'edge-cefoxitin-penicillin-g',
    source: 'cefoxitin',
    target: 'penicillin-g',
    crossReactivity: 'disputed',
    pmids: ['Hutten2025_Allergy', '29408440'],
    clinicalNote: 'Zagursky: in vitro cross-reactivity (shared non-identical R1). Not universally accepted. Other authors consider safe.',
  });

  // Cefoxitin ↔ Cefotaxime: shared R2 side chain
  edges.push({
    id: 'edge-cefoxitin-cefotaxime',
    source: 'cefoxitin',
    target: 'cefotaxime',
    crossReactivity: 'low',
    pmids: ['28887994'],
    clinicalNote: 'Shared identical R2 side chain (Trubiano 2017). R2-based cross-reactivity less established than R1.',
  });

  // === Case-report and study-level cross-reactivity (comprehensive) ===

  // Aztreonam ↔ Ceftazidime: HIGH (identical R1, G4) - already in same-group edges but ensure it exists
  // (already covered by R1 group edges since both in G4)

  // Glycopeptide detailed pairs with PMIDs
  // vancomycin↔teicoplanin, vancomycin↔dalbavancin already have moderate edges from class grouping
  // Add specific evidence notes
  
  // Teicoplanin ↔ Daptomycin: T-cell cross-reactivity (case report)
  edges.push({
    id: 'edge-teicoplanin-daptomycin',
    source: 'teicoplanin',
    target: 'daptomycin',
    crossReactivity: 'low',
    pmids: ['35107993'],
    clinicalNote: 'CASE REPORT: Teicoplanin-specific CD8+ T-cells cross-react with daptomycin (granzyme B, perforin, FasL). Caution in teicoplanin DRESS.',
  });

  // Cefotaxime ↔ Teicoplanin: cosensitization (case report)
  edges.push({
    id: 'edge-cefotaxime-teicoplanin',
    source: 'cefotaxime',
    target: 'teicoplanin',
    crossReactivity: 'low',
    pmids: ['35610175'],
    clinicalNote: 'CASE REPORT: Pediatric cefotaxime-DRESS with cosensitization to teicoplanin.',
  });

  // Penicillin G ↔ Carbapenems: low (≤1%)
  for (const carb of ['meropenem', 'imipenem', 'ertapenem', 'doripenem']) {
    edges.push({
      id: `edge-penicillin-g-${carb}`,
      source: 'penicillin-g',
      target: carb,
      crossReactivity: 'low',
      pmids: ['37499906', '28887994'],
      clinicalNote: 'Cross-reactivity ≤1%. Carbapenems generally safe in penicillin allergy. Risk/benefit for life-threatening allergy.',
    });
  }

  // Anti-staph penicillins ↔ Penicillin G/V: class cross-reactivity
  for (const staph of ['oxacillin', 'dicloxacillin', 'nafcillin']) {
    for (const pen of ['penicillin-g', 'penicillin-v']) {
      edges.push({
        id: `edge-${staph}-${pen}`,
        source: staph,
        target: pen,
        crossReactivity: 'moderate',
        pmids: ['28887994'],
        clinicalNote: 'Penicillin class cross-reactivity via shared core. Confirmed penicillin allergy: avoid all penicillins.',
      });
    }
  }
  // Anti-staph ↔ Aminopenicillins
  for (const staph of ['oxacillin', 'dicloxacillin', 'nafcillin']) {
    for (const amino of ['amoxicillin', 'ampicillin']) {
      edges.push({
        id: `edge-${staph}-${amino}`,
        source: staph,
        target: amino,
        crossReactivity: 'moderate',
        pmids: ['28887994'],
        clinicalNote: 'Penicillin class cross-reactivity. Different R1 but shared penicillin core.',
      });
    }
  }

  // Vancomycin ↔ Telavancin: derivative risk (case report level)
  edges.push({
    id: 'edge-vancomycin-telavancin-case',
    source: 'vancomycin',
    target: 'telavancin',
    crossReactivity: 'moderate',
    pmids: ['38177093'],
    clinicalNote: 'Vancomycin DRESS: HLA-A*32:01 associated. Telavancin is vancomycin derivative - theoretical cross-reactivity.',
  });

  // === Piperacillin cross-reactivity ===
  // G14 (ureido-aminobenzyl) shares aminobenzyl backbone with G1/G2
  const pipG1targets = ['ampicillin', 'cephalexin', 'cefaclor']; // G1
  const pipG2targets = ['amoxicillin', 'cefadroxil', 'cefprozil']; // G2
  for (const target of pipG1targets) {
    edges.push({
      id: `edge-piperacillin-${target}`,
      source: 'piperacillin',
      target,
      crossReactivity: 'moderate',
      pmids: ['29408440', '28887994'],
      clinicalNote: 'Piperacillin R1 (ureido-aminobenzyl) shares aminobenzyl backbone with G1. Cross-reactivity reported.',
    });
  }
  for (const target of pipG2targets) {
    edges.push({
      id: `edge-piperacillin-${target}`,
      source: 'piperacillin',
      target,
      crossReactivity: 'moderate',
      pmids: ['29408440', '28887994'],
      clinicalNote: 'Piperacillin R1 (ureido-aminobenzyl) shares aminobenzyl backbone with G2. Cross-reactivity reported.',
    });
  }
  // Piperacillin ↔ Penicillin G/V: penicillin core cross-reactivity
  for (const target of ['penicillin-g', 'penicillin-v']) {
    edges.push({
      id: `edge-piperacillin-${target}`,
      source: 'piperacillin',
      target,
      crossReactivity: 'moderate',
      pmids: ['28887994', '34998313'],
      clinicalNote: 'Shared penicillin core. In confirmed penicillin allergy, other penicillins including piperacillin should be avoided.',
    });
  }

  // === Trubiano 2017: Cefuroxime non-identical R1 clinical cross-reactivity ===
  // Cefuroxime (G6 furyl-methoxyimino) ↔ G3 (aminothiazolyl-methoxyimino) group
  // Shared methoxyimino moiety → clinical cross-reactivity documented
  const cefuroximeG3targets = ['ceftriaxone', 'cefotaxime', 'cefepime', 'cefixime', 'cefdinir', 'cefpodoxime', 'cefditoren', 'ceftaroline', 'ceftobiprole'];
  for (const target of cefuroximeG3targets) {
    edges.push({
      id: `edge-cefuroxime-${target}`,
      source: 'cefuroxime',
      target,
      crossReactivity: 'moderate',
      pmids: ['28887994'],
      clinicalNote: 'Non-identical R1 but shared methoxyimino moiety. Clinical cross-reactivity reported (Trubiano 2017).',
    });
  }
  // Cefuroxime ↔ Ceftazidime: lower evidence (different oxyimino)
  edges.push({
    id: 'edge-cefuroxime-ceftazidime',
    source: 'cefuroxime',
    target: 'ceftazidime',
    crossReactivity: 'low',
    pmids: ['28887994'],
    clinicalNote: 'Grouped by Trubiano 2017 but weaker structural basis. Different oxyimino substituents.',
  });

  // === New evidence: Stevenson 2026, Hutten 2025 ===

  // Cefazolin → Penicillins: low cross-reactivity (10.2% ST+, 0% OPC confirmed)
  edges.push({
    id: 'edge-cefazolin-penicillin-g',
    source: 'cefazolin',
    target: 'penicillin-g',
    crossReactivity: 'low',
    pmids: ['Stevenson2026_JACIG'],
    clinicalNote: '10.2% ST positive in cefazolin-allergic patients without PAL, but 0% confirmed by OPC. May be false positives.',
  });

  // Disputed: Aztreonam ↔ Ceftriaxone (Hutten 2025)
  edges.push({
    id: 'edge-aztreonam-ceftriaxone',
    source: 'aztreonam',
    target: 'ceftriaxone',
    crossReactivity: 'disputed',
    pmids: ['Hutten2025_Allergy'],
    clinicalNote: 'DISPUTED: Trubiano considers safe; Romano & Zagursky report identical R1 ring. Exercise caution.',
  });

  // === Literature-confirmed pair ingestion (targeted mapping) ===
  const availableNodeIds = new Set(nodes.map(n => n.id));
  const cephalosporinIds = nodes.filter(n => n.drugClass === 'cephalosporin').map(n => n.id);
  const carbapenemIds = nodes.filter(n => n.drugClass === 'carbapenem').map(n => n.id);

  const termAliases: Record<string, string[]> = {
    [canonicalTerm('penicillins')]: ['penicillin-g', 'penicillin-v'],
    [canonicalTerm('penicillins (confirmed allergy)')]: ['penicillin-g', 'penicillin-v'],
    [canonicalTerm('penicillin/amoxicillin')]: ['penicillin-g', 'penicillin-v', 'amoxicillin'],
    [canonicalTerm('aminopenicillins')]: ['amoxicillin', 'ampicillin'],
    [canonicalTerm('aminopenicillins (amoxicillin)')]: ['amoxicillin'],
    [canonicalTerm('aminopenicillins (ampicillin/amoxicillin)')]: ['ampicillin', 'amoxicillin'],
    [canonicalTerm('aminocephalosporins')]: ['cephalexin', 'cefaclor', 'cefadroxil', 'cefprozil'],
    [canonicalTerm('aminocephalosporins (cefalexin/cefaclor)')]: ['cephalexin', 'cefaclor'],
    [canonicalTerm('early generation cephalosporins')]: ['cephalexin', 'cefadroxil', 'cefazolin', 'cefaclor', 'cephalothin', 'cefuroxime', 'cefprozil', 'cefoxitin'],
    [canonicalTerm('later-generation cephalosporins')]: ['ceftriaxone', 'cefotaxime', 'ceftazidime', 'ceftibuten', 'cefixime', 'cefdinir', 'cefpodoxime', 'cefditoren', 'cefepime', 'ceftaroline', 'ceftobiprole'],
    [canonicalTerm('3rd-gen cephalosporins')]: ['ceftriaxone', 'cefotaxime', 'ceftazidime', 'ceftibuten', 'cefixime', 'cefdinir', 'cefpodoxime', 'cefditoren'],
    [canonicalTerm('cephalosporins')]: cephalosporinIds,
    [canonicalTerm('carbapenems')]: carbapenemIds,
    [canonicalTerm('cefamandole')]: [], // not in current graph
    [canonicalTerm('clavulanate')]: [], // not in current graph
    [canonicalTerm('tazobactam')]: [],  // not in current graph
    [canonicalTerm('neomycin')]: [],    // not in current graph
    [canonicalTerm('enoxaparin')]: [],  // not in current graph
    [canonicalTerm('patients with ≥3 BL allergy labels')]: [],
    [canonicalTerm('cephalosporins (confirmed allergic)')]: [],
    [canonicalTerm('unrelated R1 cephalosporins')]: [],
  };

  const resolveTermIds = (term: string): string[] => {
    const canonical = canonicalTerm(term);
    const aliasHits = termAliases[canonical];
    if (aliasHits) return aliasHits.filter(id => availableNodeIds.has(id));

    const directId = canonical.replace(/\s+/g, '-');
    if (availableNodeIds.has(directId)) return [directId];

    if (canonical === 'penicillin g') return ['penicillin-g'];
    if (canonical === 'penicillin v') return ['penicillin-v'];
    return [];
  };

  for (const pair of literature_confirmed_pairs) {
    const risk = mapLiteratureRisk(pair.ige_cross_reactivity);
    if (!risk) continue;

    const sources = resolveTermIds(pair.drug_a);
    const targets = resolveTermIds(pair.drug_b);
    if (!sources.length || !targets.length) continue;

    for (const source of sources) {
      for (const target of targets) {
        if (source === target) continue;
        const pmids = pair.evidence_pmids ?? [];
        const structural = pair.structural_basis ? `Structural basis: ${pair.structural_basis}.` : '';
        const note = pair.clinical_note ? `Literature note: ${pair.clinical_note}` : '';
        const clinicalNote = [structural, note].filter(Boolean).join(' ').trim();

        edges.push({
          id: `edge-lit-${source}-${target}`,
          source,
          target,
          crossReactivity: risk,
          pmids,
          clinicalNote: clinicalNote || undefined,
        });
      }
    }
  }

  // Deduplicate pair edges while preserving the more conservative risk when conflicts exist.
  const mergedEdgeMap = new Map<string, CrossReactEdgeData>();
  for (const edge of edges) {
    const key = edgeKey(edge.source, edge.target);
    const existing = mergedEdgeMap.get(key);

    if (!existing) {
      mergedEdgeMap.set(key, { ...edge, pmids: [...new Set(edge.pmids)] });
      continue;
    }

    const existingPriority = EDGE_RISK_PRIORITY[existing.crossReactivity] ?? 0;
    const incomingPriority = EDGE_RISK_PRIORITY[edge.crossReactivity] ?? 0;
    const preferred = incomingPriority > existingPriority ? edge : existing;

    const mergedPmids = [...new Set([...(existing.pmids ?? []), ...(edge.pmids ?? [])])];
    const mergedNotes = [...new Set([existing.clinicalNote, edge.clinicalNote].filter(Boolean))].join(' | ');

    mergedEdgeMap.set(key, {
      ...preferred,
      pmids: mergedPmids,
      clinicalNote: mergedNotes || undefined,
    });
  }

  const dedupedEdges = [...mergedEdgeMap.values()];

  // Build compound parent nodes for subgroups
  const subgroups = new Set<string>();
  for (const node of nodes) {
    const sg = DRUG_SUBGROUP_MAP[node.id];
    if (sg) subgroups.add(sg);
  }
  const parentNodes = Array.from(subgroups).map(sg => ({
    id: subgroupId(sg),
    label: sg,
    isGroup: true,
  }));

  // Assign parent to each drug node
  const nodeParents: Record<string, string> = {};
  for (const node of nodes) {
    const sg = DRUG_SUBGROUP_MAP[node.id];
    if (sg) nodeParents[node.id] = subgroupId(sg);
  }

  cache = { nodes, edges: dedupedEdges, parentNodes, nodeParents };
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
