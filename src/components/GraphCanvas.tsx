import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core } from 'cytoscape';
import cola from 'cytoscape-cola';
import dagre from 'cytoscape-dagre';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  Crosshair,
  Network,
  GitBranch,
  Radar,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { GraphEdge, GraphNode } from '../data/mockTopology';
import {
  AttackPathResult,
  BlastRadiusResult,
  ChokePointAnalysis,
} from '../utils/graphAlgorithms';

// Register Cytoscape layout extensions safely
try {
  cytoscape.use(cola);
  cytoscape.use(dagre);
} catch {
  // Ignore if already registered during HMR
}

export type WorkbenchMode = 'incident' | 'attack-path' | 'zero-trust';

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  mode: WorkbenchMode;
  blastRadius: BlastRadiusResult | null;
  highlightedNodeIds: Set<string>;
  highlightedEdgeIds: Set<string>;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  chokePoints: ChokePointAnalysis;
  shortestPaths: AttackPathResult[];
  onSelectNode: (nodeId: string | null) => void;
  onSelectEdge: (edgeId: string | null) => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  mode,
  blastRadius,
  highlightedNodeIds,
  highlightedEdgeIds,
  selectedNodeId,
  selectedEdgeId,
  chokePoints,
  shortestPaths,
  onSelectNode,
  onSelectEdge,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<Core | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLayout, setActiveLayout] = useState<'dagre' | 'cola' | 'concentric'>('dagre');
  const [pulsePhase, setPulsePhase] = useState(false);

  // Subtle pulse interval for compromised nodes
  useEffect(() => {
    const timer = setInterval(() => {
      setPulsePhase((p) => !p);
    }, 900);
    return () => clearInterval(timer);
  }, []);

  // Initialize and update Cytoscape elements when topology changes
  useEffect(() => {
    if (!containerRef.current) return;

    if (!cyRef.current) {
      cyRef.current = cytoscape({
        container: containerRef.current,
        elements: [],
        minZoom: 0.25,
        maxZoom: 2.8,
        wheelSensitivity: 0.2,
        style: [
          {
            selector: 'node',
            style: {
              label: 'data(displayLabel)',
              'text-valign': 'bottom',
              'text-halign': 'center',
              'text-margin-y': 7,
              color: '#E2E8F0',
              'font-family': 'DM Sans, Inter, sans-serif',
              'font-size': 11,
              'font-weight': 600,
              'text-wrap': 'wrap',
              'text-max-width': '120px',
              'text-background-color': '#020617',
              'text-background-opacity': 0.85,
              'text-background-padding': '3px',
              'text-background-shape': 'roundrectangle',
              'background-color': 'data(bgColor)',
              'border-width': 'data(borderWidth)',
              'border-color': 'data(borderColor)',
              width: 'data(nodeSize)',
              height: 'data(nodeSize)',
              shape: 'data(nodeShape)' as any,
              'overlay-opacity': 0,
              'transition-property':
                'background-color, border-color, border-width, width, height, opacity',
              'transition-duration': 250,
            },
          },
          {
            selector: 'node.dimmed',
            style: {
              opacity: 0.25,
            },
          },
          {
            selector: 'node.selected-node',
            style: {
              'border-width': 5,
              'border-color': '#F8FAFC',
            },
          },
          {
            selector: 'edge',
            style: {
              width: 'data(edgeWidth)',
              'line-color': 'data(edgeColor)',
              'target-arrow-color': 'data(edgeColor)',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'line-style': 'data(lineStyle)' as any,
              'line-dash-pattern': [8, 5],
              label: 'data(edgeLabel)',
              'font-size': 9,
              color: '#94A3B8',
              'text-rotation': 'autorotate',
              'text-background-color': '#020617',
              'text-background-opacity': 0.85,
              'text-background-padding': '2px',
              'overlay-opacity': 0,
              'transition-property': 'line-color, width, opacity',
              'transition-duration': 250,
            },
          },
          {
            selector: 'edge.dimmed',
            style: {
              opacity: 0.15,
            },
          },
          {
            selector: 'edge.selected-edge',
            style: {
              width: 5,
              'line-color': '#38BDF8',
              'target-arrow-color': '#38BDF8',
            },
          },
        ],
      });

      cyRef.current.on('tap', 'node', (evt) => {
        const nodeId = evt.target.id();
        onSelectNode(nodeId);
        onSelectEdge(null);
      });

      cyRef.current.on('tap', 'edge', (evt) => {
        const edgeId = evt.target.id();
        onSelectEdge(edgeId);
        onSelectNode(null);
      });

      cyRef.current.on('tap', (evt) => {
        if (evt.target === cyRef.current) {
          onSelectNode(null);
          onSelectEdge(null);
        }
      });
    }

    const cy = cyRef.current;

    // Sync nodes and edges with Cytoscape instance
    const existingNodeIds = new Set(cy.nodes().map((n) => n.id()));
    const newNodeIds = new Set(nodes.map((n) => n.id));

    const existingEdgeIds = new Set(cy.edges().map((e) => e.id()));
    const newEdgeIds = new Set(edges.map((e) => e.id));

    const topologyChanged =
      existingNodeIds.size !== newNodeIds.size ||
      existingEdgeIds.size !== newEdgeIds.size ||
      Array.from(existingEdgeIds).some((id) => !newEdgeIds.has(id));

    if (topologyChanged) {
      cy.elements().remove();

      const cyNodes = nodes.map((n) => ({
        data: {
          id: n.id,
          displayLabel: computeNodeDisplayLabel(n),
          bgColor: '#334155',
          borderColor: '#475569',
          borderWidth: 2,
          nodeSize: computeNodeSize(n),
          nodeShape: computeNodeShape(n),
        },
      }));

      const cyEdges = edges.map((e) => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          edgeLabel: computeEdgeLabel(e),
          edgeColor: '#475569',
          edgeWidth: 1.8,
          lineStyle: 'solid',
        },
      }));

      cy.add([...cyNodes, ...cyEdges]);
      runGraphLayout(cy, activeLayout);
    }
  }, [nodes, edges]);

  // Apply dynamic visual styling based on Mode, Blast Radius, Choke Points, and Selection
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const topChokeNodeIds = new Set(chokePoints.topNodes.map((c) => c.nodeId));
    const topChokeEdgeIds = new Set(chokePoints.topEdges.map((c) => c.edgeId));
    const topShortestPathEdges = new Set<string>();
    const topShortestPathNodes = new Set<string>();

    if (mode === 'attack-path' && shortestPaths.length > 0) {
      // Highlight top 3 lowest-cost Dijkstra attack paths
      shortestPaths.slice(0, 3).forEach((p) => {
        p.edgeIds.forEach((eid) => topShortestPathEdges.add(eid));
        p.nodeIds.forEach((nid) => topShortestPathNodes.add(nid));
      });
    }

    const hasExplicitHighlight =
      highlightedNodeIds.size > 0 || highlightedEdgeIds.size > 0;

    cy.batch(() => {
      nodes.forEach((n) => {
        const ele = cy.getElementById(n.id);
        if (!ele || ele.empty()) return;

        const isCrownJewel = (n.criticality ?? 0) >= 9 || Boolean(n.pii_data);
        const isCompromised = Boolean(n.compromised);
        const isBlastRoot = blastRadius?.rootNodeId === n.id && (blastRadius?.maxHops ?? 0) > 0;
        const isHop1 = blastRadius?.hop1Nodes.has(n.id) ?? false;
        const isHop2 = blastRadius?.hop2Nodes.has(n.id) ?? false;
        const isHop3 = blastRadius?.hop3Nodes.has(n.id) ?? false;
        const isChokeNode = topChokeNodeIds.has(n.id);

        // Determine Node Fill & Border Colors per Prompt Spec:
        // Compromised: Glowing Red (#EF4444)
        // 1-Hop Blast Radius: Orange (#F97316)
        // 2-Hop Blast Radius: Amber/Yellow (#FBBF24)
        // 3-Hop Blast Radius: Slate Blue (#38BDF8)
        // Crown Jewels: Purple with shield badge (#A855F7)
        // Unaffected / Normal: Charcoal Slate (#334155)
        let bgColor = '#334155';
        let borderColor = '#475569';
        let borderWidth = 2;

        if (n.type === 'Vulnerability') {
          bgColor = '#1E293B';
          borderColor = '#F43F5E';
          borderWidth = 1.5;
        }

        if (isCrownJewel) {
          bgColor = '#A855F7';
          borderColor = '#D8B4FE';
          borderWidth = 3;
        }

        if (isHop3) {
          bgColor = '#38BDF8';
          borderColor = '#BAE6FD';
          borderWidth = 3;
        }
        if (isHop2) {
          bgColor = '#FBBF24';
          borderColor = '#FEF08A';
          borderWidth = 3.5;
        }
        if (isHop1) {
          bgColor = '#F97316';
          borderColor = '#FED7AA';
          borderWidth = 4;
        }

        if (isCompromised || isBlastRoot) {
          bgColor = '#EF4444';
          borderColor = pulsePhase ? '#FCA5A5' : '#991B1B';
          borderWidth = pulsePhase ? 6 : 3.5;
        }

        if (mode === 'attack-path' && isChokeNode) {
          borderColor = '#22D3EE';
          borderWidth = 4.5;
        }

        ele.data('bgColor', bgColor);
        ele.data('borderColor', borderColor);
        ele.data('borderWidth', borderWidth);

        ele.removeClass('dimmed selected-node');
        if (selectedNodeId === n.id) {
          ele.addClass('selected-node');
        }

        if (hasExplicitHighlight && !highlightedNodeIds.has(n.id)) {
          ele.addClass('dimmed');
        } else if (
          mode === 'zero-trust' &&
          !edges.some(
            (e) =>
              (e.source === n.id || e.target === n.id) &&
              (e.last_used_days ?? 0) > 90
          )
        ) {
          ele.addClass('dimmed');
        }
      });

      edges.forEach((e) => {
        const ele = cy.getElementById(e.id);
        if (!ele || ele.empty()) return;

        const isDormant = (e.last_used_days ?? 0) > 90;
        const isAttack = Boolean(e.is_attack_edge);
        const isBlastEdge = blastRadius?.reachableEdges.has(e.id) ?? false;
        const isChokeEdge = topChokeEdgeIds.has(e.id);
        const isShortestPath = topShortestPathEdges.has(e.id);

        let edgeColor = '#334155';
        let edgeWidth = 1.6;
        let lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';

        if (e.relationship === 'HAS_VULN') {
          edgeColor = '#64748B';
          lineStyle = 'dotted';
          edgeWidth = 1.2;
        } else if (isDormant) {
          // Stale / Dormant privileges (>90 days unused): Dashed grey-orange edges
          edgeColor = '#F59E0B';
          lineStyle = 'dashed';
          edgeWidth = mode === 'zero-trust' ? 3.5 : 2.2;
        }

        if (isBlastEdge) {
          edgeColor = '#F97316';
          edgeWidth = 3;
        }

        if (mode === 'attack-path' && isShortestPath) {
          edgeColor = '#A855F7';
          edgeWidth = 3.2;
        }

        if (mode === 'attack-path' && isChokeEdge) {
          edgeColor = '#22D3EE';
          edgeWidth = 4;
        }

        if (isAttack) {
          // Dynamic active attacks: Red directional flowing arrows
          edgeColor = '#EF4444';
          edgeWidth = pulsePhase ? 4.2 : 3.2;
          lineStyle = isDormant ? 'dashed' : 'solid';
        }

        ele.data('edgeColor', edgeColor);
        ele.data('edgeWidth', edgeWidth);
        ele.data('lineStyle', lineStyle);

        ele.removeClass('dimmed selected-edge');
        if (selectedEdgeId === e.id) {
          ele.addClass('selected-edge');
        }

        if (hasExplicitHighlight && !highlightedEdgeIds.has(e.id)) {
          ele.addClass('dimmed');
        } else if (mode === 'zero-trust' && !isDormant) {
          ele.addClass('dimmed');
        }
      });
    });
  }, [
    nodes,
    edges,
    mode,
    blastRadius,
    highlightedNodeIds,
    highlightedEdgeIds,
    selectedNodeId,
    selectedEdgeId,
    chokePoints,
    shortestPaths,
    pulsePhase,
  ]);

  const handleLayoutChange = (layoutName: 'dagre' | 'cola' | 'concentric') => {
    setActiveLayout(layoutName);
    if (cyRef.current) {
      runGraphLayout(cyRef.current, layoutName);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cyRef.current || !searchQuery.trim()) return;
    const q = searchQuery.toLowerCase().trim();
    const matched = nodes.find(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        n.id.toLowerCase().includes(q) ||
        (n.ip && n.ip.includes(q))
    );
    if (matched) {
      onSelectNode(matched.id);
      const ele = cyRef.current.getElementById(matched.id);
      if (ele && !ele.empty()) {
        cyRef.current.animate({
          center: { eles: ele },
          zoom: 1.45,
          duration: 450,
        });
      }
    }
  };

  const handleZoom = (factor: number) => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.zoom({
      level: cy.zoom() * factor,
      renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
    });
  };

  const handleFit = () => {
    cyRef.current?.fit(undefined, 45);
  };

  const handleCenterBreach = () => {
    if (!cyRef.current) return;
    const breachNodes = cyRef.current.nodes().filter((ele) => {
      const id = ele.id();
      return [
        'contractor-ext',
        'Dev-Laptop-04',
        'JumpHost-Corp',
        'svc-cicd-runner',
        'Customer-DB-Primary',
      ].includes(id);
    });
    if (breachNodes.length > 0) {
      cyRef.current.animate({
        fit: { eles: breachNodes, padding: 65 },
        duration: 500,
      });
    }
  };

  return (
    <div className="relative w-full h-full bg-[#09090b] overflow-hidden select-none">
      {/* Subtle Yellow-Tinted Cyber Dot Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #fff318 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top Floating Canvas Toolbar: Search + Layout Switcher */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Search Hostname / Identity Bar */}
        <form
          onSubmit={handleSearch}
          className="pointer-events-auto flex items-center bg-[#0a0a0c]/95 backdrop-blur-md border border-[#fff318]/45 rounded-lg px-3 py-1.5 shadow-lg"
        >
          <Search className="w-4 h-4 text-[#fff318] mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search host, IP, CVE, identity..."
            className="bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none w-52"
          />
          {searchQuery && (
            <button
              type="submit"
              className="ml-2 text-[11px] font-extrabold text-[#fff318] hover:opacity-80"
            >
              Locate
            </button>
          )}
        </form>

        {/* Layout & Camera Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#0a0a0c]/95 backdrop-blur-md border border-[#fff318]/45 rounded-lg p-1 shadow-lg">
          <button
            onClick={() => handleLayoutChange('dagre')}
            title="Hierarchical Attack Tree Layout (cytoscape-dagre)"
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-extrabold transition cursor-pointer ${
              activeLayout === 'dagre'
                ? 'bg-[#fff318] text-[#0a0a0c]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Dagre Tree</span>
          </button>
          <button
            onClick={() => handleLayoutChange('cola')}
            title="Force-Directed Physics Layout (cytoscape-cola)"
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-extrabold transition cursor-pointer ${
              activeLayout === 'cola'
                ? 'bg-[#fff318] text-[#0a0a0c]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Cola Physics</span>
          </button>
          <button
            onClick={() => handleLayoutChange('concentric')}
            title="Criticality Ring Layout"
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-extrabold transition cursor-pointer ${
              activeLayout === 'concentric'
                ? 'bg-[#fff318] text-[#0a0a0c]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Radar className="w-3.5 h-3.5" />
            <span>Rings</span>
          </button>

          <div className="h-4 w-px bg-zinc-800 mx-1" />

          <button
            onClick={handleCenterBreach}
            title="Focus Active Breach Kill-Chain"
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold text-[#fff318] hover:bg-[#fff318]/15 transition cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Focus Breach</span>
          </button>
          <button
            onClick={() => handleZoom(1.25)}
            title="Zoom In"
            className="p-1.5 text-zinc-400 hover:text-[#fff318] rounded hover:bg-zinc-900 cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            title="Zoom Out"
            className="p-1.5 text-zinc-400 hover:text-[#fff318] rounded hover:bg-zinc-900 cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleFit}
            title="Fit Entire Enterprise Topology"
            className="p-1.5 text-zinc-400 hover:text-[#fff318] rounded hover:bg-zinc-900 cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Cytoscape Canvas Mount Point */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Bottom-Left Interactive Legend Overlay with Cybersecurity Tooltips */}
      <div className="absolute bottom-3 left-3 z-10 bg-[#0a0a0c]/95 backdrop-blur-md border border-[#fff318]/45 rounded-lg px-3 py-2 shadow-xl max-w-xl">
        <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#fff318] mb-1.5">
          <Info className="w-3 h-3 text-[#fff318]" />
          <span>GraphOps Telemetry Legend (Hover badges for SOC definitions)</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-slate-300">
          <span
            title="Compromised Node: Active adversary foothold confirmed via EDR/SIEM telemetry."
            className="flex items-center gap-1.5 cursor-help"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-400/60 animate-pulse" />
            Compromised
          </span>
          <span
            title="1-Hop Blast Radius: Immediately reachable systems from selected node via direct credentials or network flow."
            className="flex items-center gap-1.5 cursor-help"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            1-Hop Blast
          </span>
          <span
            title="2-Hop Blast Radius: Secondary lateral movement targets reachable in 2 pivot steps (Triggers DPDP Alert if PII present)."
            className="flex items-center gap-1.5 cursor-help"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            2-Hop Blast
          </span>
          <span
            title="3-Hop Blast Radius: Tertiary infrastructure exposed within 3 lateral hops."
            className="flex items-center gap-1.5 cursor-help"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            3-Hop Blast
          </span>
          <span
            title="Crown Jewel Asset: Criticality 9-10 or stores regulated Customer/Employee PII records."
            className="flex items-center gap-1.5 cursor-help"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-1 ring-purple-300" />
            Crown Jewel (🛡)
          </span>
          <span
            title="Unaffected Asset/Identity: Normal baseline posture."
            className="flex items-center gap-1.5 cursor-help"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-500" />
            Normal
          </span>
          <span
            title="Active Attack Flow: Confirmed malicious authentication or lateral process execution."
            className="flex items-center gap-1.5 cursor-help"
          >
            <span className="w-4 h-0.5 bg-red-500 inline-block" />
            Active Attack
          </span>
          <span
            title="Zero-Trust Drift: Standing entitlement unused for >90 days; prime target for lateral credential abuse."
            className="flex items-center gap-1.5 cursor-help"
          >
            <span className="w-4 h-0.5 border-b-2 border-dashed border-amber-500 inline-block" />
            Stale Privilege (&gt;90d)
          </span>
        </div>
      </div>
    </div>
  );
};

function computeNodeDisplayLabel(n: GraphNode): string {
  if (n.type === 'Vulnerability') {
    return `⚠ ${n.cve_id}\n(CVSS ${n.cvss})`;
  }
  const shield = (n.criticality ?? 0) >= 9 || n.pii_data ? '🛡 ' : '';
  const zoneTag = n.zone ? ` [${n.zone}]` : n.tier ? ` [T${n.tier}]` : '';
  return `${shield}${n.label}${zoneTag}`;
}

function computeNodeSize(n: GraphNode): number {
  if (n.type === 'Vulnerability') return 26;
  if ((n.criticality ?? 0) >= 9 || n.pii_data) return 44;
  if (n.compromised) return 40;
  return 32;
}

function computeNodeShape(n: GraphNode): string {
  if (n.type === 'Identity') return 'diamond';
  if (n.type === 'Vulnerability') return 'hexagon';
  if ((n.criticality ?? 0) >= 9 || n.pii_data) return 'octagon';
  return 'round-rectangle';
}

function computeEdgeLabel(e: GraphEdge): string {
  if (e.is_attack_edge && e.mitre_tactic) {
    return e.mitre_tactic.split(' ')[0];
  }
  if ((e.last_used_days ?? 0) > 90) {
    return `Stale ${e.last_used_days}d`;
  }
  return '';
}

function runGraphLayout(
  cy: Core,
  layoutType: 'dagre' | 'cola' | 'concentric'
) {
  try {
    if (layoutType === 'dagre') {
      cy.layout({
        name: 'dagre',
        rankDir: 'LR',
        nodeSep: 42,
        rankSep: 95,
        padding: 45,
        animate: true,
        animationDuration: 400,
      } as any).run();
    } else if (layoutType === 'cola') {
      cy.layout({
        name: 'cola',
        animate: true,
        maxSimulationTime: 1800,
        nodeSpacing: 38,
        edgeLengthVal: 110,
        padding: 45,
      } as any).run();
    } else {
      cy.layout({
        name: 'concentric',
        padding: 45,
        animate: true,
        animationDuration: 400,
        concentric: (node: any) => {
          const id = node.id();
          if (id === 'Customer-DB-Primary' || id === 'Billing-Ledger-DB') return 10;
          if (id === 'JumpHost-Corp' || id === 'svc-cicd-runner') return 7;
          return 3;
        },
        levelWidth: () => 2,
      }).run();
    }
  } catch {
    cy.layout({ name: 'breadthfirst', directed: true, padding: 40 }).run();
  }
}
