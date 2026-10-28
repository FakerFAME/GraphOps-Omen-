import React from 'react';
import { X, Sparkles, ShieldAlert, Scissors, Layers, KeyRound, Route, Crown } from 'lucide-react';

interface VisualBlueprintsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VisualBlueprintsModal: React.FC<VisualBlueprintsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const blueprints = [
    {
      title: '01 • Blast Radius Simulator (1-to-3 Hop BFS)',
      subtitle: '1808×2400 Portrait Resolution • Yellow Edition',
      img: '/graphops-1.jpg',
      icon: ShieldAlert,
      badge: '1808×2400',
      desc: 'Breadth-First Search reachability rings radiating from compromised endpoints toward Customer-DB-Primary (1.2M PII rows).',
    },
    {
      title: '02 • Choke Point Remediation (Centrality)',
      subtitle: '1808×2400 Portrait Resolution • Yellow Edition',
      img: '/graphops-2.jpg',
      icon: Scissors,
      badge: '1808×2400',
      desc: 'Betweenness Centrality bridge isolation severing JumpHost-Corp → svc-cicd-runner in one click.',
    },
    {
      title: '03 • SIEM Alert Collapser (WCC Merge)',
      subtitle: '1808×2400 Portrait Resolution • Yellow Edition',
      img: '/graphops-3.jpg',
      icon: Layers,
      badge: '1808×2400',
      desc: 'Weakly Connected Components prism merging 25 noisy SIEM alerts into 1 unified MITRE ATT&CK kill-chain narrative.',
    },
    {
      title: '04 • Zero-Trust Entitlement Drift (>90d)',
      subtitle: '1808×2400 Portrait Resolution • Yellow Edition',
      img: '/graphops-4.jpg',
      icon: KeyRound,
      badge: '1808×2400',
      desc: 'Detects and revokes dormant standing CAN_ACCESS privileges unused for over 90 days (120d legacy SSH key).',
    },
    {
      title: '05 • Dijkstra Least-Cost Attack Paths',
      subtitle: '1808×2400 Portrait Resolution • Yellow Edition',
      img: '/graphops-5.jpg',
      icon: Route,
      badge: '1808×2400',
      desc: 'Computes minimum-cost lateral paths weighted by 1 / (Target Criticality × Vulnerability CVSS).',
    },
    {
      title: '06 • DPDP 6-Hour Crown Jewel Containment',
      subtitle: '1808×2400 Portrait Resolution • Yellow Edition',
      img: '/graphops-6.jpg',
      icon: Crown,
      badge: '1808×2400',
      desc: 'Continuous 2-hop PII exposure guard enforcing CERT-In and India DPDP Act 6-hour breach disclosure compliance.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0a0a0c] border-2 border-[#fff318] rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-5 py-3.5 bg-[#fff318] text-[#0a0a0c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0a0a0c]" />
            <h2 className="text-sm font-extrabold uppercase tracking-wide">
              GraphOps SOC — All 6 Generated 1808×2400 Yellow-Theme Spotlight Posters
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#0a0a0c] text-[#fff318] hover:opacity-90 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {blueprints.map((bp, i) => {
            const Icon = bp.icon;
            return (
              <div
                key={i}
                className="bg-zinc-950 border border-[#fff318]/40 rounded-xl overflow-hidden flex flex-col"
              >
                <div className="h-72 overflow-hidden relative bg-black">
                  <img
                    src={bp.img}
                    alt={bp.title}
                    className="w-full h-full object-contain hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-mono font-extrabold rounded bg-[#fff318] text-[#0a0a0c]">
                    {bp.badge}
                  </span>
                </div>
                <div className="p-3.5 flex-1 flex flex-col border-t border-[#fff318]/20">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#fff318]">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{bp.title}</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                    {bp.subtitle}
                  </div>
                  <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                    {bp.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
