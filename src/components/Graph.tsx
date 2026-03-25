import { useCallback, useEffect, useMemo, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import ForceGraph3D from 'react-force-graph-3d';
import { buildGraphElements } from '../data/graphData';
import type { CrossReactEdgeData, DrugNodeData, FilterState } from '../types';

export type GraphViewMode = '2d' | '3d';

interface GraphProps {
  selectedDrug: string | null;
  onDrugSelect: (drugId: string) => void;
  onDrugHover: (drugId: string | null, x?: number, y?: number) => void;
  filters: FilterState;
  viewMode: GraphViewMode;
}

interface GraphNode extends DrugNodeData {
  x: number;
  y: number;
  z: number;
}

interface GraphLink extends Omit<CrossReactEdgeData, 'source' | 'target'> {
  source: string | GraphNode;
  target: string | GraphNode;
}

const GROUP_POSITIONS_3D: Record<string, { x: number; y: number; z: number }> = {
  'group-penicillin-natural-': { x: -900, y: -500, z: 900 },
  'group-penicillin-amino-': { x: -550, y: -500, z: 720 },
  'group-penicillin-anti-staph-': { x: -900, y: -280, z: 620 },
  'group-penicillin-extended-': { x: -550, y: -280, z: 520 },

  'group-cephalosporin-1g': { x: -100, y: -500, z: 760 },
  'group-cephalosporin-2g': { x: 300, y: -500, z: 620 },
  'group-cephalosporin-3g': { x: 740, y: -560, z: 460 },
  'group-cephalosporin-4g': { x: 1180, y: -320, z: 280 },
  'group-cephalosporin-5g': { x: 1180, y: -730, z: 120 },

  'group-carbapenem': { x: 360, y: -220, z: 180 },
  'group-monobactam': { x: 800, y: -220, z: 40 },

  'group-glycopeptide': { x: -860, y: 140, z: -120 },
  'group-oxazolidinone': { x: -560, y: 140, z: -240 },
  'group-lincosamide': { x: -240, y: 140, z: -340 },

  'group-fluoroquinolone': { x: 120, y: 140, z: -460 },
  'group-tetracycline': { x: 500, y: 140, z: -560 },
  'group-macrolide': { x: 860, y: 140, z: -660 },
  'group-sulfonamide': { x: 1260, y: 140, z: -760 },

  'group-aminoglycoside': { x: 140, y: 430, z: -820 },
  'group-nitroimidazole': { x: 520, y: 430, z: -900 },
  'group-lipopeptide': { x: -860, y: 430, z: -760 },
};

const EDGE_COLORS: Record<CrossReactEdgeData['crossReactivity'], string> = {
  high: '#ef4444',
  disputed: '#eab308',
  moderate: '#f97316',
  low: '#6b7280',
};

const EDGE_WIDTH: Record<CrossReactEdgeData['crossReactivity'], number> = {
  high: 1.9,
  disputed: 1.6,
  moderate: 1.2,
  low: 0.9,
};

function parseHexColor(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return [148, 163, 184];
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return [r, g, b];
}

function applyAlpha(hex: string, alpha: number): string {
  const [r, g, b] = parseHexColor(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function endpointId(endpoint: string | GraphNode): string {
  return typeof endpoint === 'string' ? endpoint : endpoint.id;
}

export function Graph({ selectedDrug, onDrugSelect, onDrugHover, filters, viewMode }: GraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);

  const baseGraph = useMemo(() => {
    const { nodes, edges, nodeParents } = buildGraphElements();

    const groupChildCounts: Record<string, number> = {};
    const groupChildIndex: Record<string, number> = {};

    for (const node of nodes) {
      const parentId = nodeParents[node.id];
      if (parentId) {
        groupChildCounts[parentId] = (groupChildCounts[parentId] ?? 0) + 1;
      }
    }

    const nodes3d: GraphNode[] = nodes.map((node) => {
      const parentId = nodeParents[node.id];
      const center = parentId && GROUP_POSITIONS_3D[parentId] ? GROUP_POSITIONS_3D[parentId] : { x: 0, y: 0, z: 0 };

      if (!parentId) {
        return { ...node, x: center.x, y: center.y, z: center.z };
      }

      const idx = groupChildIndex[parentId] ?? 0;
      groupChildIndex[parentId] = idx + 1;

      const total = groupChildCounts[parentId] ?? 1;
      const cube = Math.max(2, Math.ceil(Math.cbrt(total)));
      const layerSize = cube * cube;
      const layers = Math.ceil(total / layerSize);
      const layer = Math.floor(idx / layerSize);
      const inLayer = idx % layerSize;
      const row = Math.floor(inLayer / cube);
      const col = inLayer % cube;

      const spacing = 100;
      const depthSpacing = 140;
      const offsetX = (col - (cube - 1) / 2) * spacing;
      const offsetY = (row - (cube - 1) / 2) * spacing;
      const offsetZ = (layer - (layers - 1) / 2) * depthSpacing;

      return {
        ...node,
        x: center.x + offsetX,
        y: center.y + offsetY,
        z: center.z + offsetZ,
      };
    });

    return {
      nodes: nodes3d,
      links: edges as GraphLink[],
    };
  }, []);

  const visibleGraph = useMemo(() => {
    const visibleNodeIds = new Set(
      baseGraph.nodes.filter((node) => filters.classes[node.drugClass] !== false).map((node) => node.id),
    );

    const links = baseGraph.links.filter(
      (link) =>
        filters.risks[link.crossReactivity] &&
        visibleNodeIds.has(endpointId(link.source)) &&
        visibleNodeIds.has(endpointId(link.target)),
    );

    const nodes = baseGraph.nodes.filter((node) => visibleNodeIds.has(node.id));
    return { nodes, links };
  }, [baseGraph, filters]);

  const selectionContext = useMemo(() => {
    if (!selectedDrug) {
      return {
        neighborNodeIds: new Set<string>(),
        selectedLinkIds: new Set<string>(),
      };
    }

    const neighborNodeIds = new Set<string>();
    const selectedLinkIds = new Set<string>();

    for (const link of visibleGraph.links) {
      const sourceId = endpointId(link.source);
      const targetId = endpointId(link.target);
      if (sourceId === selectedDrug) {
        neighborNodeIds.add(targetId);
        selectedLinkIds.add(link.id);
      } else if (targetId === selectedDrug) {
        neighborNodeIds.add(sourceId);
        selectedLinkIds.add(link.id);
      }
    }

    return { neighborNodeIds, selectedLinkIds };
  }, [selectedDrug, visibleGraph.links]);

  const focusSelectedNode = useCallback(() => {
    const api = graphRef.current;
    if (!api || !selectedDrug) return;

    const target = visibleGraph.nodes.find((node) => node.id === selectedDrug);
    if (!target) return;

    if (viewMode === '3d') {
      api.cameraPosition(
        { x: target.x + 220, y: target.y - 180, z: target.z + 640 },
        { x: target.x, y: target.y, z: target.z },
        900,
      );
      return;
    }

    api.centerAt?.(target.x, target.y, 700);
    api.zoom?.(2.1, 700);
  }, [selectedDrug, viewMode, visibleGraph.nodes]);

  useEffect(() => {
    const api = graphRef.current;
    if (!api) return;

    if (viewMode === '3d') {
      api.cameraPosition({ x: 1400, y: -900, z: 1700 }, undefined, 0);
      const controls = api.controls?.();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.35;
      }
      return;
    }

    api.centerAt?.(0, 0, 0);
    api.zoom?.(0.75, 0);
  }, [viewMode]);

  useEffect(() => {
    focusSelectedNode();
  }, [focusSelectedNode]);

  useEffect(() => {
    if (!selectedDrug) onDrugHover(null);
  }, [selectedDrug, onDrugHover]);

  const handleNodeHover = useCallback(
    (node: unknown) => {
      const container = containerRef.current;
      if (!container) return;

      if (!node) {
        container.style.cursor = 'default';
        onDrugHover(null);
        return;
      }

      container.style.cursor = 'pointer';
      const drugNode = node as GraphNode;
      const api = graphRef.current;

      let screenPos: { x: number; y: number } | null = null;
      if (api?.graph2ScreenCoords) {
        try {
          screenPos = api.graph2ScreenCoords(drugNode.x, drugNode.y, drugNode.z);
        } catch {
          screenPos = api.graph2ScreenCoords(drugNode.x, drugNode.y);
        }
      }

      if (!screenPos) {
        onDrugHover(drugNode.id);
        return;
      }

      const rect = container.getBoundingClientRect();
      onDrugHover(drugNode.id, rect.left + screenPos.x, rect.top + screenPos.y);
    },
    [onDrugHover],
  );

  const commonProps = {
    ref: graphRef,
    graphData: visibleGraph,
    backgroundColor: '#020617',
    nodeRelSize: 4.5,
    linkCurvature: 0.12,
    linkOpacity: 0.75,
    warmupTicks: 80,
    cooldownTicks: 120,
    d3VelocityDecay: 0.22,
    enableNodeDrag: false,
    onNodeClick: (node: unknown) => onDrugSelect((node as GraphNode).id),
    onNodeHover: handleNodeHover,
    nodeLabel: (node: unknown) => {
      const n = node as GraphNode;
      return `<div style=\"padding:6px 8px;background:#0f172a;border:1px solid #334155;border-radius:8px;color:#e2e8f0\">${n.label}</div>`;
    },
    nodeVal: (node: unknown) => {
      const n = node as GraphNode;
      if (selectedDrug && n.id === selectedDrug) return 11;
      if (selectedDrug && selectionContext.neighborNodeIds.has(n.id)) return 8.5;
      return 6.5;
    },
    nodeColor: (node: unknown) => {
      const n = node as GraphNode;
      if (!selectedDrug) return n.color;
      if (n.id === selectedDrug || selectionContext.neighborNodeIds.has(n.id)) return n.color;
      return applyAlpha('#334155', 0.25);
    },
    linkColor: (link: unknown) => {
      const edge = link as GraphLink;
      const baseColor = EDGE_COLORS[edge.crossReactivity];
      if (!selectedDrug) return baseColor;
      if (selectionContext.selectedLinkIds.has(edge.id)) return baseColor;
      return applyAlpha('#334155', 0.18);
    },
    linkWidth: (link: unknown) => {
      const edge = link as GraphLink;
      const width = EDGE_WIDTH[edge.crossReactivity];
      if (!selectedDrug) return width;
      return selectionContext.selectedLinkIds.has(edge.id) ? width + 0.6 : 0.45;
    },
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: 'radial-gradient(ellipse at center, #0f172a 0%, #020617 70%)' }}
    >
      {viewMode === '3d' ? (
        <ForceGraph3D
          {...commonProps}
          numDimensions={3}
          showNavInfo={false}
        />
      ) : (
        <ForceGraph2D
          {...commonProps}
        />
      )}
    </div>
  );
}
