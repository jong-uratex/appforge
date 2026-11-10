import React, { useState } from 'react';
import { useAppForge } from '../../context/AppForgeContext';
import { SDLCStageNumber, SystemStatus } from '../../types/appforge';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  MessageSquare,
  ListTodo,
  History,
  FileCheck2,
  FileText,
  CheckSquare,
  Square,
  ExternalLink,
  Send,
  Star,
  Shield,
  Layers,
  Bug,
  Plus,
  GitFork,
  Lock,
  Printer,
  PenTool,
} from 'lucide-react';

export const RequestDetailDrawer: React.FC = () => {
  const {
    selectedRequest,
    setSelectedRequest,
    currentUser,
    permissions,
    workflows,
    assignWorkflowToProject,
    changeStage,
    approveManager,
    signOffRequirements,
    signOffDesign,
    signOffUAT,
    toggleSubtask,
    addSubtask,
    addComment,
    addTestCase,
    updateTestCaseStatus,
    addBug,
    submitEvaluation,
    updateRequest,
    setIsNewTaskModalOpen,
    tasks,
    setActiveView,
    updateSCRFormData,
    signApprover,
    addSCRBusinessRequirement,
  } = useAppForge();

  const [activeTab, setActiveTab] = useState<'scr' | 'sdlc' | 'updates' | 'subtasks' | 'audit'>('scr');
  const [newComment, setNewComment] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newTestCaseTitle, setNewTestCaseTitle] = useState('');
  const [newTestCaseExpected, setNewTestCaseExpected] = useState('');
  const [gateErrorMessage, setGateErrorMessage] = useState<string | null>(null);
  const [newReqNumber, setNewReqNumber] = useState('');
  const [newReqDesc, setNewReqDesc] = useState('');

  // Evaluation form local state
  const [evalRating, setEvalRating] = useState(selectedRequest?.sdlc.evaluation.rating || 5);
  const [evalFeedback, setEvalFeedback] = useState(
    selectedRequest?.sdlc.evaluation.surveyFeedback || ''
  );
  const [evalHours, setEvalHours] = useState(
    selectedRequest?.sdlc.evaluation.hoursSavedPerWeek || 20
  );
  const [evalROI, setEvalROI] = useState(selectedRequest?.sdlc.evaluation.roiSummary || '');
  const [evalLessons, setEvalLessons] = useState(
    selectedRequest?.sdlc.evaluation.lessonsLearned || ''
  );

  if (!selectedRequest) return null;

  const item = selectedRequest;
  const currentWorkflow = workflows.find((w) => w.id === item.workflowId) || workflows[0];
  const projectTasks = tasks.filter((t) => t.projectId === item.id);

  const handleStageChangeClick = (stageOrder: number, stageName: string) => {
    const res = changeStage(item.id, stageOrder, stageName);
    if (!res.success && res.reason) {
      setGateErrorMessage(res.reason);
      setTimeout(() => setGateErrorMessage(null), 6000);
    } else {
      setGateErrorMessage(null);
    }
  };

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment(item.id, newComment.trim());
    setNewComment('');
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(item.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  const handleAddTestCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestCaseTitle.trim()) return;
    addTestCase(
      item.id,
      newTestCaseTitle.trim(),
      newTestCaseExpected.trim() || 'Expected standard operational result without errors'
    );
    setNewTestCaseTitle('');
    setNewTestCaseExpected('');
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    submitEvaluation(item.id, evalRating, evalFeedback, evalHours, evalROI, evalLessons);
  };

  const reqSigned =
    item.sdlc.requirements.requesterSignedOff && item.sdlc.requirements.analystSignedOff;
  const designApproved = item.sdlc.design.designApproved;
  const uatSigned = item.sdlc.testing.uatSignedOff;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      
      {/* Drawer Container */}
      <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        
        {/* Top Bar Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                {item.code}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {item.type}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                {item.department}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                {item.urgency} Urgency
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                <GitFork className="w-3 h-3" />
                {currentWorkflow.name}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {item.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5">
              <span>Requester: <strong className="text-slate-700">{item.requesterName}</strong></span>
              <span>·</span>
              <span>Lead: <strong className="text-slate-700">{item.assignedLead}</strong></span>
              <span>·</span>
              <span>Target: <strong className="text-slate-700 font-mono">{item.targetGoLiveDate}</strong></span>
              <span>·</span>
              <span>Active Workflow: 
                <select
                  value={item.workflowId}
                  onChange={(e) => assignWorkflowToProject(item.id, e.target.value)}
                  className="ml-1 text-[11px] font-semibold text-slate-800 bg-white border border-slate-300 rounded px-1.5 py-0.5"
                >
                  {workflows.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setActiveView('scr-document');
                setSelectedRequest(item);
              }}
              className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
              title="Open full printable 5-page Uratex SCR Document"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Full SCR Document</span>
            </button>
            <button
              onClick={() => setSelectedRequest(null)}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gate Policy Toast if triggered */}
        {gateErrorMessage && (
          <div className="p-3 bg-rose-50 border-b border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">
              {gateErrorMessage}
            </div>
          </div>
        )}

        {/* Interactive Custom Workflow Pipeline Stepper */}
        <div className="p-3.5 bg-slate-100/90 border-b border-slate-200 overflow-x-auto select-none">
          <div className="flex items-center gap-1.5 min-w-max">
            {currentWorkflow.stages.map((stg) => {
              const isCurrent = stg.order === item.currentSDLCStage;
              const isPast = stg.order < item.currentSDLCStage;

              return (
                <button
                  key={stg.id}
                  onClick={() => handleStageChangeClick(stg.order, stg.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                    isCurrent
                      ? `${stg.badgeColor} font-bold shadow-xs scale-102`
                      : isPast
                      ? 'bg-emerald-50 text-emerald-800 font-medium hover:bg-emerald-100 border border-emerald-200'
                      : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                  }`}
                  title={`${stg.order}. ${stg.name}: ${stg.description}`}
                >
                  <span className="font-mono text-[10px] tabular-nums font-bold">
                    {stg.order}
                  </span>
                  <span className="truncate max-w-[120px]">{stg.name}</span>
                  {isPast && <span className="text-[10px] font-bold">✓</span>}
                  {stg.isGate && !isPast && !isCurrent && (
                    <span className="text-[9px] opacity-70">🔒</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Monday.com Tabs */}
        <div className="flex items-center gap-1 px-5 border-b border-slate-200 bg-white text-xs font-semibold text-slate-600 overflow-x-auto">
          <button
            onClick={() => setActiveTab('scr')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors shrink-0 ${
              activeTab === 'scr'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Uratex SCR Form</span>
            <span className="ml-1 text-[10px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded">
              PDF Spec
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sdlc')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors shrink-0 ${
              activeTab === 'sdlc'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Workflow Workflows & Gate Checklists</span>
          </button>

          <button
            onClick={() => setActiveTab('updates')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors shrink-0 ${
              activeTab === 'updates'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Updates & Discussion ({item.comments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('subtasks')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors shrink-0 ${
              activeTab === 'subtasks'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>Project Tasks ({projectTasks.length + item.subtasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors shrink-0 ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Stage Gate Audit</span>
          </button>
        </div>

        {/* Tab Contents (Scrollable Area) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          
          {/* TAB 0: URATEX SCR FORM SPECIFICATION */}
          {activeTab === 'scr' && (
            <div className="space-y-6">
              {/* Official Uratex Document Header Card */}
              <div className="border-2 border-slate-800 rounded-xl overflow-hidden bg-white shadow-xs">
                <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-mono tracking-widest text-blue-300 uppercase">
                      URATEX PHILIPPINES · MULTIFLEX RNC CORP
                    </div>
                    <h3 className="text-base font-extrabold tracking-tight">
                      SYSTEM CHANGE REQUEST FORM
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveView('scr-document');
                        setSelectedRequest(item);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Full 5-Page View</span>
                    </button>
                  </div>
                </div>

                {/* Document Information Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-200 text-xs divide-x divide-slate-200 divide-y md:divide-y-0">
                  <div className="p-3 bg-slate-50/50">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Document No:</span>
                    <span className="font-mono font-bold text-blue-900 text-xs">
                      {item.scr?.documentNo || item.code}
                    </span>
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Date:</span>
                    <span className="font-mono text-slate-800">{item.scr?.requestDate || item.startDate}</span>
                  </div>
                  <div className="p-3 bg-slate-50/50">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Requested By:</span>
                    <span className="font-semibold text-slate-900">{item.scr?.requestedBy || item.requesterName}</span>
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Department:</span>
                    <span className="text-slate-800">{item.scr?.department || item.department}</span>
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">System / Application:</span>
                    <span className="font-bold text-slate-900">{item.scr?.systemApplication || item.title}</span>
                  </div>
                  <div className="p-3 bg-slate-50/50">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Module:</span>
                    <span className="text-slate-800 font-semibold">{item.scr?.module || 'Price Set-Up'}</span>
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Priority:</span>
                    <span className="font-bold text-rose-700">{item.scr?.priority || item.urgency}</span>
                  </div>
                  <div className="p-3 bg-slate-50/50">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Status:</span>
                    <span className="font-semibold text-blue-800">{item.status}</span>
                  </div>
                </div>

                {/* Section 1: Change Request Information */}
                <div className="p-4 border-b border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wide bg-slate-100 px-2 py-1 rounded">
                    1. Change Request Information
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block mb-1.5">Change Type:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {([
                        'New Functionality',
                        'Enhancement',
                        'Process Change',
                        'Data/Configuration Change',
                        'Bug/Error Correction',
                        'Integration Change',
                        'Report/Dashboard Change',
                        'Security/Access Change',
                      ] as const).map((ct) => {
                        const isChecked = (item.scr?.typesOfChange || []).includes(ct);
                        return (
                          <div
                            key={ct}
                            onClick={() => {
                              if (!item.scr) return;
                              const currentTypes = item.scr.typesOfChange || [];
                              const newTypes = isChecked
                                ? currentTypes.filter((t) => t !== ct)
                                : [...currentTypes, ct];
                              updateSCRFormData(item.id, { typesOfChange: newTypes });
                            }}
                            className={`flex items-center gap-2 p-2 rounded border cursor-pointer select-none transition-colors ${
                              isChecked
                                ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span className="text-[11px] leading-tight">{ct}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Situation / Problem:</span>
                      <p className="text-slate-800 leading-relaxed text-xs">
                        {item.scr?.currentSituation?.join(' ') || item.sdlc.ideation.problemDescription}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Requested Change:</span>
                      <p className="text-slate-800 leading-relaxed text-xs">
                        {item.scr?.requestedChange?.join(' ') || item.title}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Business Justification */}
                <div className="p-4 border-b border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wide bg-slate-100 px-2 py-1 rounded">
                    2. Business Justification / Impact of Not Doing
                  </div>
                  <div className="p-3 bg-blue-50/50 rounded border border-blue-100 text-slate-800 leading-relaxed text-xs">
                    {item.scr?.businessReasons?.join(' ') || item.sdlc.ideation.businessJustification}
                  </div>
                </div>

                {/* Section 3: Business Requirements */}
                <div className="p-4 border-b border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-900 uppercase tracking-wide bg-slate-100 px-2 py-1 rounded">
                      3. Business Requirements ({item.scr?.businessRequirements?.length || 0})
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold text-[11px]">
                        <tr>
                          <th className="py-1.5 px-3 w-20">Req #</th>
                          <th className="py-1.5 px-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {(item.scr?.businessRequirements || []).map((br, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono font-bold text-blue-700">{br.no}</td>
                            <td className="py-2 px-3 text-slate-800 leading-relaxed">{br.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Requirement inline */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="BR-04"
                      value={newReqNumber}
                      onChange={(e) => setNewReqNumber(e.target.value)}
                      className="w-24 px-2 py-1 border border-slate-300 rounded font-mono text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Enter new business requirement specification..."
                      value={newReqDesc}
                      onChange={(e) => setNewReqDesc(e.target.value)}
                      className="flex-1 px-2 py-1 border border-slate-300 rounded text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newReqDesc.trim()) return;
                        addSCRBusinessRequirement(item.id, {
                          no: newReqNumber.trim() || `BR-0${(item.scr?.businessRequirements?.length || 0) + 1}`,
                          description: newReqDesc.trim(),
                        });
                        setNewReqNumber('');
                        setNewReqDesc('');
                      }}
                      className="px-3 py-1 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-700 shrink-0"
                    >
                      + Add Req
                    </button>
                  </div>
                </div>

                {/* Section 9: Signatures Matrix from Official PDF */}
                <div className="p-4 space-y-3">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wide bg-slate-100 px-2 py-1 rounded">
                    9. Approval & Signatures (Official Uratex Matrix)
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Mandatory multi-level sign-offs matching the attached Uratex change control process.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(item.scr?.approvers || []).map((appr) => {
                      const isSigned = appr.signed;
                      return (
                        <div
                          key={appr.id}
                          className={`p-3 rounded-lg border transition-all ${
                            isSigned
                              ? 'bg-emerald-50/70 border-emerald-300'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold uppercase text-slate-500">
                              {appr.role}
                            </span>
                            {isSigned ? (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                                Signed
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                                Pending
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-slate-900 text-xs">{appr.name}</div>
                          {isSigned ? (
                            <div className="pt-2 text-[10px] text-slate-500 font-mono">
                              <div>Sig: <strong className="text-emerald-900">{appr.signatureText}</strong></div>
                              <div>Date: {appr.signedDate}</div>
                            </div>
                          ) : (
                            <div className="pt-2">
                              <button
                                type="button"
                                onClick={() => signApprover(item.id, appr.id, currentUser.name)}
                                className="w-full py-1 px-2 text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center gap-1 shadow-2xs"
                              >
                                <PenTool className="w-3 h-3" />
                                <span>Sign as {currentUser.name.split(' ')[0]}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: SDLC WORKFLOWS & CHECKLISTS */}
          {activeTab === 'sdlc' && (
            <div className="space-y-6">
              
              {/* STAGE 1: CONCEPTION / IDEATION */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-sky-500 text-white font-bold flex items-center justify-center text-xs">
                      1
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Conception / Problem Intake
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Submitted: {item.sdlc.ideation.submittedAt}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <span className="font-bold text-slate-800 block mb-0.5">Problem Statement:</span>
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {item.sdlc.ideation.problemDescription}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block mb-0.5">Expected Business Benefit:</span>
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {item.sdlc.ideation.expectedBenefits}
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-4">
                  <span>Target User Base: <strong>{item.sdlc.ideation.targetUserBase}</strong></span>
                  <span>·</span>
                  <span>Justification: <strong>{item.sdlc.ideation.businessJustification}</strong></span>
                </div>
              </div>

              {/* STAGE 2: PLANNING / MANAGER REVIEW */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-amber-500 text-white font-bold flex items-center justify-center text-xs">
                      2
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Planning & Triage Gate
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.sdlc.planning.managerApproved
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.sdlc.planning.managerApproved ? 'Manager Approved' : 'Review Pending'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Ballpark Effort</span>
                    <div className="text-base font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                      {item.sdlc.planning.effortEstimateDays} man-days
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Impact Rating</span>
                    <div className="text-base font-bold text-indigo-700 font-mono tabular-nums mt-0.5">
                      {item.sdlc.planning.impactScore} / 5 Stars
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Priority WSJF Score</span>
                    <div className="text-base font-bold text-rose-700 font-mono tabular-nums mt-0.5">
                      {item.sdlc.planning.priorityScore} pts
                    </div>
                  </div>
                </div>

                {/* Manager Action Button with RBAC Protection */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">
                    Who reviews: <strong>Manager + IT Lead</strong>
                  </span>
                  {!item.sdlc.planning.managerApproved ? (
                    permissions.canApproveGates ? (
                      <button
                        onClick={() => approveManager(item.id, true)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                      >
                        Approve Request as {currentUser.name} ({currentUser.role})
                      </button>
                    ) : (
                      <span className="text-[11px] text-amber-700 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        Requires Project Manager or Admin role to approve
                      </span>
                    )
                  ) : (
                    <div className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approved by {item.sdlc.planning.managerApprovedBy}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* STAGE 3: REQUIREMENTS (FUNCTIONAL SPECIFICATION) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-indigo-500 text-white font-bold flex items-center justify-center text-xs">
                      3
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Requirements (Functional Specification)
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      reqSigned
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {reqSigned ? 'Gate Sign-Off Complete' : 'Sign-Off Pending'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="font-semibold text-slate-800">Functional User Stories:</div>
                  {item.sdlc.requirements.userStories.map((us) => (
                    <div
                      key={us.id}
                      className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2 text-slate-700"
                    >
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{us.story}</span>
                    </div>
                  ))}
                </div>

                {/* Gate Sign-offs */}
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-indigo-900">
                      Mandatory Gate: Requester & IT Analyst Sign-Off
                    </div>
                    <div className="text-[10px] text-indigo-700">
                      Required before Development coding can begin.
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!item.sdlc.requirements.requesterSignedOff ? (
                      <button
                        onClick={() => signOffRequirements(item.id, 'requester')}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs"
                      >
                        Sign as Requester
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold bg-white px-2 py-1 rounded border border-emerald-300">
                        ✓ Requester Signed ({item.sdlc.requirements.requesterSignedOffBy})
                      </span>
                    )}

                    {!item.sdlc.requirements.analystSignedOff ? (
                      <button
                        onClick={() => signOffRequirements(item.id, 'analyst')}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs"
                      >
                        Sign as IT Analyst
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold bg-white px-2 py-1 rounded border border-emerald-300">
                        ✓ Analyst Signed ({item.sdlc.requirements.analystSignedOffBy})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* STAGE 4: DESIGN (TECHNICAL SPECIFICATION) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-purple-500 text-white font-bold flex items-center justify-center text-xs">
                      4
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Design (Technical Specification)
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      designApproved
                        ? 'bg-purple-100 text-purple-800'
                        : item.type === 'Quick Win'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {designApproved
                      ? 'Design Approved'
                      : item.type === 'Quick Win'
                      ? 'Skipped for Quick Win'
                      : 'Approval Pending'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                    <span className="font-semibold text-slate-700">Target Architecture:</span>
                    <p className="text-slate-600 font-mono text-[11px]">
                      {item.sdlc.design.architectureType ||
                        'Cloudflare Pages + Workers Serverless Edge Function'}
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                    <span className="font-semibold text-slate-700">Integrations:</span>
                    <p className="text-slate-600 font-mono text-[11px]">
                      {item.sdlc.design.sapIntegrationRequired
                        ? 'SAP ERP RFC/BAPI Connector Required'
                        : 'Standalone Cloudflare KV/D1 database'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">
                    Security Checklist: <strong>{item.sdlc.design.securityChecklistPassed ? 'Passed' : 'Under Review'}</strong>
                  </span>
                  {!designApproved && item.type !== 'Quick Win' ? (
                    permissions.canApproveGates ? (
                      <button
                        onClick={() => signOffDesign(item.id)}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs"
                      >
                        Approve Technical Design as IT Lead
                      </button>
                    ) : (
                      <span className="text-[11px] text-amber-700 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        Requires IT Lead / Admin role to approve
                      </span>
                    )
                  ) : designApproved ? (
                    <span className="text-purple-700 font-bold">
                      ✓ Approved by {item.sdlc.design.designApprovedBy}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* STAGE 5: DEVELOPMENT */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      5
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Development & Task Tracking
                    </h3>
                  </div>
                  <span className="font-mono text-blue-700 font-bold tabular-nums">
                    {item.sdlc.development.percentComplete || 0}% Complete
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Sprint: <strong>{item.sdlc.development.sprintName || 'Current Sprint'}</strong></span>
                    <span>Git Branch: <strong className="font-mono">{item.sdlc.development.repositoryBranch || 'main'}</strong></span>
                  </div>

                  {/* Progress slider */}
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={item.sdlc.development.percentComplete || 0}
                      onChange={(e) =>
                        updateRequest(item.id, {
                          sdlc: {
                            ...item.sdlc,
                            development: {
                              ...item.sdlc.development,
                              percentComplete: parseInt(e.target.value, 10),
                            },
                          },
                        })
                      }
                      className="flex-1 accent-blue-600"
                    />
                    <span className="font-mono font-bold w-12 text-right">
                      {item.sdlc.development.percentComplete || 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* STAGE 6: TESTING & QA */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                      6
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Testing (QA & User Acceptance UAT)
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      uatSigned
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {uatSigned ? 'UAT Formally Signed-Off' : 'UAT Sign-off Pending'}
                  </span>
                </div>

                {/* Test cases list */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>Test Cases Checklist:</span>
                    <span className="text-[10px] text-slate-400">
                      {item.sdlc.testing.testCases.filter((tc) => tc.status === 'Pass').length}/
                      {item.sdlc.testing.testCases.length} Passed
                    </span>
                  </div>

                  {item.sdlc.testing.testCases.map((tc) => (
                    <div
                      key={tc.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[10px] text-slate-600">
                            {tc.code}
                          </span>
                          <span className="font-semibold text-slate-800 truncate">{tc.title}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{tc.expectedResult}</div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {(['Pass', 'Fail', 'Pending', 'Retest'] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => updateTestCaseStatus(item.id, tc.id, st)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                              tc.status === st
                                ? st === 'Pass'
                                  ? 'bg-emerald-600 text-white'
                                  : st === 'Fail'
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-amber-500 text-white'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Add Test Case Form */}
                  <form onSubmit={handleAddTestCaseSubmit} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add QA test case scenario..."
                      value={newTestCaseTitle}
                      onChange={(e) => setNewTestCaseTitle(e.target.value)}
                      className="flex-1 px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-md"
                    >
                      + Add Test
                    </button>
                  </form>
                </div>

                {/* Formal UAT Sign-off CTA */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Gate Check: UAT sign-off required prior to production deployment
                  </span>
                  {!uatSigned ? (
                    permissions.canApproveGates ? (
                      <button
                        onClick={() => signOffUAT(item.id)}
                        className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs"
                      >
                        Sign Off UAT as {currentUser.name}
                      </button>
                    ) : (
                      <span className="text-[11px] text-amber-700 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        Requires Project Manager or Admin to sign off UAT
                      </span>
                    )
                  ) : (
                    <span className="text-teal-700 font-bold">
                      ✓ UAT Signed Off by {item.sdlc.testing.uatSignedOffBy}
                    </span>
                  )}
                </div>
              </div>

              {/* STAGE 8: IMPLEMENTATION (DEPLOYMENT) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
                      8
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Implementation (Deployment & Go-Live)
                    </h3>
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
                    Env: {item.sdlc.implementation.environment}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-semibold block">DB Migration</span>
                    <span className="font-bold text-emerald-700">
                      {item.sdlc.implementation.databaseMigrationDone ? '✓ Completed' : 'Pending'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-semibold block">Security Audit</span>
                    <span className="font-bold text-emerald-700">
                      {item.sdlc.implementation.securityAuditCleared ? '✓ Cleared' : 'Pending'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-semibold block">Go-Live Alert</span>
                    <span className="font-bold text-slate-800">
                      {item.sdlc.implementation.goLiveNotificationSent ? '✓ Broadcasted' : 'Scheduled'}
                    </span>
                  </div>
                </div>
              </div>

              {/* STAGE 10: POST-IMPLEMENTATION EVALUATION */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-rose-600 text-white font-bold flex items-center justify-center text-xs">
                      10
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Post-Implementation Evaluation & ROI
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= (item.sdlc.evaluation.rating || evalRating)
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSaveEvaluation} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Hours Saved / Week (Labor Savings)
                      </label>
                      <input
                        type="number"
                        value={evalHours}
                        onChange={(e) => setEvalHours(parseInt(e.target.value, 10) || 0)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Stakeholder Rating (1 to 5)
                      </label>
                      <select
                        value={evalRating}
                        onChange={(e) => setEvalRating(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      >
                        <option value={5}>5 Stars - Exceeded Expectations</option>
                        <option value={4}>4 Stars - Met Business Requirements</option>
                        <option value={3}>3 Stars - Functional with Minor Gaps</option>
                        <option value={2}>2 Stars - Substantial Rework Needed</option>
                        <option value={1}>1 Star - Failed to Resolve Problem</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Post-Launch Survey Feedback & Lessons Learned
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Did the deployed solution solve the original problem? Note key lessons learned..."
                      value={evalFeedback || evalLessons}
                      onChange={(e) => {
                        setEvalFeedback(e.target.value);
                        setEvalLessons(e.target.value);
                      }}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-xs"
                  >
                    Save Post-Launch Evaluation
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 2: UPDATES & CONVERSATION FEED */}
          {activeTab === 'updates' && (
            <div className="space-y-4">
              <form onSubmit={handleAddCommentSubmit} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-5 h-5 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span>Posting as {currentUser.name} ({currentUser.role})</span>
                </div>
                <textarea
                  required
                  rows={2}
                  placeholder="Share a project update, blocker note, or feedback with the team..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Update</span>
                  </button>
                </div>
              </form>

              <div className="space-y-3 pt-2">
                {item.comments.slice().reverse().map((comm) => (
                  <div key={comm.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={comm.authorAvatar}
                          alt={comm.authorName}
                          className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{comm.authorName}</div>
                          <div className="text-[10px] text-slate-400">{comm.authorRole}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {comm.stageTagged && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                            {comm.stageTagged}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">{comm.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-xs pl-8">
                      {comm.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PROJECT TASKS & WBS */}
          {activeTab === 'subtasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Assigned Project Tasks ({projectTasks.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tasks associated with {item.code}
                  </p>
                </div>
                <button
                  onClick={() => setIsNewTaskModalOpen(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Create Task</span>
                </button>
              </div>

              {/* Tasks List */}
              <div className="space-y-2">
                {projectTasks.length === 0 ? (
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500">
                    No tasks created specifically for this project yet.
                  </div>
                ) : (
                  projectTasks.map((tsk) => (
                    <div
                      key={tsk.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900">{tsk.title}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>Assignee: <strong>{tsk.assignedToName}</strong></span>
                          <span>·</span>
                          <span>Due: <strong>{tsk.dueDate}</strong></span>
                          <span>·</span>
                          <span>Est: <strong>{tsk.estimatedHours}h</strong></span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          tsk.status === 'Done'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tsk.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {tsk.status}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Subtasks breakdown */}
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 text-xs">Work Breakdown Subitems ({item.subtasks.length}):</div>
                {item.subtasks.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => toggleSubtask(item.id, st.id)}
                    className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-400 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {st.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className={`font-medium ${st.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {st.title}
                      </span>
                    </div>
                    <span className="font-mono text-slate-400 text-[10px] tabular-nums">
                      {st.assignedTo} · {st.dueDate}
                    </span>
                  </div>
                ))}

                <form onSubmit={handleAddSubtaskSubmit} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="+ Quick add subitem..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold text-xs"
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: STAGE GATE AUDIT LOG */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Compliance Verification Summary
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                    <span>Manager Review Approval</span>
                    <span className="font-bold font-mono text-emerald-700">
                      {item.sdlc.planning.managerApproved
                        ? `Approved by ${item.sdlc.planning.managerApprovedBy}`
                        : 'Pending'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                    <span>Functional Specification Requester Sign-off</span>
                    <span className="font-bold font-mono text-emerald-700">
                      {item.sdlc.requirements.requesterSignedOff
                        ? `Signed by ${item.sdlc.requirements.requesterSignedOffBy}`
                        : 'Pending'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                    <span>Functional Specification IT Analyst Sign-off</span>
                    <span className="font-bold font-mono text-emerald-700">
                      {item.sdlc.requirements.analystSignedOff
                        ? `Signed by ${item.sdlc.requirements.analystSignedOffBy}`
                        : 'Pending'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                    <span>Technical Architecture & Security Approval</span>
                    <span className="font-bold font-mono text-purple-700">
                      {designApproved
                        ? `Approved by ${item.sdlc.design.designApprovedBy}`
                        : item.type === 'Quick Win'
                        ? 'Exempt (Quick Win policy)'
                        : 'Pending'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                    <span>User Acceptance Testing (UAT) Sign-off</span>
                    <span className="font-bold font-mono text-teal-700">
                      {uatSigned ? `Signed by ${item.sdlc.testing.uatSignedOffBy}` : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
