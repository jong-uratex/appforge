import React, { useState } from 'react';
import { useAppForge } from '../../context/AppForgeContext';
import { Department, RequestType, UrgencyLevel } from '../../types/appforge';
import { X, Sparkles, AlertCircle, GitFork } from 'lucide-react';

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
  const [type, setType] = useState<RequestType>('Enhancement');
  const [department, setDepartment] = useState<Department>('Sales & Logistics');
  const [systemApplication, setSystemApplication] = useState('MDM Portal');
  const [moduleName, setModuleName] = useState('MDM Portal - Price Set-up (Regular) - Promo Upload');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Medium');
  const [workflowId, setWorkflowId] = useState<string>(workflows[0]?.id || 'wf-sdlc-11');
  const [currentSituation, setCurrentSituation] = useState('');
  const [requestedChange, setRequestedChange] = useState('');
  const [businessJustification, setBusinessJustification] = useState('For budget charging purposes.');
  const [targetGoLiveDate, setTargetGoLiveDate] = useState('2026-11-20');
  const [tagInput, setTagInput] = useState('');

  if (!isNewRequestModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !currentSituation.trim()) return;

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const created = createRequest({
      title: title.trim(),
      type,
      department,
      urgency,
      problemDescription: currentSituation.trim(),
      businessJustification: businessJustification.trim() || 'For budget charging and operational governance',
      expectedBenefits: requestedChange.trim() || 'Enhanced data integrity and system feature updates',
      targetUserBase: `${department} operational staff and MIS coordinators`,
      tags: tags.length > 0 ? tags : [systemApplication, type],
      targetGoLiveDate,
      workflowId,
    });

    setIsNewRequestModalOpen(false);
    setSelectedRequest(created);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header (Matches PDF: SYSTEM CHANGE REQUEST FORM) */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden p-0.5 shadow-2xs">
              <img
                src="/assets/aistudio/app-forge-logo_d7a261fb.png"
                alt="MIS AppForge Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
                Create Project Initiative
              </h3>
              <p className="text-[11px] text-slate-500">
                MIS AppForge · Requester: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.role})
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          
          {/* Header Metadata Grid: System/App, Module, Dept, Priority */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              System Document Metadata
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  System / Application <span className="text-rose-500">*</span>
                </label>
                <select
                  value={systemApplication}
                  onChange={(e) => setSystemApplication(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs font-semibold"
                >
                  <option value="MDM Portal">MDM Portal (Master Data Management)</option>
                  <option value="SAP ERP">SAP ERP (Enterprise Resource Planning)</option>
                  <option value="CPQ">CPQ (Configure, Price, Quote)</option>
                  <option value="Pricing Engine">Pricing Engine & Promo Upload</option>
                  <option value="Customer Portal">Customer Order Portal</option>
                  <option value="Foam Plant Scanner PWA">Foam Plant Scanner PWA</option>
                  <option value="WMS Barcode System">WMS Barcode & RFID System</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Module / Sub-system <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Price Set-up (Regular) - Promo Upload"
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Requesting Department <span className="text-rose-500">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Priority <span className="text-rose-500">*</span>
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs font-semibold"
                >
                  <option value="Critical">Critical - Production line or revenue stoppage</option>
                  <option value="High">High - Bottleneck affecting plant operations</option>
                  <option value="Medium">Medium - Regular business planning cycle</option>
                  <option value="Low">Low - Minor enhancement or backlog</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 1: Change Request Information */}
          <div className="space-y-3 pt-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <span>1. Change Request Information</span>
            </div>

            {/* Title */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Change Request Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MDM Portal - Price Set-up - Customer Channel Enhancement"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-xs"
              />
            </div>

            {/* Type of Change */}
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">
                Type of Change <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  'Enhancement',
                  'New Functionality',
                  'Process Change',
                  'Data/Configuration Change',
                  'Bug/Error Correction',
                  'Integration Change',
                  'Report/Dashboard Change',
                  'Security/Access Change',
                ].map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setType(t as RequestType)}
                    className={`p-2 rounded border text-left transition-all ${
                      type === t
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-[11px] truncate">{t}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Situation / Existing Process */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Current Situation / Existing Process <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="Bullet points or summary of the current system behavior, missing dropdown values, or manual pain points..."
                value={currentSituation}
                onChange={(e) => setCurrentSituation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs resize-none"
              />
            </div>

            {/* Requested Change */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Requested Change (System Enhancement Specification) <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="The system shall be enhanced to: (e.g. Add 'Linen' and 'RGC' to dropdown, update label, set field as mandatory)..."
                value={requestedChange}
                onChange={(e) => setRequestedChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs resize-none"
              />
            </div>
          </div>

          {/* Section 2: Business Reason / Justification */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 pb-1 border-b border-slate-200 mb-2">
              <span>2. Business Reason / Justification</span>
            </div>
            <textarea
              rows={2}
              placeholder="The change is requested to: (e.g. For budget charging purposes, departmental accounting)..."
              value={businessJustification}
              onChange={(e) => setBusinessJustification(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs resize-none"
            />
          </div>

          {/* Workflow & Go Live Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Associated Workflow Pipeline
              </label>
              <select
                value={workflowId}
                onChange={(e) => setWorkflowId(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs font-medium"
              >
                {workflows.map((wf) => (
                  <option key={wf.id} value={wf.id}>
                    {wf.name} ({wf.stages.length} stages)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Target Go-Live Date
              </label>
              <input
                type="date"
                value={targetGoLiveDate}
                onChange={(e) => setTargetGoLiveDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs"
              />
            </div>
          </div>

          {/* Footer CTAs */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsNewRequestModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>Create Project Initiative</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
