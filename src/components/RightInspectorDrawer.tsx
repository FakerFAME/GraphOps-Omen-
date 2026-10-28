import React from 'react';
import {
  ShieldOff,
  Terminal,
  UserCheck,
  Server,
  Bug,
  ArrowRight,
  AlertOctagon,
  CheckCircle,
  Activity,
  Link2,
} from 'lucide-react';
import { GraphEdge, GraphNode } from '../data/mockTopology';

interface RightInspectorDrawerProps {
  selectedNode: GraphNode | null;
  selectedEdge: GraphEdge | null;
  allNodes: GraphNode[];
  allEdges: GraphEdge[];
  onContainNode: (nodeId: string) => void;
  onSeverEdge: (edgeId: string) => void;
  onSelectNode: (nodeId: string) => void;
  auditLog: string[];
}

export const RightInspectorDrawer: React.FC<RightInspectorDrawerProps> = ({
  selectedNode,
  selectedEdge,
  allEdges,
  onContainNode,
  onSeverEdge,
  onSelectNode,
  auditLog,
}) => {
  const outgoingEdges = selectedNode
    ? allEdges.filter((e) => e.source === selectedNode.id)
    : [];
  const incomingEdges = selectedNode
    ? allEdges.filter((e) => e.target === selectedNode.id)
    : [];

  const killChainSteps = [
    {
      step: 1,
      nodeId: 'contractor-ext',
      targetId: 'Dev-Laptop-04',
      tactic: 'T1190 Initial Access',
      desc: 'Phished contractor OAuth session replayed onto Dev-Laptop-04',
      active: allEdges.some((e) => e.id === 'edge-attack-1'),
    },
    {
      step: 2,
      nodeId: 'Dev-Laptop-04',
      targetId: 'JumpHost-Corp',
      tactic: 'T1021 Remote Services',
      desc: 'Lateral pivot via dormant SSH key unused for 120 days',
      active: allEdges.some(
        (e) => e.id === 'edge-attack-2-static' || e.id === 'edge-attack-2-dynamic'
      ),
    },
    {
      step: 3,
      nodeId: 'JumpHost-Corp',
      targetId: 'svc-cicd-runner',
      tactic: 'T1078 Valid Accounts',
      desc: 'Privilege escalation by dumping Tier-1 CI/CD runner JWT',
      active: allEdges.some((e) => e.id === 'edge-attack-3'),
    },
    {
      step: 4,
      nodeId: 'svc-cicd-runner',
      targetId: 'Customer-DB-Primary',
      tactic: 'T1048 Exfiltration',
      desc: 'pg_dump execution against Crown Jewel DB (1.2M PII rows)',
      active: allEdges.some((e) => e.id === 'edge-attack-4'),
    },
  ];

  return (
    <aside className="w-84 shrink-0 h-full bg-[#0a0a0c] border-l-2 border-[#fff318]/40 flex flex-col overflow-y-auto select-none">
      {/* Drawer Header */}
      <div className="p-3.5 border-b border-[#fff318]/25 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#fff318]" />
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#fff318]">
            Telemetry &amp; Kill-Chain Inspector
          </h2>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#fff318] text-[#0a0a0c]">
          {selectedNode
            ? selectedNode.type
            : selectedEdge
            ? selectedEdge.relationship
            : 'Kill-Chain'}
        </span>
      </div>

      {/* SECTION A: SELECTED NODE DETAILS */}
      {selectedNode && (
        <div className="p-3.5 border-b border-[#fff318]/25 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-lg border ${
                  selectedNode.compromised
                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                    : (selectedNode.criticality ?? 0) >= 9 || selectedNode.pii_data
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                    : 'bg-[#fff318]/15 border-[#fff318]/40 text-[#fff318]'
                }`}
              >
                {selectedNode.type === 'Identity' ? (
                  <UserCheck className="w-5 h-5" />
                ) : selectedNode.type === 'Vulnerability' ? (
                  <Bug className="w-5 h-5" />
                ) : (
                  <Server className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="text-sm font-extrabold text-white leading-tight">
                  {selectedNode.label}
                </div>
                <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                  <span>{selectedNode.type}</span>
                  {selectedNode.zone && (
                    <span className="px-1.5 py-0.2 rounded bg-[#fff318]/15 text-[#fff318] font-mono text-[10px] font-bold">
                      Zone: {selectedNode.zone}
                    </span>
                  )}
                  {selectedNode.tier && (
                    <span className="px-1.5 py-0.2 rounded bg-[#fff318]/15 text-[#fff318] font-mono text-[10px] font-bold">
                      Tier {selectedNode.tier}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {selectedNode.compromised && (
              <span
                title="Confirmed adversary compromise via EDR/SIEM telemetry"
                className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse"
              >
                Compromised
              </span>
            )}
          </div>

          {/* Properties Grid */}
          <div className="bg-zinc-950 border border-[#fff318]/30 rounded-lg p-2.5 grid grid-cols-2 gap-2 text-xs">
            {selectedNode.type === 'Asset' && (
              <>
                <div>
                  <span className="text-[10px] text-zinc-500 block">
                    Criticality Score
                  </span>
                  <span className="font-bold text-[#fff318]">
                    {selectedNode.criticality} / 10
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">
                    IP Address
                  </span>
                  <span className="font-mono text-white">
                    {selectedNode.ip ?? 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">
                    Operating System
                  </span>
                  <span className="text-white truncate block">
                    {selectedNode.os ?? 'Linux'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">
                    Regulated PII Data
                  </span>
                  <span
                    className={`font-bold ${
                      selectedNode.pii_data ? 'text-[#fff318]' : 'text-zinc-400'
                    }`}
                  >
                    {selectedNode.pii_data
                      ? `Yes (${((selectedNode.pii_records ?? 0) / 1000).toFixed(0)}k rows)`
                      : 'None'}
                  </span>
                </div>
              </>
            )}

            {selectedNode.type === 'Identity' && (
              <>
                <div>
                  <span className="text-[10px] text-zinc-500 block">
                    Privilege Tier
                  </span>
                  <span className="font-bold text-[#fff318]">
                    Tier {selectedNode.tier}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">
                    MFA Enforced
                  </span>
                  <span
                    className={`font-bold ${
                      selectedNode.mfa ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {selectedNode.mfa ? 'Enabled (FIDO2)' : 'Disabled (Risk)'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-zinc-500 block">
                    Department / Scope
                  </span>
                  <span className="text-white">
                    {selectedNode.department}
                  </span>
                </div>
              </>
            )}

            {selectedNode.type === 'Vulnerability' && (
              <>
                <div>
                  <span className="text-[10px] text-zinc-500 block">
                    CVE Identifier
                  </span>
                  <span className="font-mono font-bold text-red-400">
                    {selectedNode.cve_id}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">
                    CVSS Base Score
                  </span>
                  <span className="font-bold text-[#fff318]">
                    {selectedNode.cvss} / 10.0
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-zinc-500 block">
                    Advisory Summary
                  </span>
                  <span className="text-zinc-300 text-[11px] leading-snug block mt-0.5">
                    {selectedNode.description}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="text-[11px] flex items-center justify-between text-zinc-400 px-1">
            <span>Incoming Vectors: {incomingEdges.length}</span>
            <span>Outgoing Vectors: {outgoingEdges.length}</span>
          </div>

          {/* "Contain System" Action Button */}
          {selectedNode.type !== 'Vulnerability' && (
            <button
              onClick={() => onContainNode(selectedNode.id)}
              disabled={outgoingEdges.length === 0}
              title="Isolate this node in real time by severing all outgoing lateral and entitlement edges from the active graph state."
              className={`w-full py-2 px-3 rounded-lg font-extrabold text-xs flex items-center justify-center gap-2 transition ${
                outgoingEdges.length > 0
                  ? 'bg-[#fff318] hover:opacity-90 text-[#0a0a0c] shadow-lg cursor-pointer'
                  : 'bg-zinc-900 text-emerald-400 border border-emerald-500/30 cursor-not-allowed'
              }`}
            >
              {outgoingEdges.length > 0 ? (
                <>
                  <ShieldOff className="w-4 h-4" />
                  <span>
                    Contain System (Sever {outgoingEdges.length} Outgoing Edges)
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>System Contained &amp; Isolated</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* SECTION B: SELECTED EDGE DETAILS */}
      {selectedEdge && (
        <div className="p-3.5 border-b border-[#fff318]/25 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#fff318] flex items-center gap-1.5">
              <Link2 className="w-4 h-4" />
              <span>{selectedEdge.relationship}</span>
            </span>
            {selectedEdge.is_attack_edge && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500/20 text-red-300 border border-red-500/40">
                Active Attack Telemetry
              </span>
            )}
          </div>

          <div className="bg-zinc-950 border border-[#fff318]/30 rounded-lg p-2.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Source:</span>
              <span className="font-mono font-semibold text-white">
                {selectedEdge.source}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Target:</span>
              <span className="font-mono font-semibold text-[#fff318]">
                {selectedEdge.target}
              </span>
            </div>
            {selectedEdge.mitre_tactic && (
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">MITRE ATT&amp;CK:</span>
                <span className="font-semibold text-red-400">
                  {selectedEdge.mitre_tactic}
                </span>
              </div>
            )}
            {selectedEdge.port !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Port / Protocol:</span>
                <span className="font-mono text-white">
                  TCP/{selectedEdge.port}
                </span>
              </div>
            )}
            {selectedEdge.last_used_days !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Last Exercised:</span>
                <span
                  className={`font-bold ${
                    selectedEdge.last_used_days > 90
                      ? 'text-[#fff318]'
                      : 'text-emerald-400'
                  }`}
                >
                  {selectedEdge.last_used_days} days ago
                  {selectedEdge.last_used_days > 90 ? ' (Stale Drift)' : ''}
                </span>
              </div>
            )}
            {selectedEdge.process && (
              <div className="pt-1 border-t border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">
                  Observed Process Command:
                </span>
                <code className="text-[11px] text-[#fff318] font-mono break-all">
                  {selectedEdge.process}
                </code>
              </div>
            )}
          </div>

          <button
            onClick={() => onSeverEdge(selectedEdge.id)}
            className="w-full py-2 px-3 rounded-lg bg-[#fff318] hover:opacity-90 text-[#0a0a0c] font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <ShieldOff className="w-4 h-4" />
            <span>Revoke &amp; Sever This Vector</span>
          </button>
        </div>
      )}

      {/* SECTION C: MITRE ATT&CK KILL-CHAIN BREADCRUMB */}
      <div className="p-3.5 border-b border-[#fff318]/25">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#fff318] flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-[#fff318]" />
            <span>MITRE ATT&amp;CK Kill-Chain Breadcrumb</span>
          </span>
        </div>

        <div className="space-y-2">
          {killChainSteps.map((s) => (
            <div
              key={s.step}
              onClick={() => onSelectNode(s.targetId)}
              className={`p-2.5 rounded-lg border transition cursor-pointer ${
                s.active
                  ? 'bg-zinc-950 border-[#fff318]/45 hover:border-[#fff318]'
                  : 'bg-emerald-950/20 border-emerald-500/30 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span
                  className={`font-mono font-extrabold px-1.5 py-0.2 rounded ${
                    s.active
                      ? 'bg-[#fff318] text-[#0a0a0c]'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  Step 0{s.step} • {s.tactic}
                </span>
                <span
                  className={`font-bold ${
                    s.active ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {s.active ? 'ACTIVE' : 'SEVERED'}
                </span>
              </div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                <span>{s.nodeId}</span>
                <ArrowRight className="w-3 h-3 text-[#fff318] shrink-0" />
                <span className="text-[#fff318]">{s.targetId}</span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION D: REAL-TIME SOC CONTAINMENT AUDIT LOG */}
      <div className="p-3.5 flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#fff318] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#fff318]" />
            <span>SOAR Response Audit Log</span>
          </span>
        </div>
        <div className="bg-zinc-950 border border-[#fff318]/30 rounded-lg p-2.5 space-y-1.5 font-mono text-[10px] max-h-40 overflow-y-auto">
          {auditLog.map((entry, idx) => (
            <div
              key={idx}
              className="text-zinc-300 border-b border-zinc-900 pb-1 last:border-none"
            >
              {entry}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
