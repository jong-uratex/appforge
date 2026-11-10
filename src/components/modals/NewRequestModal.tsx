import React, { useState } from 'react';
import { useAppForge } from '../../context/AppForgeContext';
import { Department, RequestType, UrgencyLevel } from '../../types/appforge';
import { X, Sparkles, AlertCircle, Layers, GitFork } from 'lucide-react';

const DEPARTMENTS: Department[] = [
  'Foam Plant & Production',
  'Sales & Logistics',
  'Supply Chain & Procurement',
  'Automotive & Plastics Division',
  'Human Resources & Admin',
  'Finance & Accounting',
  'Quality Assurance & R&D',
  'Management Information Systems (MIS)',
];

export const NewRequestModal: React.FC = () => {
  const {
    isNewRequestModalOpen,
    setIsNewRequestModalOpen,
    createRequest,
    setSelectedRequest,
    workflows,
    permissions,
    currentUser,
  } = useAppForge();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<RequestType>('New Application');
  const [department, setDepartment] = useState<Department>('Foam Plant & Production');
  const [urgency, setUrgency] = useState<UrgencyLevel>('High');
  const [workflowId, setWorkflowId] = useState<string>(workflows[0]?.id || 'wf-sdlc-11');
  const [problemDescription, setProblemDescription] = useState('');
  const [businessJustification, setBusinessJustification] = useState('');
  const [expectedBenefits, setExpectedBenefits] = useState('');
  const [targetUserBase, setTargetUserBase] = useState('');
  const [targetGoLiveDate, setTargetGoLiveDate] = useState('2027-02-28');
  const [tagInput, setTagInput] = useState('');

  if (!isNewRequestModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !problemDescription.trim()) return;

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const created = createRequest({
      title: title.trim(),
      type,
      department,
      urgency,
      problemDescription: problemDescription.trim(),
      businessJustification: businessJustification.trim() || 'Internal process efficiency upgrade',
      expectedBenefits: expectedBenefits.trim() || 'Labor hour savings and error prevention',
      targetUserBase: targetUserBase.trim() || `${department} operational staff`,
      tags: tags.length > 0 ? tags : [department.split(' ')[0], type],
      targetGoLiveDate,
      workflowId,
    });

    setIsNewRequestModalOpen(false);
    setSelectedRequest(created);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                SDLC Stage 1: Conception & Ideation Intake
              </h3>
              <p className="text-[11px] text-slate-500">
                Submitting as: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.role})
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsNewRequestModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Request Type Selector */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              Request Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['New Application', 'Enhancement', 'Quick Win'] as RequestType[]).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => {
                    setType(t);
                    if (t === 'Quick Win') {
                      const qw = workflows.find((w) => w.id === 'wf-quick-3');
                      if (qw) setWorkflowId(qw.id);
                    } else if (t === 'Enhancement') {
                      const agile = workflows.find((w) => w.id === 'wf-agile-4');
                      if (agile) setWorkflowId(agile.id);
                    } else {
                      setWorkflowId(workflows[0].id);
                    }
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    type === t
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-500 font-semibold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-xs">{t}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {t === 'New Application' && 'Full 11-Stage SDLC'}
                    {t === 'Enhancement' && 'Agile / Lighter flow'}
                    {t === 'Quick Win' && 'Fast-track Hotfix'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Workflow Selector */}
          <div>
            <label className="block font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <GitFork className="w-3.5 h-3.5 text-indigo-600" />
                Associated Workflow & Status Pipeline
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Configured by MIS Administrator
              </span>
            </label>
            <select
              value={workflowId}
              onChange={(e) => setWorkflowId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-xs"
            >
              {workflows.map((wf) => (
                <option key={wf.id} value={wf.id}>
                  {wf.name} ({wf.stages.length} stages: {wf.stages.map((s) => s.name).slice(0, 3).join(' → ')}...)
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Initiative / Application Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Polyurethane Foam Block Inspection Logger"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-xs"
            />
          </div>

          {/* Department & Urgency Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Uratex Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-xs"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Urgency Level <span className="text-rose-500">*</span>
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-xs"
              >
                <option value="Low">Low - Nice to have / backlog</option>
                <option value="Medium">Medium - Regular planning cycle</option>
                <option value="High">High - Bottleneck affecting operations</option>
                <option value="Critical">Critical - Production line or revenue impact</option>
              </select>
            </div>
          </div>

          {/* Problem Statement */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Problem Description & Pain Points <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="Describe the current manual process or limitation being experienced by employees..."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs resize-none"
            />
          </div>

          {/* Business Justification & Expected Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Business Justification
              </label>
              <textarea
                rows={2}
                placeholder="Why is this system necessary? (e.g. ISO compliance, client requirement)"
                value={businessJustification}
                onChange={(e) => setBusinessJustification(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs resize-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Expected Business Benefit
              </label>
              <textarea
                rows={2}
                placeholder="Quantifiable outcome (e.g. saves 15 hours/wk, eliminates shipping defects)"
                value={expectedBenefits}
                onChange={(e) => setExpectedBenefits(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs resize-none"
              />
            </div>
          </div>

          {/* Target User Base & Target Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Target User Base & Roles
              </label>
              <input
                type="text"
                placeholder="e.g. 35 Warehouse forklift operators and dispatch leads"
                value={targetUserBase}
                onChange={(e) => setTargetUserBase(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Target Go-Live Date
              </label>
              <input
                type="date"
                value={targetGoLiveDate}
                onChange={(e) => setTargetGoLiveDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-xs"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Keywords / Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Foam-Plant, Mobile, Barcode, Logistics"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
            />
          </div>

          {/* Footer CTAs */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsNewRequestModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm active:scale-95 transition-all"
            >
              Submit to MIS AppForge
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
