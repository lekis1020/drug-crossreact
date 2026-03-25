import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import type { Core, EventObject } from 'cytoscape';
// @ts-ignore
import coseBilkent from 'cytoscape-cose-bilkent';
import { buildContrastGraphElements } from '../data/contrastGraphData';
import type { ContrastFilterState } from '../types';

cytoscape.use(coseBilkent);

interface ContrastGraphProps {
  selectedAgent: string | null;
  onAgentSelect: (agentId: string) => void;
  onAgentHover: (agentId: string | null, x?: number, y?: number) => void;
  filters: ContrastFilterState;
}

export function ContrastGraph({ selectedAgent, onAgentSelect, onAgentHover, filters }: ContrastGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const { nodes, edges, parentNodes, nodeParents } = buildContrastGraphElements();

    const GROUP_POSITIONS: Record<string, { x: number; y: number }> = {};
    const spacing = 520;
    const startX = -((parentNodes.length - 1) * spacing) / 2;
    parentNodes.forEach((group, index) => {
      GROUP_POSITIONS[group.id] = { x: startX + index * spacing, y: -40 };
    });

    const nodePositions: Record<string, { x: number; y: number }> = {};
    const groupChildCounts: Record<string, number> = {};
    const groupChildIndex: Record<string, number> = {};

    for (const node of nodes) {
      const parentId = nodeParents[node.id];
      if (!parentId) continue;
      groupChildCounts[parentId] = (groupChildCounts[parentId] ?? 0) + 1;
    }

    for (const node of nodes) {
      const parentId = nodeParents[node.id];
      if (!parentId || !GROUP_POSITIONS[parentId]) continue;
      const center = GROUP_POSITIONS[parentId];
      const index = groupChildIndex[parentId] ?? 0;
      groupChildIndex[parentId] = index + 1;

      const total = groupChildCounts[parentId] ?? 1;
      const cols = Math.max(1, Math.ceil(Math.sqrt(total)));
      const row = Math.floor(index / cols);
      const col = index % cols;
      const spacingInGroup = 100;
      const offsetX = (col - (cols - 1) / 2) * spacingInGroup;
      const offsetY = row * spacingInGroup;

      nodePositions[node.id] = { x: center.x + offsetX, y: center.y + offsetY };
    }

    const elements: cytoscape.ElementDefinition[] = [
      ...parentNodes.map((node) => ({
        data: { id: node.id, label: node.label, isGroup: 'true' },
      })),
      ...nodes.map((node) => ({
        data: {
          id: node.id,
          label: node.label,
          color: node.color,
          groupId: node.groupId,
          parent: nodeParents[node.id] || undefined,
        },
        position: nodePositions[node.id] || { x: 0, y: 0 },
      })),
      ...edges.map((edge) => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          crossReactivity: edge.crossReactivity,
        },
      })),
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node[isGroup = "true"]',
          style: {
            'background-color': 'rgba(30, 41, 59, 0.25)',
            'background-opacity': 0.25,
            'border-width': 1,
            'border-color': 'rgba(100, 116, 139, 0.25)',
            'border-style': 'dashed' as any,
            shape: 'round-rectangle',
            'padding': '28px',
            label: 'data(label)',
            'font-size': '16px',
            'font-weight': 'bold',
            color: 'rgba(148, 163, 184, 0.6)',
            'text-valign': 'top',
            'text-halign': 'center',
            'text-margin-y': -6,
            'text-outline-width': 0,
            'text-background-color': '#0f172a',
            'text-background-opacity': 0.7,
            'text-background-padding': '4px',
            'text-background-shape': 'round-rectangle',
          } as any,
        },
        {
          selector: 'node[!isGroup]',
          style: {
            'background-color': 'data(color)',
            label: 'data(label)',
            width: 48,
            height: 48,
            'font-size': '17px',
            color: '#cbd5e1',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 8,
            'text-outline-width': 3,
            'text-outline-color': '#0f172a',
            'border-width': 2,
            'border-color': 'data(color)',
            'border-opacity': 0.55,
            'transition-property': 'opacity, width, height, border-width, border-opacity',
            'transition-duration': 200,
          } as any,
        },
        {
          selector: 'edge[crossReactivity = "high"]',
          style: {
            width: 3,
            'line-color': '#ef4444',
            'line-style': 'solid',
            opacity: 0.75,
            'curve-style': 'bezier',
          },
        },
        {
          selector: 'edge[crossReactivity = "moderate"]',
          style: {
            width: 2,
            'line-color': '#f97316',
            'line-style': 'dashed',
            'line-dash-pattern': [8, 5],
            opacity: 0.6,
            'curve-style': 'bezier',
          },
        },
        {
          selector: 'edge[crossReactivity = "low"]',
          style: {
            width: 1.5,
            'line-color': '#6b7280',
            'line-style': 'dashed',
            'line-dash-pattern': [4, 6],
            opacity: 0.5,
            'curve-style': 'bezier',
          },
        },
        {
          selector: 'edge[crossReactivity = "disputed"]',
          style: {
            width: 2.5,
            'line-color': '#eab308',
            'line-style': 'dashed',
            'line-dash-pattern': [3, 3],
            opacity: 0.8,
            'curve-style': 'bezier',
          },
        },
        {
          selector: 'node.selected',
          style: {
            width: 68,
            height: 68,
            'font-size': '22px',
            'border-width': 3,
            'border-color': '#ffffff',
            'border-opacity': 1,
            'z-index': 999,
          } as any,
        },
        {
          selector: 'node.highlighted',
          style: {
            'border-width': 2.5,
            'border-color': '#ffffff',
            'border-opacity': 0.7,
            'z-index': 100,
          } as any,
        },
        { selector: 'node.dimmed', style: { opacity: 0.12 } },
        { selector: 'edge.dimmed', style: { opacity: 0.05 } },
      ],
      layout: { name: 'preset' } as Parameters<Core['layout']>[0],
      minZoom: 0.25,
      maxZoom: 4,
      wheelSensitivity: 0.25,
    });

    let baseGroupFontSize = 20;
    let zoomFramePending = false;

    const applyResponsiveGroupLabelStyle = () => {
      const zoom = Math.max(0.25, cy.zoom());
      const zoomCompensation = Math.pow(zoom, -0.85);
      const adjustedFontSize = Math.round(Math.max(baseGroupFontSize, Math.min(52, baseGroupFontSize * zoomCompensation)));
      const backgroundPadding = Math.round(Math.max(4, Math.min(12, adjustedFontSize * 0.28)));

      cy.style()
        .selector('node[isGroup = "true"]')
        .style({
          'font-size': `${adjustedFontSize}px`,
          'text-background-padding': `${backgroundPadding}px`,
        })
        .update();
    };

    const scheduleGroupLabelUpdate = () => {
      if (zoomFramePending) return;
      zoomFramePending = true;
      requestAnimationFrame(() => {
        zoomFramePending = false;
        applyResponsiveGroupLabelStyle();
      });
    };

    const setBaseGroupFontSize = (containerWidth: number) => {
      baseGroupFontSize = Math.max(16, Math.min(28, Math.round(containerWidth / 70)));
      applyResponsiveGroupLabelStyle();
    };

    setBaseGroupFontSize(containerRef.current.clientWidth);

    const resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? containerRef.current?.clientWidth ?? 1200;
      setBaseGroupFontSize(width);
    });
    resizeObserver.observe(containerRef.current);

    cy.on('zoom', scheduleGroupLabelUpdate);

    cy.on('tap', 'node[!isGroup]', (event: EventObject) => {
      onAgentSelect(event.target.id());
    });

    cy.on('mouseover', 'node[!isGroup]', (event: EventObject) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const position = event.target.renderedPosition() as { x: number; y: number };
      onAgentHover(event.target.id(), rect.left + position.x, rect.top + position.y);
      (containerRef.current as HTMLElement).style.cursor = 'pointer';
    });

    cy.on('mouseout', 'node[!isGroup]', () => {
      onAgentHover(null);
      if (containerRef.current) (containerRef.current as HTMLElement).style.cursor = 'default';
    });

    cyRef.current = cy;

    return () => {
      cy.off('zoom', scheduleGroupLabelUpdate);
      resizeObserver.disconnect();
      cy.destroy();
      cyRef.current = null;
    };
  }, [onAgentHover, onAgentSelect]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.elements().removeClass('selected dimmed highlighted');

    if (!selectedAgent) return;

    const selected = cy.getElementById(selectedAgent);
    if (!selected.length) return;

    const connectedEdges = selected.connectedEdges();
    const connectedNodes = connectedEdges.connectedNodes().not(selected);

    cy.nodes('[!isGroup]').addClass('dimmed');
    cy.edges().addClass('dimmed');

    selected.removeClass('dimmed').addClass('selected');
    connectedNodes.removeClass('dimmed').addClass('highlighted');
    connectedEdges.removeClass('dimmed');

    cy.animate({
      center: { eles: selected },
      duration: 400,
      easing: 'ease-in-out-cubic',
    } as Parameters<Core['animate']>[0]);
  }, [selectedAgent]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.nodes('[!isGroup]').forEach((node) => {
      const groupId = node.data('groupId') as string;
      const isVisible = filters.groups[groupId] !== false;
      node.style('display', isVisible ? 'element' : 'none');
    });

    cy.edges().forEach((edge) => {
      const risk = edge.data('crossReactivity') as keyof ContrastFilterState['risks'];
      const riskVisible = filters.risks[risk];
      const nodesVisible = edge.source().visible() && edge.target().visible();
      edge.style('display', riskVisible && nodesVisible ? 'element' : 'none');
    });
  }, [filters]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: 'radial-gradient(ellipse at center, #0f172a 0%, #020617 70%)' }}
    />
  );
}
