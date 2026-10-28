import React, { useState } from 'react';
import {
  ListFilter,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Crosshair,
} from 'lucide-react';
import { RawSiemAlert } from '../data/mockTopology';
import { CorrelatedIncident } from '../utils/graphAlgorithms';

interface BottomAlertTrayProps {
  rawAlerts: RawSiemAlert[];
  correlatedIncidents: CorrelatedIncident[];
  isNarrativeHighlighted: boolean;
  onHighlightIncident: (incident: CorrelatedIncident) => void;
  onClearHighlight: () => void;
  onSelectNode: (nodeId: string) => void;
}

export const BottomAlertTray: React.FC<BottomAlertTrayProps> = ({
  rawAlerts,
  correlatedIncidents,
  isNarrativeHighlighted,
  onHighlightIncident,
  onClearHighlight,
  onSelectNode,
}) => {
  const [trayView, setTrayView] = useState<'graphops' | 'siem'>('graphops');
  const [isExpanded, setIsExpanded] = useState(true);

  const primaryIncident = correlatedIncidents[0];

  return (
    <section
      className={`w-full bg-[#0a0a0c] border-t-2 border-[#fff318] transition-all duration-300 flex flex-col z-20 select-none ${
        isExpanded ? 'h-56' : 'h-11'
      }`}
    >
      {/* Top Bar of Tray: Toggle SIEM Raw View vs GraphOps Correlated Narrative */}
      <div className="h-11 shrink-0 px-4 border-b border-[#fff318]/25 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTrayView('graphops')}
            title="Weakly Connected Components (WCC) Graph Correlation View: Collapses 25 raw alerts into 1 actionable kill-chain narrative."
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-extrabold transition cursor-pointer ${
              trayView === 'graphops'
                ? 'bg-[#fff318] text-[#0a0a0c] shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1 Correlated Incident Narrative (GraphOps View)</span>
            <span
              className={`ml-1 px-1.5 py-0.2 text-[10px] rounded font-mono font-bold ${
                trayView === 'graphops'
                  ? 'bg-[#0a0a0c] text-[#fff318]'
                  : 'bg-[#fff318]/20 text-[#fff318]'
              }`}
            >
              96% Noise Reduction
            </span>
          </button>

          <button
            onClick={() => setTrayView('siem')}
            title="Traditional Flat SIEM Table View: 25 disconnected alerts causing SOC analyst alert fatigue."
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-extrabold transition cursor-pointer ${
              trayView === 'siem'
                ? 'bg-[#fff318] text-[#0a0a0c] shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>{rawAlerts.length} Raw Alerts (SIEM View)</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {isNarrativeHighlighted && (
            <button
              onClick={onClearHighlight}
              className="text-[11px] font-extrabold text-[#0a0a0c] bg-[#fff318] hover:opacity-90 px-2.5 py-0.5 rounded cursor-pointer"
            >
              Clear Path Highlight
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs font-semibold text-[#fff318] hover:opacity-80 cursor-pointer"
          >
            <span>{isExpanded ? 'Minimize Tray' : 'Expand Alert Collapser'}</span>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Tray Content Area */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto px-4 py-2.5">
          {trayView === 'graphops' && primaryIncident ? (
            <div
              onClick={() => onHighlightIncident(primaryIncident)}
              title="Click to highlight the entire multi-hop attack path on the Cytoscape canvas"
              className={`p-3 rounded-xl border transition cursor-pointer ${
                isNarrativeHighlighted
                  ? 'bg-zinc-900 border-2 border-[#fff318] shadow-lg'
                  : 'bg-zinc-950 border-[#fff318]/40 hover:border-[#fff318]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 text-[10px] font-mono font-extrabold uppercase rounded bg-[#fff318] text-[#0a0a0c]">
                    {primaryIncident.id} • {primaryIncident.severity}
                  </span>
                  <h3 className="text-xs font-extrabold text-white">
                    {primaryIncident.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-400">
                    WCC Merged:{' '}
                    <strong className="text-[#fff318]">
                      8 Attack Alerts + 17 Background Events → 1 Incident
                    </strong>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onHighlightIncident(primaryIncident);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#fff318] text-[#0a0a0c] text-xs font-extrabold hover:opacity-90 transition cursor-pointer"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>
                      {isNarrativeHighlighted
                        ? 'Attack Path Highlighted'
                        : 'Highlight Full Attack Path'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Horizontal Chronological MITRE Kill-Chain Step Sequence */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                {[
                  {
                    step: '01 • Initial Access',
                    tactic: 'T1190 / Phished OAuth',
                    chain: 'contractor-ext → Dev-Laptop-04',
                    detail: 'Unrecognized ASN token replay without MFA',
                    targetNode: 'Dev-Laptop-04',
                  },
                  {
                    step: '02 • Lateral Movement',
                    tactic: 'T1021 / 120d Stale SSH',
                    chain: 'Dev-Laptop-04 → JumpHost-Corp',
                    detail: 'Dormant standing SSH privilege exercised',
                    targetNode: 'JumpHost-Corp',
                  },
                  {
                    step: '03 • Privilege Escalation',
                    tactic: 'T1078 / Service JWT Dump',
                    chain: 'JumpHost-Corp → svc-cicd-runner',
                    detail: 'Tier-1 CI/CD automation account hijacked',
                    targetNode: 'svc-cicd-runner',
                  },
                  {
                    step: '04 • Exfiltration Risk',
                    tactic: 'T1048 / Crown Jewel PII',
                    chain: 'svc-cicd-runner → Customer-DB-Primary',
                    detail: '1.2M Customer PII records (DPDP 6h Window)',
                    targetNode: 'Customer-DB-Primary',
                  },
                ].map((stage, i) => (
                  <div
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectNode(stage.targetNode);
                      onHighlightIncident(primaryIncident);
                    }}
                    className="bg-black border border-[#fff318]/35 hover:border-[#fff318] rounded-lg p-2 transition"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#fff318] font-bold">
                      <span>{stage.step}</span>
                      <span>{stage.tactic}</span>
                    </div>
                    <div className="text-[11px] font-bold text-white mt-1 truncate">
                      {stage.chain}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
                      {stage.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* SIEM Raw 25 Alerts Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#fff318]/30 text-[10px] uppercase text-[#fff318]">
                    <th className="py-1.5 px-2">Alert ID</th>
                    <th className="py-1.5 px-2">Time</th>
                    <th className="py-1.5 px-2">Severity</th>
                    <th className="py-1.5 px-2">MITRE Tactic</th>
                    <th className="py-1.5 px-2">Source → Target</th>
                    <th className="py-1.5 px-2">Alert Title &amp; Raw Telemetry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 font-mono text-[11px]">
                  {rawAlerts.map((a) => (
                    <tr
                      key={a.id}
                      onClick={() => onSelectNode(a.targetHost)}
                      className={`hover:bg-zinc-900 cursor-pointer ${
                        a.isBreachNarrative ? 'bg-[#fff318]/10' : ''
                      }`}
                    >
                      <td className="py-1.5 px-2 font-bold text-[#fff318]">
                        {a.id}
                      </td>
                      <td className="py-1.5 px-2 text-zinc-400">
                        {a.timestamp}
                      </td>
                      <td className="py-1.5 px-2">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            a.severity === 'CRITICAL'
                              ? 'bg-red-500 text-white'
                              : a.severity === 'HIGH'
                              ? 'bg-[#fff318] text-[#0a0a0c]'
                              : a.severity === 'MEDIUM'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {a.severity}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-[#fff318]">
                        {a.mitreId} ({a.mitreTactic})
                      </td>
                      <td className="py-1.5 px-2 text-white">
                        {a.sourceHost} → {a.targetHost}
                      </td>
                      <td className="py-1.5 px-2 font-sans text-zinc-200">
                        <span className="font-semibold">{a.title}</span>
                        <span className="text-[10px] text-zinc-500 ml-2 font-mono">
                          {a.rawLog}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
