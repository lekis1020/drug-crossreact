import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import type { Core, EventObject } from 'cytoscape';
// @ts-ignore
import coseBilkent from 'cytoscape-cose-bilkent';
import { buildGraphElements } from '../data/graphData';
import type { FilterState, DrugClass } from '../types';

cytoscape.use(coseBilkent);

interface GraphProps {
  selectedDrug: string | null;
  onDrugSelect: (drugId: string) => void;
  onDrugHover: (drugId: string | null, x?: number, y?: number) => void;
  filters: FilterState;
}

export function Graph({ selectedDrug, onDrugSelect, onDrugHover, filters }: GraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const { nodes, edges, parentNodes, nodeParents } = buildGraphElements();

    const elements: cytoscape.ElementDefinition[] = [
      // Parent (compound) nodes
      ...parentNodes.map(p => ({
        data: { id: p.id, label: p.label, isGroup: 'true' },
      })),
      // Drug nodes with parent reference
      ...nodes.map(n => ({
        data: {
          id: n.id,
          label: n.label,
          drugClass: n.drugClass,
          r1Group: n.r1Group ?? '',
          color: n.color,
          parent: nodeParents[n.id] || undefined,
        },
      })),
      // Edges
      ...edges.map(e => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          crossReactivity: e.crossReactivity,
        },
      })),
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        // Compound (parent/group) nodes
        {
          selector: 'node[isGroup = "true"]',
          style: {
            'background-color': 'rgba(30, 41, 59, 0.4)',
            'background-opacity': 0.4,
            'border-width': 1.5,
            'border-color': 'rgba(100, 116, 139, 0.4)',
            'border-style': 'dashed' as any,
            shape: 'round-rectangle',
            'padding': '20px',
            label: 'data(label)',
            'font-size': '22px',
            'font-weight': 'bold',
            color: 'rgba(148, 163, 184, 0.8)',
            'text-valign': 'top',
            'text-halign': 'center',
            'text-margin-y': -8,
            'text-outline-width': 0,
          } as any,
        },
        // Drug nodes
        {
          selector: 'node[!isGroup]',
          style: {
            'background-color': 'data(color)',
            label: 'data(label)',
            width: 44,
            height: 44,
            'font-size': '18px',
            color: '#cbd5e1',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 8,
            'text-outline-width': 3,
            'text-outline-color': '#0f172a',
            'border-width': 1.5,
            'border-color': 'data(color)',
            'border-opacity': 0.5,
            'transition-property': 'opacity, width, height, border-width, border-opacity',
            'transition-duration': 200,
          } as any,
        },
        // Edge styles
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
            width: 1,
            'line-color': '#6b7280',
            'line-style': 'dashed',
            'line-dash-pattern': [4, 6],
            opacity: 0.4,
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
        // Selection states
        {
          selector: 'node.selected',
          style: {
            width: 66,
            height: 66,
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
        {
          selector: 'node.dimmed',
          style: { opacity: 0.12 },
        },
        {
          selector: 'edge.dimmed',
          style: { opacity: 0.05 },
        },
      ],
      layout: {
        name: 'cose-bilkent',
        animate: false,
        nodeDimensionsIncludeLabels: true,
        idealEdgeLength: 150,
        nodeRepulsion: 12000,
        gravity: 0.25,
        numIter: 3000,
        tile: false,
        randomize: true,
      } as Parameters<Core['layout']>[0],
      minZoom: 0.15,
      maxZoom: 4,
      wheelSensitivity: 0.25,
    });

    cy.on('tap', 'node[!isGroup]', (e: EventObject) => {
      onDrugSelect(e.target.id());
    });

    cy.on('mouseover', 'node[!isGroup]', (e: EventObject) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pos = e.target.renderedPosition() as { x: number; y: number };
      onDrugHover(e.target.id(), rect.left + pos.x, rect.top + pos.y);
      (containerRef.current as HTMLElement).style.cursor = 'pointer';
    });

    cy.on('mouseout', 'node[!isGroup]', () => {
      onDrugHover(null);
      if (containerRef.current) (containerRef.current as HTMLElement).style.cursor = 'default';
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, []);

  // Highlight selection
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.elements().removeClass('selected dimmed highlighted');

    if (selectedDrug) {
      const selected = cy.getElementById(selectedDrug);
      if (selected.length) {
        const connectedEdges = selected.connectedEdges();
        const connectedNodes = connectedEdges.connectedNodes().not(selected);

        // Only dim non-group nodes
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
      }
    }
  }, [selectedDrug]);

  // Apply class/risk filters
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.nodes('[!isGroup]').forEach(node => {
      const cls = node.data('drugClass') as DrugClass;
      if (filters.classes[cls] === false) {
        node.style('display', 'none');
      } else {
        node.style('display', 'element');
      }
    });

    cy.edges().forEach(edge => {
      const cr = edge.data('crossReactivity') as 'high' | 'moderate' | 'low' | 'disputed';
      const riskVisible = filters.risks[cr];
      const nodesVisible = edge.source().visible() && edge.target().visible();
      if (riskVisible && nodesVisible) {
        edge.style('display', 'element');
      } else {
        edge.style('display', 'none');
      }
    });
  }, [filters]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: '#0f172a' }}
    />
  );
}
