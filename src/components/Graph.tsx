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


    // === Preset positions: logical group arrangement ===
    // Layout: Beta-lactams top, Non-BL bottom grouped by spectrum
    // Non-BL arrangement: 
    //   Left (Gram+/MRSA) → Center (Broad) → Right (Gram-/Pseudomonas)
    const GROUP_POSITIONS: Record<string, { x: number; y: number }> = {
      // === Row 1: Penicillins ===
      'group-penicillin-natural-':     { x: -900, y: -600 },
      'group-penicillin-amino-':       { x: -550, y: -600 },
      'group-penicillin-anti-staph-':  { x: -900, y: -350 },
      'group-penicillin-extended-':    { x: -550, y: -350 },

      // === Row 1-2: Cephalosporins (1G→5G left to right) ===
      'group-cephalosporin-1g':         { x: -50,  y: -600 },
      'group-cephalosporin-2g':         { x: 350,  y: -600 },
      'group-cephalosporin-3g':         { x: 750,  y: -650 },
      'group-cephalosporin-4g':         { x: 1250, y: -400 },
      'group-cephalosporin-5g':         { x: 1250, y: -750 },

      // === Row 2: Other beta-lactams ===
      'group-carbapenem':               { x: 350,  y: -250 },
      'group-monobactam':               { x: 800,  y: -250 },

      // === Row 3: Non-BL — Gram+ / MRSA cover (left) ===
      'group-glycopeptide':             { x: -900, y: 150 },    // Vancomycin = MRSA
      'group-oxazolidinone':            { x: -550, y: 150 },    // Linezolid = MRSA
      'group-lincosamide':              { x: -250, y: 150 },    // Clindamycin = Gram+/anaerobe

      // === Row 3: Non-BL — Broad spectrum (center) ===
      'group-fluoroquinolone':          { x: 150,  y: 150 },    // Broad (G+/G-)
      'group-tetracycline':             { x: 550,  y: 150 },    // Broad (atypicals)
      'group-macrolide':                { x: 950,  y: 150 },    // Atypical/Gram+
      'group-sulfonamide':              { x: 1350, y: 150 },    // Broad (UTI, PJP)

      // === Row 4: Non-BL — Gram- / Anaerobe / Niche (bottom) ===
      'group-aminoglycoside':           { x: 150,  y: 450 },    // Gram- / Pseudomonas
      'group-nitroimidazole':           { x: 550,  y: 450 },
      'group-lipopeptide':              { x: -900, y: 450 },    // Daptomycin = MRSA    // Anaerobe
    };

    // Assign positions to drug nodes based on their parent group
    const nodePositions: Record<string, { x: number; y: number }> = {};
    const groupChildCounts: Record<string, number> = {};
    const groupChildIndex: Record<string, number> = {};

    // Count children per group
    for (const n of nodes) {
      const parentId = nodeParents[n.id];
      if (parentId) {
        groupChildCounts[parentId] = (groupChildCounts[parentId] || 0) + 1;
      }
    }

    // Assign positions in a grid within each group
    for (const n of nodes) {
      const parentId = nodeParents[n.id];
      if (parentId && GROUP_POSITIONS[parentId]) {
        const center = GROUP_POSITIONS[parentId];
        const idx = groupChildIndex[parentId] || 0;
        groupChildIndex[parentId] = idx + 1;
        const total = groupChildCounts[parentId];
        const cols = Math.ceil(Math.sqrt(total));
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        const spacing = 90;
        const offsetX = (col - (cols - 1) / 2) * spacing;
        const offsetY = row * spacing;
        nodePositions[n.id] = { x: center.x + offsetX, y: center.y + offsetY };
      }
    }

    const elements: cytoscape.ElementDefinition[] = [
      // Parent (compound) nodes
      ...parentNodes.map(p => ({
        data: { id: p.id, label: p.label, isGroup: 'true' },
      })),
      // Drug nodes with parent reference + preset position
      ...nodes.map(n => ({
        data: {
          id: n.id,
          label: n.label,
          drugClass: n.drugClass,
          r1Group: n.r1Group ?? '',
          color: n.color,
          parent: nodeParents[n.id] || undefined,
          hasMrsa: (n.spectrumTags || []).includes('mrsa') ? 'true' : 'false',
          hasPseudomonas: (n.spectrumTags || []).includes('pseudomonas') ? 'true' : 'false',
        },
        position: nodePositions[n.id] || { x: 0, y: 0 },
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
            'background-color': 'rgba(30, 41, 59, 0.25)',
            'background-opacity': 0.25,
            'border-width': 1,
            'border-color': 'rgba(100, 116, 139, 0.25)',
            'border-style': 'dashed' as any,
            shape: 'round-rectangle',
            'padding': '25px',
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

        // MRSA-covering drugs: double border effect
        {
          selector: 'node[hasMrsa = "true"]',
          style: {
            'border-width': 3,
            'border-color': '#f43f5e',
            'border-opacity': 0.9,
            'border-style': 'double' as any,
          } as any,
        },
        // Pseudomonas-covering drugs: cyan ring
        {
          selector: 'node[hasPseudomonas = "true"]',
          style: {
            'border-width': 2.5,
            'border-color': '#06b6d4',
            'border-opacity': 0.8,
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
      layout: { name: 'preset' } as Parameters<Core['layout']>[0],
      minZoom: 0.2,
      maxZoom: 4,
      wheelSensitivity: 0.25,
    });

    let baseGroupFontSize = 20;
    let zoomFramePending = false;

    const applyResponsiveGroupLabelStyle = () => {
      const zoom = Math.max(0.2, cy.zoom());
      const zoomCompensation = Math.pow(zoom, -0.85);
      const adjustedFontSize = Math.round(
        Math.max(baseGroupFontSize, Math.min(52, baseGroupFontSize * zoomCompensation)),
      );
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
      cy.off('zoom', scheduleGroupLabelUpdate);
      resizeObserver.disconnect();
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
      style={{ background: 'radial-gradient(ellipse at center, #0f172a 0%, #020617 70%)' }}
    />
  );
}
