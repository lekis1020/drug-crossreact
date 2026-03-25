import rawDb from '../../../contrast_crossreact_db.json';

export interface ContrastAgent {
  id: string;
  label: string;
  ionicity: string;
  structure: string;
  osmolality_class: string;
}

export interface ContrastAgentGroup {
  group_id: string;
  name: string;
  agents: string[];
}

export interface ContrastPair {
  agent_a: string;
  agent_b: string;
  cross_reactivity: string;
  evidence_pmids: string[];
  clinical_note?: string | null;
}

export interface ContrastDatabase {
  metadata: {
    created?: string;
    version?: string;
    scope?: string;
    status?: string;
    last_database_update_at?: string | null;
    last_literature_monitoring_at?: string | null;
    [key: string]: unknown;
  };
  agent_groups: ContrastAgentGroup[];
  agents: ContrastAgent[];
  literature_confirmed_pairs: ContrastPair[];
  risk_rules: Array<{
    rule_id: string;
    condition: string;
    predicted_cross_reactivity: string;
    notes: string;
    pmids: string[];
  }>;
  literature_monitoring?: {
    strategy?: string;
    query?: string | null;
    checked_window_days?: number;
    max_results?: number;
    checked_at?: string | null;
    records?: Array<{
      pmid: string;
      title?: string;
      journal?: string;
      pubdate?: string;
      doi?: string | null;
      status?: string;
      pubmed_url?: string;
    }>;
  };
}

export const contrastDatabase = rawDb as ContrastDatabase;
