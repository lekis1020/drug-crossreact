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

  // Initialize cytoscape once
  useEffect(() => {
    if (!containerRef.current) return;

    const { nodes, edges } = buildGraphElements();

    const elements = [
      ...nodes.map(n => ({
        data: {
          id: n.id,
          label: n.label,
          drugClass: n.drugClass,
          r1Group: n.r1Group ?? '',
          color: n.color,
        },
      })),
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
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            label: 'data(label)',
            width: 34,
            height: 34,
            'font-size': '10px',
            color: '#cbd5e1',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 5,
            'text-outline-width': 2,
            'text-outline-color': '#0f172a',
            'border-width': 1.5,
            'border-color': 'data(color)',
            'border-opacity': 0.5,
            'transition-property': 'opacity, width, height, border-width, border-opacity',
            'transition-duration': 200,
          },
        },
        {
          selector: 'edge[crossReactivity = "high"]',
          style: {
            width: 2.5,
            'line-color': '#ef4444',
            'line-style': 'solid',
            opacity: 0.75,
            'curve-style': 'bezier',
          },
        },
        {
          selector: 'edge[crossReactivity = "moderate"]',
          style: {
            width: 1.5,
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
            width: 2,
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
            width: 50,
            height: 50,
            'font-size': '12px',
            'border-width': 3,
            'border-color': '#ffffff',
            'border-opacity': 1,
            'z-index': 999,
          },
        },
        {
          selector: 'node.highlighted',
          style: {
            'border-width': 2.5,
            'border-color': '#ffffff',
            'border-opacity': 0.7,
            'z-index': 100,
          },
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
        idealEdgeLength: 130,
        nodeRepulsion: 9000,
        gravity: 0.3,
        numIter: 2500,
        tile: false,
        randomize: true,
      } as Parameters<Core['layout']>[0],
      minZoom: 0.25,
      maxZoom: 3,
      wheelSensitivity: 0.25,
    });

    cy.on('tap', 'node', (e: EventObject) => {
      onDrugSelect(e.target.id());
    });

    cy.on('mouseover', 'node', (e: EventObject) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pos = e.target.renderedPosition() as { x: number; y: number };
      onDrugHover(e.target.id(), rect.left + pos.x, rect.top + pos.y);
      (containerRef.current as HTMLElement).style.cursor = 'pointer';
    });

    cy.on('mouseout', 'node', () => {
      onDrugHover(null);
      if (containerRef.current) (containerRef.current as HTMLElement).style.cursor = 'default';
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, []); // intentionally empty — only initialize once

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

        cy.elements().addClass('dimmed');
        selected.removeClass('dimmed').addClass('selected');
        connectedNodes.removeClass('dimmed').addClass('highlighted');
        connectedEdges.removeClass('dimmed');

        // Pan to selected node
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

    cy.nodes().forEach(node => {
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
