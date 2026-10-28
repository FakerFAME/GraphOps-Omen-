import React from 'react';
import {
  ShieldAlert,
  Route,
  KeyRound,
  Radar,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Lock,
} from 'lucide-react';
import { GraphEdge, GraphNode } from '../data/mockTopology';
import {
  AttackPathResult,
  BlastRadiusResult,
  ChokePointAnalysis,
} from '../utils/graphAlgorithms';
import { WorkbenchMode } from './GraphCanvas';

interface LeftControlPanelProps {
  mode: WorkbenchMode;
  onModeChange: (mode: WorkbenchMode) => void;
  nodes: GraphNode[];
  edges: GraphEdge[];
  blastRootId: string;
  blastHops: 0 | 1 | 2 | 3;
  blastResult: BlastRadiusResult | null;
  onBlastRootChange: (nodeId: string) => void;
  onBlastHopsChange: (hops: 0 | 1 | 2 | 3) => void;
  chokePoints: ChokePointAnalysis;
  shortestPaths: AttackPathResult[];
  severedEdgesCount: number;
  onRemediateChokePoint: (edgeId?: string) => void;
  onRevokeDormantPrivileges: () => void;
  onHighlightPath: (nodeIds: string[], edgeIds: string[]) => void;
}

export const LeftControlPanel: React.FC<LeftControlPanelProps> = ({
  mode,
  onModeChange,
  nodes,
  edges,
  blastRootId,
  blastHops,
  blastResult,
  onBlastRootChange,
  onBlastHopsChange,
  chokePoints,
  shortestPaths,
  severedEdgesCount,
  onRemediateChokePoint,
  onRevokeDormantPrivileges,
  onHighlightPath,
}) => {
  const selectableNodes = nodes.filter((n) => n.type !== 'Vulnerability');
  const dormantEdges = edges.filter((e) => (e.last_used_days ?? 0) > 90);
  const topEdge = chokePoints.topEdges[0];

  return (
    <aside className="w-80 shrink-0 h-full bg-[#0a0a0c] border-r-2 border-[#fff318]/40 flex flex-col overflow-y-auto select-none">
      {/* 1. MODE SWITCHER */}
      <div className="p-3.5 border-b border-[#fff318]/25">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#fff318]">
            1. Operational Workbench Mode
          </span>
          <span
            title="Switch analytical lens between live breach response, proactive Dijkstra/Centrality pathing, and Zero-Trust entitlement drift."
            className="text-[10px] px-1.5 py-0.2 rounded bg-[#fff318]/15 text-[#fff318] font-mono cursor-help"
          >
            3 Modes
          </span>
        </div>

        <div className="space-y-1.5">
          <button
            onClick={() => onModeChange('incident')}
            title="Focus on active SIEM alert correlation, live compromised hosts, and multi-hop breach containment."
            className={`w-full text-left px-3 py-2 rounded-lg border transition flex items-start gap-2.5 cursor-pointer ${
              mode === 'incident'
                ? 'bg-[#fff318] border-[#fff318] text-[#0a0a0c] shadow-md'
                : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-[#fff318]/50'
            }`}
          >
            <ShieldAlert
              className={`w-4 h-4 mt-0.5 shrink-0 ${
                mode === 'incident' ? 'text-[#0a0a0c]' : 'text-red-400'
              }`}
            />
            <div>
              <div className="text-xs font-extrabold">Incident Response Mode</div>
              <div
                className={`text-[10px] leading-tight mt-0.5 ${
                  mode === 'incident' ? 'text-zinc-900 font-medium' : 'text-zinc-400'
                }`}
              >
                Active alert investigation &amp; kill-chain containment
              </div>
            </div>
          </button>

          <button
            onClick={() => onModeChange('attack-path')}
            title="Proactive posture analysis using Dijkstra shortest paths and Betweenness Centrality choke points."
            className={`w-full text-left px-3 py-2 rounded-lg border transition flex items-start gap-2.5 cursor-pointer ${
              mode === 'attack-path'
                ? 'bg-[#fff318] border-[#fff318] text-[#0a0a0c] shadow-md'
                : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-[#fff318]/50'
            }`}
          >
            <Route
              className={`w-4 h-4 mt-0.5 shrink-0 ${
                mode === 'attack-path' ? 'text-[#0a0a0c]' : 'text-[#fff318]'
              }`}
            />
            <div>
              <div className="text-xs font-extrabold">
                Pre-Incident Attack Path Mode
              </div>
              <div
                className={`text-[10px] leading-tight mt-0.5 ${
                  mode === 'attack-path' ? 'text-zinc-900 font-medium' : 'text-zinc-400'
                }`}
              >
                Dijkstra least-cost paths &amp; centrality choke points
              </div>
            </div>
          </button>

          <button
            onClick={() => onModeChange('zero-trust')}
            title="Identify and revoke dormant standing permissions unused for >90 days."
            className={`w-full text-left px-3 py-2 rounded-lg border transition flex items-start gap-2.5 cursor-pointer ${
              mode === 'zero-trust'
                ? 'bg-[#fff318] border-[#fff318] text-[#0a0a0c] shadow-md'
                : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-[#fff318]/50'
            }`}
          >
            <KeyRound
              className={`w-4 h-4 mt-0.5 shrink-0 ${
                mode === 'zero-trust' ? 'text-[#0a0a0c]' : 'text-amber-400'
              }`}
            />
            <div>
              <div className="text-xs font-extrabold flex items-center gap-1.5">
                <span>Zero-Trust Drift Mode</span>
                <span
                  className={`px-1.5 py-0.2 text-[9px] rounded font-mono font-bold ${
                    mode === 'zero-trust'
                      ? 'bg-[#0a0a0c] text-[#fff318]'
                      : 'bg-[#fff318]/20 text-[#fff318]'
                  }`}
                >
                  {dormantEdges.length} Stale
                </span>
              </div>
              <div
                className={`text-[10px] leading-tight mt-0.5 ${
                  mode === 'zero-trust' ? 'text-zinc-900 font-medium' : 'text-zinc-400'
                }`}
              >
                Standing privileges unused &gt;90 days
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 2. BLAST RADIUS SIMULATOR (BFS 1-Hop, 2-Hop, 3-Hop) */}
      <div className="p-3.5 border-b border-[#fff318]/25">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#fff318] flex items-center gap-1.5">
            <Radar className="w-3.5 h-3.5 text-[#fff318]" />
            <span>2. Blast Radius Simulator (BFS)</span>
          </span>
        </div>

        <label className="block text-[10px] uppercase text-zinc-400 mb-1">
          Origin / Breach Root Node
        </label>
        <select
          value={blastRootId}
          onChange={(e) => onBlastRootChange(e.target.value)}
          className="w-full bg-zinc-950 border border-[#fff318]/40 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#fff318] mb-2"
        >
          {selectableNodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.compromised ? '🔴 ' : (n.criticality ?? 0) >= 9 ? '🛡 ' : '• '}
              {n.label} ({n.type === 'Identity' ? `IAM T${n.tier}` : n.zone})
            </option>
          ))}
        </select>

        {/* Hop Selector Buttons */}
        <div className="grid grid-cols-4 gap-1.5 mb-2.5">
          {([0, 1, 2, 3] as const).map((hop) => (
            <button
              key={hop}
              onClick={() => onBlastHopsChange(hop)}
              title={
                hop === 0
                  ? 'Disable Blast Radius ring overlay'
                  : `Calculate ${hop}-Hop Breadth-First Search reachability from ${blastRootId}`
              }
              className={`py-1.5 rounded-md text-xs font-extrabold border transition cursor-pointer ${
                blastHops === hop
                  ? 'bg-[#fff318] border-[#fff318] text-[#0a0a0c]'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-[#fff318]/50 hover:text-white'
              }`}
            >
              {hop === 0 ? 'Off' : `${hop}-Hop`}
            </button>
          ))}
        </div>

        {/* Live Blast Radius Telemetry Summary */}
        {blastHops > 0 && blastResult && (
          <div className="bg-zinc-950 border border-[#fff318]/30 rounded-lg p-2.5 space-y-1.5">
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-orange-500/15 border border-orange-500/40 rounded p-1">
                <div className="text-[10px] text-orange-300 font-semibold">1-Hop</div>
                <div className="text-xs font-extrabold text-orange-200">
                  {blastResult.hop1Nodes.size}
                </div>
              </div>
              <div className="bg-[#fff318]/15 border border-[#fff318]/50 rounded p-1">
                <div className="text-[10px] text-[#fff318] font-semibold">2-Hop</div>
                <div className="text-xs font-extrabold text-[#fff318]">
                  {blastResult.hop2Nodes.size}
                </div>
              </div>
              <div className="bg-sky-500/15 border border-sky-500/40 rounded p-1">
                <div className="text-[10px] text-sky-300 font-semibold">3-Hop</div>
                <div className="text-xs font-extrabold text-sky-200">
                  {blastResult.hop3Nodes.size}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-800">
              <span className="text-zinc-400">PII Vaults Reached:</span>
              <span
                className={`font-bold ${
                  blastResult.piiExposedCount > 0
                    ? 'text-[#fff318]'
                    : 'text-emerald-400'
                }`}
              >
                {blastResult.piiExposedCount} (
                {(blastResult.piiRecordsExposed / 1000000).toFixed(2)}M records)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. CHOKE POINT REMEDIATION (Betweenness Centrality) */}
      <div className="p-3.5 border-b border-[#fff318]/25">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#fff318] flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-[#fff318]" />
            <span>3. Choke Point Remediation</span>
          </span>
          <span
            title="Betweenness Centrality calculates which bridge node/edge sits on the greatest fraction of shortest attack paths to Crown Jewels."
            className="text-[10px] px-1.5 py-0.5 rounded bg-[#fff318] text-[#0a0a0c] font-bold cursor-help"
          >
            Centrality
          </span>
        </div>

        {/* One-Click Remediate Choke Point CTA */}
        {topEdge ? (
          <div className="space-y-2.5">
            <div className="bg-zinc-950 border border-[#fff318]/40 rounded-lg p-2.5">
              <div className="flex items-center justify-between text-[10px] text-[#fff318] font-bold uppercase mb-1">
                <span>Highest-Betweenness Bridge</span>
                <span>Score: {topEdge.centralityScore}</span>
              </div>
              <div className="text-xs font-mono font-bold text-white truncate">
                {topEdge.source} → {topEdge.target}
              </div>
              <div className="text-[10px] text-zinc-400 mt-1">
                Intercepts{' '}
                <strong className="text-white">
                  {topEdge.pathsIntercepted}
                </strong>{' '}
                attack vectors • Shields{' '}
                <strong className="text-[#fff318]">
                  {topEdge.crownJewelsProtected.length} Crown Jewels
                </strong>
              </div>
            </div>

            <button
              onClick={() => onRemediateChokePoint(topEdge.edgeId)}
              title="Dynamically sever the highest-betweenness edge in real time to break lateral paths to Crown Jewels."
              className="w-full py-2 px-3 rounded-lg bg-[#fff318] hover:opacity-90 text-[#0a0a0c] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
            >
              <Scissors className="w-4 h-4" />
              <span>Remediate Choke Point Now</span>
            </button>
          </div>
        ) : (
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-lg p-3 text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-emerald-200">
              All Critical Choke Points Severed
            </div>
            <div className="text-[10px] text-emerald-400/80">
              Zero lateral paths remain to Crown Jewels.
            </div>
          </div>
        )}

        {/* Top 3 Betweenness Centrality Nodes List */}
        {chokePoints.topNodes.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
              Top 3 Centrality Choke Nodes
            </div>
            {chokePoints.topNodes.map((cn, idx) => (
              <div
                key={cn.nodeId}
                className="bg-zinc-950 border border-zinc-800 rounded-md px-2.5 py-1.5 flex items-center justify-between text-xs"
              >
                <div className="truncate pr-2">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-[#fff318] font-bold">
                      #{idx + 1}
                    </span>
                    <span>{cn.label}</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">
                    Protects: {cn.crownJewelsProtected.join(', ') || 'Internal'}
                  </div>
                </div>
                <button
                  onClick={() => onRemediateChokePoint(cn.recommendedEdgeId)}
                  title={`Sever bridge edge: ${cn.recommendedEdgeLabel}`}
                  className="shrink-0 px-2 py-1 rounded bg-[#fff318] text-[#0a0a0c] font-bold text-[10px] hover:opacity-90 transition cursor-pointer"
                >
                  Sever
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. DIJKSTRA LEAST-COST ATTACK PATHS & ZERO-TRUST DRIFT */}
      <div className="p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#fff318] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#fff318]" />
            <span>Dijkstra Least-Cost Paths</span>
          </span>
          <span
            title="Edge weight = 1 / (target.criticality * target.vuln_cvss). Lower cost indicates higher exploitability towards Crown Jewels."
            className="text-[10px] text-[#fff318] font-mono cursor-help"
          >
            {shortestPaths.length} Paths
          </span>
        </div>

        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-0.5">
          {shortestPaths.slice(0, 4).map((p) => (
            <button
              key={p.id}
              onClick={() => onHighlightPath(p.nodeIds, p.edgeIds)}
              className="w-full text-left bg-zinc-950 hover:border-[#fff318] border border-zinc-800 rounded-md p-2 transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-white">
                <span className="truncate">
                  {p.sourceId} → {p.targetId}
                </span>
                <span className="text-[10px] font-mono text-[#fff318] shrink-0 ml-1">
                  cost={p.totalCost}
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                {p.nodeIds.join(' → ')}
              </div>
            </button>
          ))}
        </div>

        {/* Zero-Trust Standing Privilege Remediation */}
        <div className="pt-2 border-t border-[#fff318]/25">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-zinc-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#fff318]" />
              Dormant Standing Policies (&gt;90d)
            </span>
            <span className="font-mono font-bold text-[#fff318]">
              {dormantEdges.length} Active
            </span>
          </div>
          <button
            onClick={onRevokeDormantPrivileges}
            disabled={dormantEdges.length === 0}
            title="Enforce Least-Privilege Zero-Trust by revoking all CAN_ACCESS entitlements unused for >90 days (including the 120-day stale JumpHost SSH key)."
            className={`w-full py-1.5 px-3 rounded-lg text-xs font-extrabold border transition flex items-center justify-center gap-1.5 ${
              dormantEdges.length > 0
                ? 'bg-[#fff318]/15 hover:bg-[#fff318] hover:text-[#0a0a0c] border-[#fff318] text-[#fff318] cursor-pointer'
                : 'bg-zinc-950 border-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>
              {dormantEdges.length > 0
                ? `Revoke ${dormantEdges.length} Dormant Privileges (>90d)`
                : 'Zero-Trust Drift Remediated'}
            </span>
          </button>
          {severedEdgesCount > 0 && (
            <div className="text-[10px] text-[#fff318] text-center mt-1.5 font-bold">
              ✓ {severedEdgesCount} high-risk edge(s) severed in this session
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
