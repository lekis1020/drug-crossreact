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

export interface CrossReactDatabase {
  metadata: DatabaseMetadata;
  r1_groups: RawR1Group[];
  drug_r1_map: Record<string, RawDrugR1Entry>;
  drug_structures: Record<string, RawDrugStructure>;
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
