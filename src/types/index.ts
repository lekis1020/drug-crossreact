export type DrugClass =
  | 'penicillin'
  | 'cephalosporin'
  | 'carbapenem'
  | 'monobactam'
  | 'quinolone'
  | 'glycopeptide'
  | 'sulfonamide'
  | 'macrolide'
  | 'aminoglycoside'
  | 'tetracycline'
  | 'lincosamide'
  | 'oxazolidinone'
  | 'nitroimidazole';

export type CrossReactivity = 'high' | 'moderate' | 'low' | 'disputed';

export type SpectrumTag = 'mrsa' | 'pseudomonas' | 'anaerobe' | 'atypical' | 'esbl';

export interface DrugNodeData {
  id: string;
  label: string;
  drugClass: DrugClass;
  r1Group?: string;
  r1Name?: string;
  formula?: string;
  pubchemCid?: number;
  color: string;
  spectrumTags?: SpectrumTag[];
}

export interface CrossReactEdgeData {
  id: string;
  source: string;
  target: string;
  crossReactivity: CrossReactivity;
  pmids: string[];
  clinicalNote?: string;
}

export interface FilterState {
  classes: Record<DrugClass, boolean>;
  risks: {
    high: boolean;
    moderate: boolean;
    low: boolean;
    disputed: boolean;
  };
}

export interface TooltipState {
  drugId: string;
  x: number;
  y: number;
}

export interface CrossReactInfo {
  drugId: string;
  drugName: string;
  crossReactivity: CrossReactivity;
  pmids: string[];
  r1Group?: string;
  r1Name?: string;
  drugClass: DrugClass;
  clinicalNote?: string;
}
