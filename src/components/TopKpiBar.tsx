import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Server,
  Flame,
  Crown,
  RotateCcw,
  Sparkles,
  ArrowUpCircle,
  Clock,
} from 'lucide-react';
import { GraphNode } from '../data/mockTopology';

interface TopKpiBarProps {
  totalIdentities: number;
  totalAssets: number;
  totalVulns: number;
  rawAlertCount: number;
  mergedIncidentCount: number;
  crownJewelsExposedCount: number;
  totalCrownJewels: number;
  dpdpAlert: {
    triggered: boolean;
    exposedPiiNodes: GraphNode[];
    totalRecordsAtRisk: number;
    shortestBreachHops: number | null;
    triggeringCompromisedNode: string | null;
  };
  onResetTopology: () => void;
  onOpenVisualGallery: () => void;
}

export const TopKpiBar: React.FC<TopKpiBarProps> = ({
  totalIdentities,
  totalAssets,
  totalVulns,
  rawAlertCount,
  mergedIncidentCount,
  crownJewelsExposedCount,
  totalCrownJewels,
  dpdpAlert,
  onResetTopology,
  onOpenVisualGallery,
}) => {
  return (
    <header className="w-full bg-[#0a0a0c] border-b-2 border-[#fff318] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-20">
      {/* Brand Title & Status in Yellow #fff318 & Black Editorial Style */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#fff318] text-[#0a0a0c] font-black shadow-md">
          <ShieldAlert className="w-5 h-5 text-[#0a0a0c]" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-[#0a0a0c]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-tight text-white">
              GraphOps <span className="text-[#fff318] font-mono text-xs">SOC v4.2</span>
            </h1>
            <span
              title="Connected Graph Analytics Engine for Proactive Threat Hunting & Blast Radius Containment"
              className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-[#fff318] text-[#0a0a0c] cursor-help"
            >
              Yellow Edition
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Attack Path Mapping • Betweenness Choke Points • Real-Time Blast Containment
          </p>
        </div>
      </div>

      {/* Core KPI Metrics */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* KPI 1: Total Assets & Identities Tracked */}
        <div
          title={`Graph Topology Inventory: ${totalAssets} Enterprise Assets, ${totalIdentities} Identities (Users & Service Accounts), and ${totalVulns} Active CVE Advisories.`}
          className="bg-zinc-950 border border-[#fff318]/30 rounded-lg px-3 py-1.5 flex items-center gap-2.5 cursor-help"
        >
          <div className="p-1.5 rounded-md bg-[#fff318]/15 text-[#fff318]">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
              Assets &amp; Identities
            </div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="text-[#fff318]">
                {totalAssets + totalIdentities + totalVulns} Nodes
              </span>
              <span className="text-[10px] font-normal text-zinc-400">
                ({totalAssets} Hosts · {totalIdentities} IAM · {totalVulns} CVEs)
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Active Incidents (Merged from Raw SIEM Alerts) */}
        <div
          title="Weakly Connected Components (WCC) Alert Collapser: Merges 25 noisy disconnected SIEM alerts into 1 unified multi-stage attack narrative."
          className="bg-zinc-950 border border-[#fff318]/30 rounded-lg px-3 py-1.5 flex items-center gap-2.5 cursor-help"
        >
          <div className="p-1.5 rounded-md bg-red-500/20 text-red-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
              Active Incidents
            </div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="text-red-400">{mergedIncidentCount} Narrative</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-[#fff318] text-[#0a0a0c] font-extrabold rounded">
                from {rawAlertCount} SIEM Alerts (-96%)
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Crown Jewels Exposed */}
        <div
          title="Crown Jewels: Assets with Criticality >= 9 or storing regulated Customer/Employee PII data reachable via lateral paths."
          className="bg-zinc-950 border border-[#fff318]/30 rounded-lg px-3 py-1.5 flex items-center gap-2.5 cursor-help"
        >
          <div className="p-1.5 rounded-md bg-purple-500/20 text-purple-300">
            <Crown className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
              Crown Jewels Exposed
            </div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span
                className={
                  crownJewelsExposedCount > 0 ? 'text-[#fff318]' : 'text-emerald-400'
                }
              >
                {crownJewelsExposedCount} / {totalCrownJewels}
              </span>
              <span className="text-[10px] font-normal text-zinc-400">
                {crownJewelsExposedCount > 0 ? 'Lateral Path Open' : 'Isolated'}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: CERT-In / DPDP Act Regulatory Breach Alert */}
        {dpdpAlert.triggered ? (
          <div
            title={`CERT-In 6-Hour Reporting Mandate & India DPDP Act 2023 Compliance Alert: Compromised node (${dpdpAlert.triggeringCompromisedNode}) is within ${dpdpAlert.shortestBreachHops} hop(s) of Customer-DB-Primary containing 1.2M PII records.`}
            className="relative overflow-hidden bg-gradient-to-r from-red-950 via-amber-950 to-red-950 border-2 border-[#fff318] rounded-lg px-3.5 py-1.5 flex items-center gap-2.5 shadow-lg animate-pulse cursor-help"
          >
            <div className="p-1.5 rounded-md bg-[#fff318] text-[#0a0a0c]">
              <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#fff318]">
                  CERT-In / DPDP Act Breach Alert
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-red-600 text-white rounded">
                  ≤2 HOPS TO PII
                </span>
              </div>
              <div className="text-xs font-bold text-white">
                DPDP 6-Hour Disclosure Window: Active Threat Reachable to 1.2M Customer Records
              </div>
            </div>
          </div>
        ) : (
          <div
            title="All PII Data Stores are disconnected from compromised nodes within a 2-hop blast radius. Regulatory disclosure clock paused."
            className="bg-emerald-950/60 border-2 border-emerald-400 rounded-lg px-3.5 py-1.5 flex items-center gap-2.5 cursor-help"
          >
            <div className="p-1.5 rounded-md bg-emerald-400 text-[#0a0a0c]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                CERT-In / DPDP Act Status: Contained
              </div>
              <div className="text-xs font-semibold text-white">
                1.2M Customer Records Shielded (No 2-Hop Compromised Path)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons: Architecture Visuals, Reset Topology, Jump to Scroll Animation */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenVisualGallery}
          title="View the 6 newly generated 1808x2400 Yellow-Theme GraphOps Threat Posters"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#fff318] text-[#0a0a0c] hover:opacity-90 transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>01–06 Posters (1808×2400)</span>
        </button>

        <button
          onClick={onResetTopology}
          title="Restore initial breach topology and reset all severed edges or isolated systems"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-[#fff318] border border-[#fff318]/40 hover:bg-zinc-800 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Graph</span>
        </button>

        <a
          href="#top-scroll-showcase"
          title="Scroll up to the LeoParpeix Bee Scroll Animation Showcase"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 text-white border border-zinc-700 hover:border-[#fff318] transition"
        >
          <ArrowUpCircle className="w-3.5 h-3.5 text-[#fff318]" />
          <span>Up to Bee Scroll</span>
        </a>
      </div>
    </header>
  );
};
