import { contrastDatabase } from './contrastDatabase';
import type { ContrastEdgeData, ContrastGraphState, ContrastInfo, ContrastNodeData } from '../types';

const GROUP_COLORS: string[] = ['#38bdf8', '#a78bfa', '#f59e0b', '#22c55e', '#f97316', '#e879f9'];

const RISK_PRIORITY: Record<ContrastEdgeData['crossReactivity'], number> = {
  high: 4,
  disputed: 3,
  moderate: 2,
  low: 1,
};

function edgeKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function toRisk(value: string): ContrastEdgeData['crossReactivity'] | null {
  const key = value.toLowerCase().trim();
  if (key === 'high' || key === 'disputed' || key === 'moderate' || key === 'low') return key;
  return null;
}

let cache: ContrastGraphState | null = null;

export function buildContrastGraphElements(): ContrastGraphState {
  if (cache) return cache;

  const groupColorMap = new Map(
    contrastDatabase.agent_groups.map((group, index) => [group.group_id, GROUP_COLORS[index % GROUP_COLORS.length]]),
  );

  const nodeParents: Record<string, string> = {};
  const parentNodes = contrastDatabase.agent_groups.map((group) => ({
    id: `group-${group.group_id}`,
    label: group.name,
    isGroup: true,
  }));

  for (const group of contrastDatabase.agent_groups) {
    for (const agentId of group.agents) {
      nodeParents[agentId] = `group-${group.group_id}`;
    }
  }

  const nodes: ContrastNodeData[] = contrastDatabase.agents.map((agent) => {
    const group = contrastDatabase.agent_groups.find((g) => g.agents.includes(agent.id));
    return {
      id: agent.id,
      label: agent.label,
      groupId: group?.group_id ?? 'ungrouped',
      groupName: group?.name ?? 'Unclassified',
      ionicity: agent.ionicity,
      structure: agent.structure,
      osmolalityClass: agent.osmolality_class,
      color: groupColorMap.get(group?.group_id ?? '') ?? '#94a3b8',
    };
  });

  const edgeMap = new Map<string, ContrastEdgeData>();

  const upsertEdge = (edge: ContrastEdgeData) => {
    const key = edgeKey(edge.source, edge.target);
    const existing = edgeMap.get(key);
    if (!existing) {
      edgeMap.set(key, { ...edge, pmids: [...new Set(edge.pmids)] });
      return;
    }

    const preferred =
      RISK_PRIORITY[edge.crossReactivity] > RISK_PRIORITY[existing.crossReactivity] ? edge : existing;

    edgeMap.set(key, {
      ...preferred,
      pmids: [...new Set([...(existing.pmids ?? []), ...(edge.pmids ?? [])])],
      clinicalNote: [existing.clinicalNote, edge.clinicalNote].filter(Boolean).join(' | ') || undefined,
    });
  };

  // Seed predicted within-group edges for template usability.
  const templateRule = contrastDatabase.risk_rules[0];
  const predictedRisk = toRisk(templateRule?.predicted_cross_reactivity ?? '') ?? 'disputed';
  for (const group of contrastDatabase.agent_groups) {
    for (let i = 0; i < group.agents.length; i += 1) {
      for (let j = i + 1; j < group.agents.length; j += 1) {
        const source = group.agents[i];
        const target = group.agents[j];
        upsertEdge({
          id: `edge-rule-${source}-${target}`,
          source,
          target,
          crossReactivity: predictedRisk,
          pmids: templateRule?.pmids ?? [],
          clinicalNote: templateRule?.notes
            ? `${templateRule.notes} (${group.name})`
            : `Template predicted link (${group.name}). Replace with reviewed literature evidence.`,
        });
      }
    }
  }

  // Add reviewed literature pairs (agent-level).
  const availableIds = new Set(nodes.map((n) => n.id));
  for (const pair of contrastDatabase.literature_confirmed_pairs) {
    const risk = toRisk(pair.cross_reactivity);
    if (!risk) continue;
    if (!availableIds.has(pair.agent_a) || !availableIds.has(pair.agent_b)) continue;

    upsertEdge({
      id: `edge-lit-${pair.agent_a}-${pair.agent_b}`,
      source: pair.agent_a,
      target: pair.agent_b,
      crossReactivity: risk,
      pmids: pair.evidence_pmids ?? [],
      clinicalNote: pair.clinical_note ?? undefined,
    });
  }

  cache = {
    nodes,
    edges: [...edgeMap.values()],
    parentNodes,
    nodeParents,
  };

  return cache;
}

export function getCrossReactiveAgents(selectedId: string): ContrastInfo[] {
  const { nodes, edges } = buildContrastGraphElements();
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const result: ContrastInfo[] = [];

  for (const edge of edges) {
    const otherId = edge.source === selectedId ? edge.target : edge.target === selectedId ? edge.source : null;
    if (!otherId) continue;

    const agent = nodeMap.get(otherId);
    if (!agent) continue;

    result.push({
      agentId: agent.id,
      agentName: agent.label,
      crossReactivity: edge.crossReactivity,
      pmids: edge.pmids,
      groupName: agent.groupName,
      clinicalNote: edge.clinicalNote,
    });
  }

  const riskOrder: Record<ContrastEdgeData['crossReactivity'], number> = {
    high: 0,
    disputed: 1,
    moderate: 2,
    low: 3,
  };

  return result.sort((a, b) => {
    const ra = riskOrder[a.crossReactivity] ?? 4;
    const rb = riskOrder[b.crossReactivity] ?? 4;
    if (ra !== rb) return ra - rb;
    return a.agentName.localeCompare(b.agentName);
  });
}

export function getNoKnownSignalAlternatives(selectedId: string): ContrastNodeData[] {
  const { nodes, edges } = buildContrastGraphElements();
  const connected = new Set<string>();

  for (const edge of edges) {
    if (edge.source === selectedId) connected.add(edge.target);
    if (edge.target === selectedId) connected.add(edge.source);
  }

  return nodes
    .filter((node) => node.id !== selectedId && !connected.has(node.id))
    .sort((a, b) => a.groupName.localeCompare(b.groupName) || a.label.localeCompare(b.label));
}

export function getContrastGroupLabel(groupId: string): string {
  return groupMapFallback(groupId);
}

function groupMapFallback(groupId: string): string {
  const match = contrastDatabase.agent_groups.find((group) => group.group_id === groupId);
  return match?.name ?? 'Unclassified';
}
