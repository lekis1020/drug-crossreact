import type { CrossReactivity } from '../types';

export interface OncologyNodeData {
  id: string;
  label: string;
  groupId: string;
  groupName: string;
  drugClass: string;
  formulation: string;
  mechanism: string;
  color: string;
}

export interface OncologyEdgeData {
  id: string;
  source: string;
  target: string;
  crossReactivity: CrossReactivity;
  pmids: string[];
  clinicalNote?: string;
}

export interface OncologyGraphState {
  nodes: OncologyNodeData[];
  edges: OncologyEdgeData[];
  parentNodes: Array<{ id: string; label: string; isGroup: boolean }>;
  nodeParents: Record<string, string>;
}

export interface OncologyInfo {
  agentId: string;
  agentName: string;
  crossReactivity: CrossReactivity;
  pmids: string[];
  groupName: string;
  clinicalNote?: string;
}

export interface OncologyFilterState {
  groups: Record<string, boolean>;
  risks: {
    high: boolean;
    disputed: boolean;
    moderate: boolean;
    low: boolean;
  };
}
