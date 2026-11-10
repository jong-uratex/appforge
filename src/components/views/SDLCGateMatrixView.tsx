import React from 'react';
import { useAppForge } from '../../context/AppForgeContext';
import { SDLC_STAGES_CONFIG } from '../../data/seedData';
import { GitFork, CheckCircle, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';

export const SDLCGateMatrixView: React.FC = () => {
  const { requests, setSelectedRequest } = useAppForge();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-purple-100 text-purple-700">
              <GitFork className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Official Uratex Software Development Life Cycle (SDLC) Stage Specification
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Reference standard for internal app intake, stakeholder sign-offs, development gates,
            and deployment governance.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-purple-50 text-purple-900 px-3 py-1.5 rounded-lg border border-purple-200 shrink-0">
          <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
          <span className="font-semibold">Uratex SDLC Policy V2026.1</span>
        </div>
      </div>

      {/* 11-Stage Interactive Compliance Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[200px]">SDLC Stage</th>
                <th className="py-3 px-4 min-w-[280px]">What Happens in the Request System</th>
                <th className="py-3 px-4 min-w-[190px]">Who is Involved</th>
                <th className="py-3 px-4 min-w-[260px]">System Features Needed</th>
                <th className="py-3 px-4 min-w-[200px]">Active Uratex Requests</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SDLC_STAGES_CONFIG.map((cfg) => {
                const activeInStage = requests.filter((r) => r.currentSDLCStage === cfg.stage);

                return (
                  <tr key={cfg.stage} className="hover:bg-slate-50/70 transition-colors">
                    {/* Stage number badge */}
                    <td className="py-3 px-3 text-center align-top">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-bold text-xs ${cfg.badgeColor}`}
                      >
                        {cfg.stage}
                      </span>
                    </td>

                    {/* Title & Status */}
                    <td className="py-3 px-4 align-top">
                      <div className="font-bold text-slate-900 mb-0.5">{cfg.title}</div>
                      <span className="inline-block text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        Status: {cfg.status}
                      </span>
                    </td>

                    {/* What happens in system */}
                    <td className="py-3 px-4 align-top text-slate-700 leading-relaxed">
                      {cfg.stage === 1 &&
                        'Employee identifies a problem or opportunity and submits a request (New App, Enhancement, or Quick Win). Basic idea, pain point, and expected business benefits are captured.'}
                      {cfg.stage === 2 &&
                        'Department Manager reviews the request. IT Lead conducts high-level triage (effort ballpark estimate in man-days, impact scoring, priority WSJF/RICE). Decision is made to proceed, defer, or reject.'}
                      {cfg.stage === 3 &&
                        'Detailed functional requirements are gathered. Requester and stakeholders clarify user stories and acceptance criteria. Functional specifications are documented and signed off.'}
                      {cfg.stage === 4 &&
                        'Technical design is created (architecture, database schema, UI mockups, SAP/ERP integrations). Design is reviewed, security checked, and approved before coding starts.'}
                      {cfg.stage === 5 &&
                        'Actual coding and building of the new app or enhancement is performed. Tasks are assigned, sprints tracked, and progress updated regularly with version/PR links.'}
                      {cfg.stage === 6 &&
                        'Functional, integration, and User Acceptance Testing (UAT) are performed. Test case checklist runs, bugs logged, and formal UAT sign-off obtained.'}
                      {cfg.stage === 7 &&
                        'User manuals, system documentation, and process guides are created or updated with version control and linked to the internal MIS knowledge base.'}
                      {cfg.stage === 8 &&
                        'System is deployed to production. Pre-flight checklist is completed (database migration, security clearance, rollback plan) and go-live notification broadcasted.'}
                      {cfg.stage === 9 &&
                        'End users and plant staff are trained on the system. Schedules arranged, attendance tracked, training materials uploaded, and feedback recorded.'}
                      {cfg.stage === 10 &&
                        'After go-live, the system is evaluated. Feedback survey is collected on whether it solved the original problem, tracking hours saved and ROI.'}
                      {cfg.stage === 11 &&
                        'Ongoing support, bug fixes, minor improvements, and monitoring. System health, uptime SLA compliance, and future enhancement requests are linked.'}
                    </td>

                    {/* Who is involved */}
                    <td className="py-3 px-4 align-top">
                      <div className="flex items-start gap-1.5 text-slate-800 font-medium">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{cfg.whoIsInvolved}</span>
                      </div>
                    </td>

                    {/* System features needed */}
                    <td className="py-3 px-4 align-top text-slate-600 leading-relaxed text-[11px]">
                      {cfg.systemFeaturesNeeded}
                    </td>

                    {/* Active Requests Pills */}
                    <td className="py-3 px-4 align-top">
                      {activeInStage.length === 0 ? (
                        <span className="text-slate-400 text-[11px] italic">No active requests</span>
                      ) : (
                        <div className="space-y-1.5">
                          {activeInStage.map((req) => (
                            <button
                              key={req.id}
                              onClick={() => setSelectedRequest(req)}
                              className="w-full text-left p-1.5 rounded-md bg-blue-50/80 hover:bg-blue-100 border border-blue-200 transition-colors group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px] font-bold text-blue-800">
                                  {req.code}
                                </span>
                                <span className="text-[10px] text-slate-400 group-hover:text-blue-700">
                                  View →
                                </span>
                              </div>
                              <div className="text-[11px] font-semibold text-slate-800 truncate mt-0.5">
                                {req.title}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
