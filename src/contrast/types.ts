import type { CrossReactivity } from '../types';

export interface ContrastNodeData {
  id: string;
  label: string;
  groupId: string;
  groupName: string;
  ionicity: string;
  structure: string;
  osmolalityClass: string;
  color: string;
}

export interface ContrastEdgeData {
  id: string;
  source: string;
  target: string;
  crossReactivity: CrossReactivity;
  pmids: string[];
  clinicalNote?: string;
}

export interface ContrastGraphState {
  nodes: ContrastNodeData[];
  edges: ContrastEdgeData[];
  parentNodes: Array<{ id: string; label: string; isGroup: boolean }>;
  nodeParents: Record<string, string>;
}

export interface ContrastInfo {
  agentId: string;
  agentName: string;
  crossReactivity: CrossReactivity;
  pmids: string[];
  groupName: string;
  clinicalNote?: string;
}

export interface ContrastFilterState {
  groups: Record<string, boolean>;
  risks: {
    high: boolean;
    disputed: boolean;
    moderate: boolean;
    low: boolean;
  };
}
