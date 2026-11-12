import React, { useState } from 'react';
import { useAppForge } from '../../context/AppForgeContext';
import { AppRequest, SDLCStageNumber } from '../../types/appforge';
import {
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { AdminLTEFilterCard } from '../adminlte/AdminLTEFilterCard';

interface KanbanColumn {
  id: string;
  title: string;
  stages: number[];
  nextStageTarget: number;
  accentColor: string;
  borderColor: string;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'col-ideation',
    title: '1. Intake & Ideation',
    stages: [1],
    nextStageTarget: 2,
    accentColor: 'bg-sky-500',
    borderColor: 'border-t-sky-500',
  },
  {
    id: 'col-planning',
    title: '2. Planning & Triage',
    stages: [2],
    nextStageTarget: 3,
    accentColor: 'bg-amber-500',
    borderColor: 'border-t-amber-500',
  },
  {
    id: 'col-specs',
    title: '3-4. Specs & Design',
    stages: [3, 4],
    nextStageTarget: 5,
    accentColor: 'bg-indigo-500',
    borderColor: 'border-t-indigo-500',
  },
  {
    id: 'col-dev',
    title: '5. Development',
    stages: [5],
    nextStageTarget: 6,
    accentColor: 'bg-blue-600',
    borderColor: 'border-t-blue-600',
  },
  {
    id: 'col-qa',
    title: '6. QA & Testing',
    stages: [6],
    nextStageTarget: 8,
    accentColor: 'bg-teal-600',
    borderColor: 'border-t-teal-600',
  },
  {
    id: 'col-rollout',
    title: '7-9. Rollout & Training',
    stages: [7, 8, 9],
    nextStageTarget: 10,
    accentColor: 'bg-cyan-600',
    borderColor: 'border-t-cyan-600',
  },
  {
    id: 'col-maintenance',
    title: '10-11. Production & Support',
    stages: [10, 11],
    nextStageTarget: 11,
    accentColor: 'bg-slate-700',
    borderColor: 'border-t-slate-700',
  },
];

export const KanbanView: React.FC = () => {
  const {
    requests,
    searchQuery,
    selectedDepartment,
    selectedUrgency,
    selectedType,
    setSelectedRequest,
    changeStage,
    setIsNewRequestModalOpen,
  } = useAppForge();

  const [gateToast, setGateToast] = useState<string | null>(null);

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchCode = r.code.toLowerCase().includes(q);
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchDept = r.department.toLowerCase().includes(q);
      if (!matchCode && !matchTitle && !matchDept) return false;
    }
    if (selectedDepartment !== 'All' && r.department !== selectedDepartment) return false;
    if (selectedUrgency !== 'All' && r.urgency !== selectedUrgency) return false;
    if (selectedType !== 'All' && r.type !== selectedType) return false;
    return true;
  });

  const handleAdvance = (
    e: React.MouseEvent,
    request: AppRequest,
    targetStage: number
  ) => {
    e.stopPropagation();
    const result = changeStage(request.id, targetStage);
    if (!result.success && result.reason) {
      setGateToast(result.reason);
      setTimeout(() => setGateToast(null), 5000);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto">
      
      {/* Toast Notification */}
      {gateToast && (
        <div className="fixed bottom-6 right-6 max-w-md bg-rose-900 text-white p-4 rounded shadow-2xl border border-rose-700 flex items-start gap-3 z-50 animate-in fade-in slide-in-from-bottom-5">
          <AlertCircle className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-white mb-0.5">Uratex SDLC Gate Rule</div>
            <div className="text-rose-200 leading-relaxed">{gateToast}</div>
          </div>
        </div>
      )}

      {/* AdminLTE Filter Card */}
      <AdminLTEFilterCard />

      {/* Header bar */}
      <div className="flex items-center justify-between text-xs text-slate-600 pb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-slate-800">Uratex SDLC Lifecycle Stages</span>
          <span className="text-slate-400">·</span>
          <span>Click "Advance" to test stage gate validations</span>
        </div>
        <button
          onClick={() => setIsNewRequestModalOpen(true)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800"
        >
          + Quick Add Request
        </button>
      </div>

      {/* Horizontal Scrolling Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[620px]">
        {KANBAN_COLUMNS.map((col) => {
          const colItems = filteredRequests.filter((r) => col.stages.includes(r.currentSDLCStage));

          return (
            <div
              key={col.id}
              className={`w-72 shrink-0 bg-slate-100/80 rounded-xl border-t-4 border border-slate-200/80 ${col.borderColor} flex flex-col max-h-[820px]`}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-slate-200 bg-white/70 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.accentColor}`} />
                  <span className="text-xs font-bold text-slate-800">{col.title}</span>
                </div>
                <span className="text-xs font-semibold font-mono px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 tabular-nums">
                  {colItems.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="p-2 space-y-2.5 overflow-y-auto flex-1">
                {colItems.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No requests in this stage
                  </div>
                ) : (
                  colItems.map((item) => {
                    const subDone = item.subtasks.filter((s) => s.completed).length;
                    const subTotal = item.subtasks.length;
                    const reqSigned =
                      item.sdlc.requirements.requesterSignedOff &&
                      item.sdlc.requirements.analystSignedOff;
                    const designApproved = item.sdlc.design.designApproved;
                    const uatDone = item.sdlc.testing.uatSignedOff;

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedRequest(item)}
                        className="bg-white rounded-lg p-3 shadow-xs border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all space-y-2.5 group"
                      >
                        {/* Top info: Code, Urgency, Type */}
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                            {item.code}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getUrgencyBadge(
                              item.urgency
                            )}`}
                          >
                            {item.urgency}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </h4>

                        {/* Department & Type */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[140px]">
                            {item.department}
                          </span>
                          <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                            {item.type}
                          </span>
                        </div>

                        {/* Gates Compliance Pills */}
                        <div className="flex items-center gap-1 text-[10px] text-slate-600 pt-1 border-t border-slate-100">
                          <span
                            className={`px-1.5 py-0.5 rounded font-mono ${
                              reqSigned ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-100 text-slate-400'
                            }`}
                            title="Requirements sign-off status"
                          >
                            Req {reqSigned ? '✓' : '—'}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded font-mono ${
                              designApproved
                                ? 'bg-purple-100 text-purple-800 font-bold'
                                : item.type === 'Quick Win'
                                ? 'bg-slate-100 text-slate-400'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                            title="Design approval status"
                          >
                            Des {designApproved ? '✓' : item.type === 'Quick Win' ? 'N/A' : '—'}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded font-mono ${
                              uatDone ? 'bg-teal-100 text-teal-800 font-bold' : 'bg-slate-100 text-slate-400'
                            }`}
                            title="UAT status"
                          >
                            UAT {uatDone ? '✓' : '—'}
                          </span>
                        </div>

                        {/* Subtasks Progress */}
                        {subTotal > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span>Subtasks</span>
                              <span className="font-mono tabular-nums">
                                {subDone}/{subTotal}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                              <div
                                className="bg-blue-600 h-1 rounded-full"
                                style={{ width: `${(subDone / subTotal) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Bottom Row: Lead Avatar & Advance Button */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={item.assignedLeadAvatar}
                              alt={item.assignedLead}
                              className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                              referrerPolicy="no-referrer"
                            />
                            <span className="text-[10px] text-slate-600 font-medium truncate max-w-[80px]">
                              {item.assignedLead.split(' ')[0]}
                            </span>
                          </div>

                          {col.nextStageTarget !== item.currentSDLCStage && (
                            <button
                              onClick={(e) => handleAdvance(e, item, col.nextStageTarget)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                              title={`Advance to Stage ${col.nextStageTarget}`}
                            >
                              <span>Advance</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
