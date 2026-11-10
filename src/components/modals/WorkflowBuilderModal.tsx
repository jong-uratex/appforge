import React, { useState } from 'react';
import { useAppForge } from '../../context/AppForgeContext';
import { ProjectWorkflow, RequestType, WorkflowStage } from '../../types/appforge';
import {
  X,
  Plus,
  GitFork,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  ShieldCheck,
  Layers,
  Sparkles,
  Link,
  Lock,
} from 'lucide-react';

const COLOR_OPTIONS = [
  { name: 'Sky Blue', badge: 'bg-sky-500 text-white' },
  { name: 'Amber Gold', badge: 'bg-amber-500 text-white' },
  { name: 'Indigo Purple', badge: 'bg-indigo-500 text-white' },
  { name: 'Royal Purple', badge: 'bg-purple-500 text-white' },
  { name: 'Blue Primary', badge: 'bg-blue-600 text-white' },
  { name: 'Teal Mint', badge: 'bg-teal-600 text-white' },
  { name: 'Emerald Green', badge: 'bg-emerald-600 text-white' },
  { name: 'Cyan Sea', badge: 'bg-cyan-600 text-white' },
  { name: 'Rose Red', badge: 'bg-rose-600 text-white' },
  { name: 'Slate Gray', badge: 'bg-slate-700 text-white' },
];

export const WorkflowBuilderModal: React.FC = () => {
  const {
    isWorkflowModalOpen,
    setIsWorkflowModalOpen,
    workflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    addStageToWorkflow,
    deleteStageFromWorkflow,
    assignWorkflowToProject,
    requests,
    permissions,
    currentUser,
  } = useAppForge();

  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(workflows[0]?.id || 'wf-sdlc-11');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New workflow draft
  const [newWfName, setNewWfName] = useState('');
  const [newWfDesc, setNewWfDesc] = useState('');
  const [newWfTypes, setNewWfTypes] = useState<RequestType[]>(['Enhancement']);

  // New stage draft
  const [newStageName, setNewStageName] = useState('');
  const [newStageDesc, setNewStageDesc] = useState('');
  const [newStageColor, setNewStageColor] = useState(COLOR_OPTIONS[4].badge);
  const [newStageIsGate, setNewStageIsGate] = useState(false);

  // Associate project draft
  const [selectedProjectToAssign, setSelectedProjectToAssign] = useState<string>(requests[0]?.id || '');
  const [assignSuccessToast, setAssignSuccessToast] = useState<string | null>(null);

  if (!isWorkflowModalOpen) return null;

  const currentWf = workflows.find((w) => w.id === selectedWorkflowId) || workflows[0];
  const associatedProjects = requests.filter((r) => r.workflowId === currentWf?.id);

  const handleCreateNewWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWfName.trim()) return;

    // Create workflow with the 4 core agile stages as initial template
    const created = createWorkflow({
      name: newWfName.trim(),
      description: newWfDesc.trim() || 'Custom departmental workflow',
      applicableTypes: newWfTypes,
      stages: [
        { name: 'Planning', description: 'Sprint scoping & backlog estimation', badgeColor: 'bg-amber-500 text-white', isGate: true },
        { name: 'Development', description: 'Active engineering & implementation', badgeColor: 'bg-blue-600 text-white', isGate: false },
        { name: 'Testing', description: 'QA verification and regression tests', badgeColor: 'bg-teal-600 text-white', isGate: true },
        { name: 'Deployment', description: 'Rollout to production edge', badgeColor: 'bg-emerald-600 text-white', isGate: false },
      ],
    });

    setIsCreatingNew(false);
    setSelectedWorkflowId(created.id);
    setNewWfName('');
    setNewWfDesc('');
  };

  const handleAddStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageName.trim() || !currentWf) return;

    addStageToWorkflow(currentWf.id, {
      name: newStageName.trim(),
      description: newStageDesc.trim() || `${newStageName} phase`,
      badgeColor: newStageColor,
      isGate: newStageIsGate,
    });

    setNewStageName('');
    setNewStageDesc('');
    setNewStageIsGate(false);
  };

  const handleAssignProject = () => {
    if (!selectedProjectToAssign || !currentWf) return;
    assignWorkflowToProject(selectedProjectToAssign, currentWf.id);
    const proj = requests.find((r) => r.id === selectedProjectToAssign);
    setAssignSuccessToast(`Successfully assigned "${currentWf.name}" to ${proj?.code}!`);
    setTimeout(() => setAssignSuccessToast(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <GitFork className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Custom Project Workflow & Status Builder
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  Admin Feature
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Define customized stages (e.g. Planning, Dev, Test, Deploy) and associate them with specific Uratex projects
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsWorkflowModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Non-admin check notice */}
        {!permissions.canEditWorkflows && (
          <div className="p-3 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Read-Only Mode:</strong> You are logged in as {currentUser.name} ({currentUser.role}). Only <strong>Admin</strong> users can save new custom workflows.
            </span>
          </div>
        )}

        {/* Main Body Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left Column: Workflow Selector */}
          <div className="md:col-span-4 border-r border-slate-200 bg-slate-50/50 p-4 space-y-3 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Workflows ({workflows.length})
              </span>
              {permissions.canEditWorkflows && (
                <button
                  onClick={() => setIsCreatingNew(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {workflows.map((wf) => {
                const count = requests.filter((r) => r.workflowId === wf.id).length;
                const isSelected = wf.id === selectedWorkflowId && !isCreatingNew;

                return (
                  <button
                    key={wf.id}
                    onClick={() => {
                      setSelectedWorkflowId(wf.id);
                      setIsCreatingNew(false);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-white shadow-xs text-indigo-950 font-medium ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-white/70 hover:bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs truncate">{wf.name}</span>
                      {wf.isDefault && (
                        <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>{wf.stages.length} custom stages</span>
                      <span className="font-mono tabular-nums">{count} projects</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Workflow Editor & Association */}
          <div className="md:col-span-8 p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
            
            {/* Create New Workflow Form */}
            {isCreatingNew ? (
              <form onSubmit={handleCreateNewWorkflow} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-slate-900 text-sm">Create New Workflow</h4>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Workflow Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Agile 4-Stage Scrum, Logistics Fleet Cycle, Quick Win Hotfix"
                    value={newWfName}
                    onChange={(e) => setNewWfName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe the target project types and lifecycle methodology..."
                    value={newWfDesc}
                    onChange={(e) => setNewWfDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg text-[11px] text-indigo-900">
                  New workflows will be initialized with the standard 4-stage pipeline (<strong>Planning → Development → Testing → Deployment</strong>). You can immediately add, reorder, or customize the stages below once created.
                </div>

                <button
                  type="submit"
                  disabled={!permissions.canEditWorkflows}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Create & Open Workflow
                </button>
              </form>
            ) : currentWf ? (
              <div className="space-y-6">
                
                {/* Workflow Header Details */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{currentWf.name}</h4>
                      <p className="text-slate-500 text-[11px] mt-0.5">{currentWf.description}</p>
                    </div>
                    {workflows.length > 1 && !currentWf.isDefault && permissions.canEditWorkflows && (
                      <button
                        onClick={() => deleteWorkflow(currentWf.id)}
                        className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Stages List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      Configured Stages & Statuses ({currentWf.stages.length})
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Sequential progression from Stage 1 to {currentWf.stages.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {currentWf.stages.map((stg) => (
                      <div
                        key={stg.id}
                        className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:border-indigo-300 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-mono font-bold flex items-center justify-center text-xs shrink-0">
                            {stg.order}
                          </span>
                          <span className={`px-2.5 py-1 rounded text-xs font-bold ${stg.badgeColor} shrink-0`}>
                            {stg.name}
                          </span>
                          <span className="text-slate-500 text-[11px] truncate">
                            {stg.description}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {stg.isGate && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                              Gate Sign-Off Required
                            </span>
                          )}
                          {permissions.canEditWorkflows && currentWf.stages.length > 2 && (
                            <button
                              onClick={() => deleteStageFromWorkflow(currentWf.id, stg.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded"
                              title="Delete stage"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Stage Form (Admin Only) */}
                  {permissions.canEditWorkflows && (
                    <form onSubmit={handleAddStage} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="font-bold text-slate-800 text-xs">
                        + Add Custom Stage / Status to this Workflow
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                            Stage / Status Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Code Review, Client Demo, Silo Unloading"
                            value={newStageName}
                            onChange={(e) => setNewStageName(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                            Status Color
                          </label>
                          <select
                            value={newStageColor}
                            onChange={(e) => setNewStageColor(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            {COLOR_OPTIONS.map((c) => (
                              <option key={c.badge} value={c.badge}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700 select-none">
                          <input
                            type="checkbox"
                            checked={newStageIsGate}
                            onChange={(e) => setNewStageIsGate(e.target.checked)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>Mandatory Stage Gate (Enforces sign-off before progression)</span>
                        </label>

                        <button
                          type="submit"
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold text-xs shadow-xs"
                        >
                          Add Stage
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Associate Workflow to Specific Projects */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Link className="w-4 h-4 text-indigo-600" />
                      Associate this Workflow with Specific Projects
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                      {associatedProjects.length} active initiatives bound
                    </span>
                  </div>

                  {assignSuccessToast && (
                    <div className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium">
                      {assignSuccessToast}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedProjectToAssign}
                      onChange={(e) => setSelectedProjectToAssign(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {requests.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.code} - {r.title} ({r.workflowId === currentWf.id ? 'Already Bound' : 'Switch to this workflow'})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleAssignProject}
                      disabled={!permissions.canEditWorkflows}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs transition-colors shrink-0 disabled:opacity-50"
                    >
                      Bind Workflow
                    </button>
                  </div>
                </div>

              </div>
            ) : null}

          </div>

        </div>

      </div>
    </div>
  );
};
