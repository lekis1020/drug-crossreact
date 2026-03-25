import rawDb from '../../crossreact_prediction_db.json';

export interface DatabaseMetadata {
  created?: string;
  version?: string;
  scope?: string;
  last_database_update_at?: string;
  last_literature_monitoring_at?: string;
  [key: string]: unknown;
}

export interface RawR1Group {
  group_id: string;
  name: string;
  description: string;
  drugs: string[];
  expected_ige_cross_reactivity: string;
  literature_confirmed: boolean;
  pmids: string[];
}

export interface RawDrugR1Entry {
  group: string;
  r1_name: string;
  confidence: string;
}

export interface RawDrugStructure {
  cid: number;
  formula: string;
}

export interface LiteratureConfirmedPair {
  drug_a: string;
  drug_b: string;
  ige_cross_reactivity: string;
  rate_percent?: string | number | null;
  structural_basis?: string | null;
  evidence_pmids: string[];
  clinical_note?: string | null;
}

export interface LiteratureMonitoringRecord {
  pmid: string;
  title?: string | null;
  journal?: string | null;
  pubdate?: string | null;
  doi?: string | null;
  source?: string;
  status?: string;
  pubmed_url?: string;
  first_seen_at?: string;
  last_seen_at?: string;
}

export interface CrossReactDatabase {
  metadata: DatabaseMetadata;
  r1_groups: RawR1Group[];
  drug_r1_map: Record<string, RawDrugR1Entry>;
  drug_structures: Record<string, RawDrugStructure>;
  literature_confirmed_pairs: LiteratureConfirmedPair[];
  literature_monitoring?: {
    strategy: string;
    query: string;
    checked_window_days: number;
    max_results: number;
    checked_at: string;
    records: LiteratureMonitoringRecord[];
  };
  prediction_rules: Array<{
    rule_id: string;
    condition: string;
    predicted_cross_reactivity: string;
    evidence_basis: string;
    pmids: string[];
    notes: string;
  }>;
}

export const drugDatabase = rawDb as unknown as CrossReactDatabase;
