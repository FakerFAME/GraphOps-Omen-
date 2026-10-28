import React, { useMemo, useState } from 'react';
import {
  GraphEdge,
  GraphNode,
  INITIAL_TOPOLOGY,
} from './data/mockTopology';
import {
  calculateBlastRadius,
  calculateChokePoints,
  CorrelatedIncident,
  evaluateDpdpRegulatoryAlert,
  findShortestAttackPaths,
  mergeAlerts,
} from './utils/graphAlgorithms';
import { GraphCanvas, WorkbenchMode } from './components/GraphCanvas';
import { TopKpiBar } from './components/TopKpiBar';
import { LeftControlPanel } from './components/LeftControlPanel';
import { RightInspectorDrawer } from './components/RightInspectorDrawer';
import { BottomAlertTray } from './components/BottomAlertTray';
import { VisualBlueprintsModal } from './components/VisualBlueprintsModal';

export const App: React.FC = () => {
  const [nodes, setNodes] = useState<GraphNode[]>(() =>
    INITIAL_TOPOLOGY.nodes.map((n) => ({ ...n }))
  );
  const [edges, setEdges] = useState<GraphEdge[]>(() =>
    INITIAL_TOPOLOGY.edges.map((e) => ({ ...e }))
  );

  const [mode, setMode] = useState<WorkbenchMode>('incident');
  const [blastRootId, setBlastRootId] = useState<string>('JumpHost-Corp');
  const [blastHops, setBlastHops] = useState<0 | 1 | 2 | 3>(2);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    'JumpHost-Corp'
  );
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const [highlightedNodeIds, setHighlightedNodeIds] = useState<Set<string>>(
    new Set()
  );
  const [highlightedEdgeIds, setHighlightedEdgeIds] = useState<Set<string>>(
    new Set()
  );
  const [isVisualModalOpen, setIsVisualModalOpen] = useState(false);

  const [auditLog, setAuditLog] = useState<string[]>([
    '[16:29:51] SIEM ingested 25 raw telemetry events across DMZ, Corp & Prod.',
    '[16:29:52] WCC Engine collapsed 25 raw alerts into 1 Critical Multi-Hop Breach Narrative (INC-2026-001).',
    '[16:29:53] CERT-In / DPDP Alert Triggered: Customer-DB-Primary (1.2M PII records) reachable within 2 hops of JumpHost-Corp.',
  ]);

  const graphModel = useMemo(() => ({ nodes, edges }), [nodes, edges]);

  // 1. Blast Radius Calculation (BFS 1-3 Hops)
  const blastResult = useMemo(() => {
    if (blastHops === 0) return null;
    return calculateBlastRadius(graphModel, blastRootId, blastHops);
  }, [graphModel, blastRootId, blastHops]);

  // 2. Dijkstra Shortest Attack Paths
  const shortestPaths = useMemo(
    () => findShortestAttackPaths(graphModel, 'ANY', 8),
    [graphModel]
  );

  // 3. Betweenness Centrality Choke Points
  const chokePoints = useMemo(
    () => calculateChokePoints(graphModel),
    [graphModel]
  );

  // 4. WCC Alert Collapser
  const correlatedIncidents = useMemo(
    () => mergeAlerts(INITIAL_TOPOLOGY.rawAlerts, graphModel),
    [graphModel]
  );

  // 5. CERT-In / DPDP 2-Hop PII Reachability Check
  const dpdpAlert = useMemo(
    () => evaluateDpdpRegulatoryAlert(graphModel),
    [graphModel]
  );

  // KPI Counts
  const totalIdentities = nodes.filter((n) => n.type === 'Identity').length;
  const totalAssets = nodes.filter((n) => n.type === 'Asset').length;
  const totalVulns = nodes.filter((n) => n.type === 'Vulnerability').length;

  const crownJewels = nodes.filter(
    (n) => n.type === 'Asset' && ((n.criticality ?? 0) >= 9 || n.pii_data)
  );

  // Count how many Crown Jewels are currently reachable along shortest attack paths from compromised nodes
  const crownJewelsExposedCount = useMemo(() => {
    const exposedSet = new Set<string>();
    const compNodes = nodes.filter((n) => n.compromised);
    for (const c of compNodes) {
      const b3 = calculateBlastRadius(graphModel, c.id, 3);
      b3.crownJewelsExposed.forEach((label) => exposedSet.add(label));
    }
    return exposedSet.size;
  }, [graphModel, nodes]);

  const severedEdgesCount = INITIAL_TOPOLOGY.edges.length - edges.length;

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );

  const selectedEdge = useMemo(
    () => edges.find((e) => e.id === selectedEdgeId) ?? null,
    [edges, selectedEdgeId]
  );

  // Action: One-Click Remediate Choke Point (Severs highest-betweenness edge)
  const handleRemediateChokePoint = (targetEdgeId?: string) => {
    const edgeIdToSever =
      targetEdgeId || chokePoints.topEdges[0]?.edgeId || 'edge-attack-3';
    const edgeObj = edges.find((e) => e.id === edgeIdToSever);
    if (!edgeObj) return;

    setEdges((prev) => prev.filter((e) => e.id !== edgeIdToSever));
    const now = new Date().toLocaleTimeString();
    setAuditLog((prev) => [
      `[${now}] SOAR REMEDIATION: Severed choke-point edge ${edgeObj.source} → ${edgeObj.target} (${edgeObj.relationship}).`,
      ...prev,
    ]);
  };

  // Action: Contain System (Isolate node by removing all outgoing edges)
  const handleContainNode = (nodeId: string) => {
    const outCount = edges.filter((e) => e.source === nodeId).length;
    if (outCount === 0) return;

    setEdges((prev) => prev.filter((e) => e.source !== nodeId));
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, compromised: false } : n))
    );
    const now = new Date().toLocaleTimeString();
    setAuditLog((prev) => [
      `[${now}] HOST CONTAINMENT: Isolated ${nodeId} — severed ${outCount} outgoing lateral vectors.`,
      ...prev,
    ]);
  };

  // Action: Sever single edge
  const handleSeverEdge = (edgeId: string) => {
    const edgeObj = edges.find((e) => e.id === edgeId);
    if (!edgeObj) return;
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
    setSelectedEdgeId(null);
    const now = new Date().toLocaleTimeString();
    setAuditLog((prev) => [
      `[${now}] POLICY REVOKED: Removed vector ${edgeObj.source} → ${edgeObj.target}.`,
      ...prev,
    ]);
  };

  // Action: Revoke all dormant standing privileges (>90 days unused)
  const handleRevokeDormantPrivileges = () => {
    const dormant = edges.filter((e) => (e.last_used_days ?? 0) > 90);
    if (dormant.length === 0) return;
    setEdges((prev) => prev.filter((e) => (e.last_used_days ?? 0) <= 90));
    const now = new Date().toLocaleTimeString();
    setAuditLog((prev) => [
      `[${now}] ZERO-TRUST DRIFT PURGE: Revoked ${dormant.length} standing privileges unused >90 days (including 120d JumpHost SSH key).`,
      ...prev,
    ]);
  };

  // Action: Highlight correlated incident narrative or Dijkstra path
  const handleHighlightIncident = (incident: CorrelatedIncident) => {
    setHighlightedNodeIds(new Set(incident.involvedNodes));
    setHighlightedEdgeIds(new Set(incident.involvedEdges));
  };

  const handleHighlightPath = (nodeIds: string[], edgeIds: string[]) => {
    setHighlightedNodeIds(new Set(nodeIds));
    setHighlightedEdgeIds(new Set(edgeIds));
  };

  const handleClearHighlight = () => {
    setHighlightedNodeIds(new Set());
    setHighlightedEdgeIds(new Set());
  };

  // Action: Reset Graph Topology
  const handleResetTopology = () => {
    setNodes(INITIAL_TOPOLOGY.nodes.map((n) => ({ ...n })));
    setEdges(INITIAL_TOPOLOGY.edges.map((e) => ({ ...e })));
    setHighlightedNodeIds(new Set());
    setHighlightedEdgeIds(new Set());
    setBlastRootId('JumpHost-Corp');
    setBlastHops(2);
    const now = new Date().toLocaleTimeString();
    setAuditLog((prev) => [
      `[${now}] TOPOLOGY RESET: Restored full 44-node synthetic enterprise topology and active breach state.`,
      ...prev,
    ]);
  };

  return (
    <div className="w-full h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans">
      {/* 1. Top KPI & Regulatory Impact Bar */}
      <TopKpiBar
        totalIdentities={totalIdentities}
        totalAssets={totalAssets}
        totalVulns={totalVulns}
        rawAlertCount={INITIAL_TOPOLOGY.rawAlerts.length}
        mergedIncidentCount={correlatedIncidents.length}
        crownJewelsExposedCount={crownJewelsExposedCount}
        totalCrownJewels={crownJewels.length}
        dpdpAlert={dpdpAlert}
        onResetTopology={handleResetTopology}
        onOpenVisualGallery={() => setIsVisualModalOpen(true)}
      />

      {/* 2. Middle Main Workbench: Left Control Panel + Central Cytoscape Canvas + Right Inspector Drawer */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <LeftControlPanel
          mode={mode}
          onModeChange={(m) => {
            setMode(m);
            handleClearHighlight();
          }}
          nodes={nodes}
          edges={edges}
          blastRootId={blastRootId}
          blastHops={blastHops}
          blastResult={blastResult}
          onBlastRootChange={(id) => {
            setBlastRootId(id);
            setSelectedNodeId(id);
            if (blastHops === 0) setBlastHops(2);
          }}
          onBlastHopsChange={setBlastHops}
          chokePoints={chokePoints}
          shortestPaths={shortestPaths}
          severedEdgesCount={severedEdgesCount}
          onRemediateChokePoint={handleRemediateChokePoint}
          onRevokeDormantPrivileges={handleRevokeDormantPrivileges}
          onHighlightPath={handleHighlightPath}
        />

        <main className="flex-1 h-full relative min-w-0">
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            mode={mode}
            blastRadius={blastResult}
            highlightedNodeIds={highlightedNodeIds}
            highlightedEdgeIds={highlightedEdgeIds}
            selectedNodeId={selectedNodeId}
            selectedEdgeId={selectedEdgeId}
            chokePoints={chokePoints}
            shortestPaths={shortestPaths}
            onSelectNode={(id) => {
              setSelectedNodeId(id);
              if (id && id !== blastRootId) {
                const clicked = nodes.find((n) => n.id === id);
                if (clicked && clicked.type !== 'Vulnerability') {
                  setBlastRootId(id);
                }
              }
            }}
            onSelectEdge={setSelectedEdgeId}
          />
        </main>

        <RightInspectorDrawer
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          allNodes={nodes}
          allEdges={edges}
          onContainNode={handleContainNode}
          onSeverEdge={handleSeverEdge}
          onSelectNode={(id) => {
            setSelectedNodeId(id);
            setBlastRootId(id);
          }}
          auditLog={auditLog}
        />
      </div>

      {/* 3. Bottom "Alert Collapser" Tray */}
      <BottomAlertTray
        rawAlerts={INITIAL_TOPOLOGY.rawAlerts}
        correlatedIncidents={correlatedIncidents}
        isNarrativeHighlighted={highlightedNodeIds.size > 0}
        onHighlightIncident={handleHighlightIncident}
        onClearHighlight={handleClearHighlight}
        onSelectNode={(id) => {
          setSelectedNodeId(id);
        }}
      />

      {/* 4. Generated Visual Blueprints Modal */}
      <VisualBlueprintsModal
        isOpen={isVisualModalOpen}
        onClose={() => setIsVisualModalOpen(false)}
      />
    </div>
  );
};

