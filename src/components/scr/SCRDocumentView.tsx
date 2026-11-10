import React, { useState } from 'react';
import { useAppForge } from '../../context/AppForgeContext';
import {
  FileText,
  Printer,
  Edit3,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Download,
  Share2,
  Clock,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import {
  SCRFormData,
  SCRChangeType,
  SCRPriority,
  SCRTestType,
  SCRUATResult,
  SCRImplementationResult,
  AppRequest,
} from '../../types/appforge';

const ALL_CHANGE_TYPES: SCRChangeType[] = [
  'New Functionality',
  'Enhancement',
  'Process Change',
  'Data/Configuration Change',
  'Bug/Error Correction',
  'Integration Change',
  'Report/Dashboard Change',
  'Security/Access Change',
];

const ALL_TEST_TYPES: SCRTestType[] = [
  'Unit Testing',
  'System Integration Testing',
  'Regression Testing',
  'User Acceptance Testing',
  'Performance Testing',
  'Security Testing',
];

export const SCRDocumentView: React.FC = () => {
  const {
    requests,
    selectedRequest,
    setSelectedRequest,
    currentUser,
    permissions,
    updateSCRFormData,
    signApprover,
    addSCRBusinessRequirement,
    setIsNewRequestModalOpen,
  } = useAppForge();

  // Active SCR request (default to first request, e.g. SCR-2026-003)
  const activeReq = selectedRequest || requests[0];
  const scr = activeReq?.scr;

  const [isEditMode, setIsEditMode] = useState(false);
  const [newBRDescription, setNewBRDescription] = useState('');
  const [newSituationText, setNewSituationText] = useState('');
  const [newRequestedText, setNewRequestedText] = useState('');
  const [newRiskText, setNewRiskText] = useState({ area: '', risk: '', consideration: '' });

  if (!activeReq || !scr) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">No System Change Request Selected</h3>
        <p className="text-xs text-slate-500 mt-1">
          Select or create an SCR to view the official Uratex form document.
        </p>
      </div>
    );
  }

  // Handle updates
  const handleUpdate = (updates: Partial<SCRFormData>) => {
    updateSCRFormData(activeReq.id, updates);
  };

  const handlePrint = () => {
    window.print();
  };

  // Toggle Change Type checkbox
  const toggleChangeType = (type: SCRChangeType) => {
    const current = scr.typesOfChange || [];
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    handleUpdate({ typesOfChange: next });
  };

  // Toggle Test Type checkbox
  const toggleTestType = (type: SCRTestType) => {
    const current = scr.testTypes || [];
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    handleUpdate({ testTypes: next });
  };

  // Toggle System Affected
  const toggleSystemAffected = (key: keyof SCRFormData['systemsAffected']) => {
    if (key === 'other') return;
    handleUpdate({
      systemsAffected: {
        ...scr.systemsAffected,
        [key]: !scr.systemsAffected[key],
      },
    });
  };

  // Toggle Business Area Affected
  const toggleBusinessAreaAffected = (key: keyof SCRFormData['businessAreasAffected']) => {
    if (key === 'other') return;
    handleUpdate({
      businessAreasAffected: {
        ...scr.businessAreasAffected,
        [key]: !scr.businessAreasAffected[key],
      },
    });
  };

  // Add business requirement
  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBRDescription.trim()) return;
    const nextNumber = (scr.businessRequirements?.length || 0) + 1;
    const nextCode = `BR-${String(nextNumber).padStart(2, '0')}`;
    addSCRBusinessRequirement(activeReq.id, {
      no: nextCode,
      description: newBRDescription.trim(),
    });
    setNewBRDescription('');
  };

  // Sign as current user
  const handleSignAsMe = (approverId: string) => {
    signApprover(activeReq.id, approverId, currentUser.name);
  };

  return (
    <div className="bg-slate-100 min-h-screen py-6 px-3 sm:px-6 print:p-0 print:bg-white">
      {/* Top Controls Toolbar (Hidden during print) */}
      <div className="max-w-4xl mx-auto mb-5 print:hidden">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Document Selector */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {scr.documentNo}
                </span>
                <h2 className="text-sm font-bold text-slate-900 truncate max-w-[280px] sm:max-w-md">
                  {scr.changeRequestTitle || activeReq.title}
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Official Uratex System Change Request Document · {scr.department}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Select another SCR */}
            <div className="relative">
              <select
                value={activeReq.id}
                onChange={(e) => {
                  const found = requests.find((r) => r.id === e.target.value);
                  if (found) setSelectedRequest(found);
                }}
                className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                {requests.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.scr?.documentNo || r.code}: {r.title.slice(0, 32)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Edit / View Toggle */}
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                isEditMode
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditMode ? 'Finish Editing' : 'Edit Document'}</span>
            </button>

            {/* Print / Export to PDF */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors shadow-xs"
              title="Print official document or save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>
          </div>
        </div>

        {/* Status & Compliance Quick Bar */}
        <div className="mt-2.5 px-3 py-2 bg-blue-50/70 border border-blue-200/80 rounded-lg flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-semibold">Format Compliance:</span>
            <span>Uratex Multiflex RNC Philippines System Change Request (SCR) Standard</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-blue-800">
            <span>SDLC Stage: {activeReq.status}</span>
            <span>·</span>
            <span>UAT: {scr.uatResult}</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* OFFICIAL URATEX SYSTEM CHANGE REQUEST FORM (Matches PDF Layout) */}
      {/* ============================================================ */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-900 shadow-xl p-6 sm:p-10 font-sans text-slate-900 print:shadow-none print:border-none print:p-0 print:max-w-full">
        
        {/* DOCUMENT TITLE HEADER */}
        <div className="bg-[#e2e8f0] border border-slate-900 py-2.5 px-4 text-center mb-6">
          <h1 className="text-lg sm:text-xl font-bold tracking-wider text-slate-900 uppercase">
            SYSTEM CHANGE REQUEST FORM
          </h1>
        </div>

        {/* METADATA GRID TABLE (PDF Page 1 Header) */}
        <div className="border border-slate-900 mb-6 text-xs sm:text-sm">
          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-12 border-b border-slate-900">
            <div className="sm:col-span-3 p-2 bg-slate-100 font-bold border-r border-slate-900">
              Document No.:
            </div>
            <div className="sm:col-span-3 p-2 font-mono font-bold border-r border-slate-900">
              {scr.documentNo}
            </div>
            <div className="sm:col-span-3 p-2 bg-slate-100 font-bold border-r border-slate-900">
              Request Date:
            </div>
            <div className="sm:col-span-3 p-2">
              {scr.requestDate}
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-12 border-b border-slate-900">
            <div className="sm:col-span-3 p-2 bg-slate-100 font-bold border-r border-slate-900">
              Requested By:
            </div>
            <div className="sm:col-span-3 p-2 border-r border-slate-900 font-medium">
              {scr.requestedBy}
            </div>
            <div className="sm:col-span-3 p-2 bg-slate-100 font-bold border-r border-slate-900">
              Department:
            </div>
            <div className="sm:col-span-3 p-2 font-medium">
              {scr.department}
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-12 border-b border-slate-900">
            <div className="sm:col-span-3 p-2 bg-slate-100 font-bold border-r border-slate-900">
              System/Application:
            </div>
            <div className="sm:col-span-3 p-2 border-r border-slate-900 font-semibold text-blue-900">
              {scr.systemApplication}
            </div>
            <div className="sm:col-span-3 p-2 bg-slate-100 font-bold border-r border-slate-900">
              Module:
            </div>
            <div className="sm:col-span-3 p-2 text-xs leading-snug whitespace-pre-line font-medium">
              {scr.module}
            </div>
          </div>

          {/* Row 4: Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-12">
            <div className="sm:col-span-3 p-2 bg-slate-100 font-bold border-r border-slate-900">
              Priority:
            </div>
            <div className="sm:col-span-9 p-2 flex items-center gap-4 sm:gap-6 flex-wrap">
              {(['Critical', 'High', 'Medium', 'Low'] as SCRPriority[]).map((p) => {
                const isChecked = scr.priority === p;
                return (
                  <label
                    key={p}
                    onClick={() => isEditMode && handleUpdate({ priority: p })}
                    className={`inline-flex items-center gap-1.5 cursor-pointer font-medium ${
                      isEditMode ? 'hover:text-blue-700' : ''
                    }`}
                  >
                    <span className="font-mono text-sm">
                      {isChecked ? '[x]' : '[ ]'}
                    </span>
                    <span>{p}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 1: CHANGE REQUEST INFORMATION */}
        <div className="mb-6">
          <div className="bg-[#e2e8f0] border border-slate-900 py-1 px-3 mb-3">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
              1. CHANGE REQUEST INFORMATION
            </h2>
          </div>

          <div className="space-y-4 px-1 text-xs sm:text-sm">
            {/* Title */}
            <div>
              <span className="font-bold">Change Request Title: </span>
              {isEditMode ? (
                <input
                  type="text"
                  value={scr.changeRequestTitle}
                  onChange={(e) => handleUpdate({ changeRequestTitle: e.target.value })}
                  className="w-full mt-1 p-1.5 border border-slate-300 rounded font-semibold text-slate-900"
                />
              ) : (
                <span className="font-semibold text-slate-800">{scr.changeRequestTitle}</span>
              )}
            </div>

            {/* Type of Change (8 Checkboxes) */}
            <div>
              <div className="font-bold mb-1.5">Type of Change:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-6 text-xs sm:text-sm">
                {ALL_CHANGE_TYPES.map((t) => {
                  const isChecked = (scr.typesOfChange || []).includes(t);
                  return (
                    <label
                      key={t}
                      onClick={() => isEditMode && toggleChangeType(t)}
                      className={`inline-flex items-center gap-2 ${
                        isEditMode ? 'cursor-pointer hover:text-blue-700' : 'cursor-default'
                      }`}
                    >
                      <span className="font-mono text-sm">{isChecked ? '[x]' : '[ ]'}</span>
                      <span className={isChecked ? 'font-semibold text-slate-900' : 'text-slate-700'}>
                        {t}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Current Situation / Existing Process */}
            <div>
              <div className="font-bold mb-1">Current Situation / Existing Process</div>
              <ul className="list-disc pl-5 space-y-1 text-slate-800">
                {(scr.currentSituation || []).map((bullet, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            {/* Requested Change */}
            <div>
              <div className="font-bold mb-1">Requested Change</div>
              <p className="text-slate-700 mb-1">The system shall be enhanced to:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-800">
                {(scr.requestedChange || []).map((bullet, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* SECTION 2: BUSINESS REASON / JUSTIFICATION */}
        <div className="mb-6">
          <div className="bg-[#e2e8f0] border border-slate-900 py-1 px-3 mb-3">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
              2. BUSINESS REASON / JUSTIFICATION
            </h2>
          </div>

          <div className="px-1 text-xs sm:text-sm space-y-1">
            <p className="text-slate-700 mb-1">The change is requested to:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-800">
              {(scr.businessReasons || []).map((reason, idx) => (
                <li key={idx} className="leading-relaxed">
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* SECTION 3: BUSINESS REQUIREMENTS */}
        <div className="mb-6">
          <div className="bg-[#e2e8f0] border border-slate-900 py-1 px-3 mb-3 flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
              3. BUSINESS REQUIREMENTS
            </h2>
            {isEditMode && (
              <span className="text-[10px] text-slate-500 font-normal">Add rows below</span>
            )}
          </div>

          {/* Table */}
          <table className="w-full border-collapse border border-slate-900 text-xs sm:text-sm">
            <thead>
              <tr className="bg-sky-50/50 border-b border-slate-900 text-slate-900">
                <th className="border-r border-slate-900 py-2 px-3 text-center w-20 font-bold">
                  No.
                </th>
                <th className="py-2 px-3 text-left font-bold">
                  Requirement Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {(scr.businessRequirements || []).map((req) => (
                <tr key={req.id}>
                  <td className="border-r border-slate-900 py-2 px-3 text-center font-bold text-slate-800 font-mono">
                    {req.no}
                  </td>
                  <td className="py-2 px-3 text-slate-800 leading-relaxed">
                    {req.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add BR form in edit mode */}
          {isEditMode && (
            <form onSubmit={handleAddRequirement} className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Enter new business requirement description..."
                value={newBRDescription}
                onChange={(e) => setNewBRDescription(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add BR</span>
              </button>
            </form>
          )}
        </div>

        {/* SECTION 4: IMPACT ASSESSMENT */}
        <div className="mb-6">
          <div className="bg-[#e2e8f0] border border-slate-900 py-1 px-3 mb-3">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
              4. IMPACT ASSESSMENT
            </h2>
          </div>

          <div className="px-1 text-xs sm:text-sm space-y-3">
            {/* Systems Affected */}
            <div>
              <div className="font-bold mb-1">Systems Affected:</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <label
                  onClick={() => isEditMode && toggleSystemAffected('cpq')}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="font-mono">{scr.systemsAffected?.cpq ? '[x]' : '[ ]'}</span>
                  <span>CPQ</span>
                </label>
                <label
                  onClick={() => isEditMode && toggleSystemAffected('mdm')}
                  className="flex items-center gap-2 cursor-pointer font-bold"
                >
                  <span className="font-mono">{scr.systemsAffected?.mdm ? '[x]' : '[ ]'}</span>
                  <span>MDM</span>
                </label>
                <label
                  onClick={() => isEditMode && toggleSystemAffected('sap')}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="font-mono">{scr.systemsAffected?.sap ? '[x]' : '[ ]'}</span>
                  <span>SAP</span>
                </label>
                <label
                  onClick={() => isEditMode && toggleSystemAffected('customerPortal')}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="font-mono">{scr.systemsAffected?.customerPortal ? '[x]' : '[ ]'}</span>
                  <span>Customer Portal</span>
                </label>
                <label
                  onClick={() => isEditMode && toggleSystemAffected('pricingEngine')}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="font-mono">{scr.systemsAffected?.pricingEngine ? '[x]' : '[ ]'}</span>
                  <span>Pricing Engine</span>
                </label>
                <label
                  onClick={() => isEditMode && toggleSystemAffected('reportingDashboard')}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="font-mono">{scr.systemsAffected?.reportingDashboard ? '[x]' : '[ ]'}</span>
                  <span>Reporting/Dashboard</span>
                </label>
              </div>
            </div>

            {/* Business Areas Affected */}
            <div>
              <div className="font-bold mb-1">Business Areas Affected:</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <label
                  onClick={() => isEditMode && toggleBusinessAreaAffected('sales')}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="font-mono">{scr.businessAreasAffected?.sales ? '[x]' : '[ ]'}</span>
                  <span>Sales</span>
                </label>
                <label
                  onClick={() => isEditMode && toggleBusinessAreaAffected('finance')}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="font-mono">{scr.businessAreasAffected?.finance ? '[x]' : '[ ]'}</span>
                  <span>Finance</span>
                </label>
                <label
                  onClick={() => isEditMode && toggleBusinessAreaAffected('mdm')}
                  className="flex items-center gap-2 cursor-pointer font-bold"
                >
                  <span className="font-mono">{scr.businessAreasAffected?.mdm ? '[x]' : '[ ]'}</span>
                  <span>MDM</span>
                </label>
                <label
                  onClick={() => isEditMode && toggleBusinessAreaAffected('manufacturing')}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="font-mono">{scr.businessAreasAffected?.manufacturing ? '[x]' : '[ ]'}</span>
                  <span>Manufacturing</span>
                </label>
                <label
                  onClick={() => isEditMode && toggleBusinessAreaAffected('purchasing')}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="font-mono">{scr.businessAreasAffected?.purchasing ? '[x]' : '[ ]'}</span>
                  <span>Purchasing</span>
                </label>
                <label
                  onClick={() => isEditMode && toggleBusinessAreaAffected('it')}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="font-mono">{scr.businessAreasAffected?.it ? '[x]' : '[ ]'}</span>
                  <span>IT</span>
                </label>
              </div>
            </div>

            {/* Data & Integration Affected */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <span className="font-bold">Data Affected: </span>
                <span className="font-medium text-slate-800">{scr.dataAffected || 'None'}</span>
              </div>
              <div>
                <span className="font-bold">Integration Affected: </span>
                <span className="font-medium text-slate-800">{scr.integrationAffected || 'None'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: RISK AND IMPACT */}
        <div className="mb-6">
          <div className="bg-[#e2e8f0] border border-slate-900 py-1 px-3 mb-3">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
              5. RISK AND IMPACT
            </h2>
          </div>

          <table className="w-full border-collapse border border-slate-900 text-xs sm:text-sm">
            <thead>
              <tr className="bg-sky-50/50 border-b border-slate-900 text-slate-900 font-bold">
                <th className="border-r border-slate-900 py-2 px-3 text-left w-1/3">
                  Area Impact
                </th>
                <th className="border-r border-slate-900 py-2 px-3 text-left w-1/3">
                  Risk
                </th>
                <th className="py-2 px-3 text-left w-1/3">
                  Consideration
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {(scr.risksAndImpacts || []).length > 0 ? (
                scr.risksAndImpacts.map((ri) => (
                  <tr key={ri.id}>
                    <td className="border-r border-slate-900 py-2 px-3 text-slate-800">
                      {ri.areaImpact}
                    </td>
                    <td className="border-r border-slate-900 py-2 px-3 text-slate-800">
                      {ri.risk}
                    </td>
                    <td className="py-2 px-3 text-slate-800">
                      {ri.consideration}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-slate-400 italic">
                    Low operational risk. Standard database schema update within MDM container.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* SECTION 6: ACCEPTANCE CRITERIA */}
        <div className="mb-6">
          <div className="bg-[#e2e8f0] border border-slate-900 py-1 px-3 mb-3">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
              6. ACCEPTANCE CRITERIA
            </h2>
          </div>

          <div className="px-1 text-xs sm:text-sm space-y-1">
            <p className="text-slate-700 mb-1">The change shall be considered completed when:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-800">
              {(scr.acceptanceCriteria || []).map((crit, idx) => (
                <li key={idx} className="leading-relaxed">
                  {crit}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* SECTION 7: TESTING REQUIREMENT */}
        <div className="mb-6">
          <div className="bg-[#e2e8f0] border border-slate-900 py-1 px-3 mb-3">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
              7. TESTING REQUIREMENT
            </h2>
          </div>

          <div className="px-1 text-xs sm:text-sm space-y-3">
            {/* Test Types */}
            <div>
              <div className="font-bold mb-1">Test Type:</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_TEST_TYPES.map((tt) => {
                  const isChecked = (scr.testTypes || []).includes(tt);
                  return (
                    <label
                      key={tt}
                      onClick={() => isEditMode && toggleTestType(tt)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span className="font-mono">{isChecked ? '[x]' : '[ ]'}</span>
                      <span className={isChecked ? 'font-semibold text-slate-900' : 'text-slate-700'}>
                        {tt}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* UAT Owner & Target Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="font-bold">UAT Owner: </span>
                <span className="font-medium text-slate-800">{scr.uatOwner}</span>
              </div>
              <div>
                <span className="font-bold">UAT Target Date: </span>
                <span className="font-medium text-slate-800">{scr.uatTargetDate}</span>
              </div>
            </div>

            {/* UAT Result */}
            <div>
              <div className="font-bold mb-1">UAT Result:</div>
              <div className="flex items-center gap-6 flex-wrap">
                {(['Passed', 'Passed with Minor Issues', 'Failed'] as SCRUATResult[]).map((res) => {
                  const isChecked = scr.uatResult === res;
                  return (
                    <label
                      key={res}
                      onClick={() => isEditMode && handleUpdate({ uatResult: res })}
                      className="inline-flex items-center gap-2 cursor-pointer"
                    >
                      <span className="font-mono">{isChecked ? '[x]' : '[ ]'}</span>
                      <span className={isChecked ? 'font-bold text-emerald-700' : 'text-slate-700'}>
                        {res}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 9: APPROVAL MATRIX (PDF Page 4) */}
        <div className="mb-6">
          <div className="bg-[#e2e8f0] border border-slate-900 py-1 px-3 mb-3">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
              9. APPROVAL
            </h2>
          </div>

          <table className="w-full border-collapse border border-slate-900 text-xs sm:text-sm">
            <thead>
              <tr className="bg-sky-50/50 border-b border-slate-900 text-slate-900 font-bold">
                <th className="border-r border-slate-900 py-2 px-3 text-left w-1/4">
                  Approver Name
                </th>
                <th className="border-r border-slate-900 py-2 px-3 text-left w-1/4">
                  Title / Role
                </th>
                <th className="border-r border-slate-900 py-2 px-3 text-left w-1/4">
                  Signature
                </th>
                <th className="py-2 px-3 text-left w-1/4">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {(scr.approvers || []).map((appr) => (
                <tr key={appr.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="border-r border-slate-900 py-2.5 px-3 font-semibold text-slate-900">
                    {appr.name}
                  </td>
                  <td className="border-r border-slate-900 py-2.5 px-3 text-slate-700">
                    {appr.role}
                  </td>
                  <td className="border-r border-slate-900 py-2 px-3">
                    {appr.signed ? (
                      <span className="font-serif italic text-blue-900 font-bold text-sm tracking-wide">
                        {appr.signatureText || appr.name}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSignAsMe(appr.id)}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline print:hidden"
                      >
                        Click to Sign
                      </button>
                    )}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-600 text-xs">
                    {appr.signedDate || (appr.signed ? '2026-11-09' : '')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SECTION 10: TARGET TIMELINE (PDF Pages 4 & 5) */}
        <div className="mb-6">
          <div className="bg-[#e2e8f0] border border-slate-900 py-1 px-3 mb-3">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
              10. TARGET TIMELINE
            </h2>
          </div>

          <table className="w-full border-collapse border border-slate-900 text-xs sm:text-sm">
            <thead>
              <tr className="bg-sky-50/50 border-b border-slate-900 text-slate-900 font-bold">
                <th className="border-r border-slate-900 py-2 px-3 text-left w-28">
                  Phase
                </th>
                <th className="border-r border-slate-900 py-2 px-3 text-left">
                  Activity
                </th>
                <th className="border-r border-slate-900 py-2 px-3 text-center w-28">
                  Target Start Date
                </th>
                <th className="border-r border-slate-900 py-2 px-3 text-center w-32">
                  Target Completion Date
                </th>
                <th className="py-2 px-3 text-center w-20">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {(scr.timelinePhases || []).map((tp) => (
                <tr key={tp.id}>
                  <td className="border-r border-slate-900 py-2 px-3 font-semibold text-slate-900">
                    {tp.phase}
                  </td>
                  <td className="border-r border-slate-900 py-2 px-3 text-slate-800">
                    {tp.activity}
                  </td>
                  <td className="border-r border-slate-900 py-2 px-3 text-center font-mono text-slate-700 text-xs">
                    {tp.targetStartDate}
                  </td>
                  <td className="border-r border-slate-900 py-2 px-3 text-center font-mono text-slate-700 text-xs">
                    {tp.targetCompletionDate}
                  </td>
                  <td className="py-2 px-3 text-center font-mono font-medium text-slate-800 text-xs">
                    {tp.durationDays} Days
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SECTION 11: IMPLEMENTATION (PDF Page 5) */}
        <div className="mb-6">
          <div className="bg-[#e2e8f0] border border-slate-900 py-1 px-3 mb-3">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
              11. IMPLEMENTATION
            </h2>
          </div>

          <div className="border border-slate-900 p-3 text-xs sm:text-sm space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="font-bold">Development Start: </span>
                <span className="font-mono text-slate-800">{scr.implementation?.devStart || 'Nov 11, 2026'}</span>
              </div>
              <div>
                <span className="font-bold">Development Completion: </span>
                <span className="font-mono text-slate-800">{scr.implementation?.devCompletion || 'Nov 11, 2026'}</span>
              </div>
              <div>
                <span className="font-bold">UAT Start: </span>
                <span className="font-mono text-slate-800">{scr.implementation?.uatStart || 'Nov 12, 2026'}</span>
              </div>
              <div>
                <span className="font-bold">UAT Completion: </span>
                <span className="font-mono text-slate-800">{scr.implementation?.uatCompletion || 'Nov 12, 2026'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="font-bold">Production Deployment: </span>
                <span className="font-mono text-slate-800">{scr.implementation?.productionDeployment || 'Nov 13, 2026'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-300 space-y-1.5">
              <div>
                <span className="font-bold">Deployment Plan: </span>
                <span className="text-slate-800">{scr.implementation?.deploymentPlan || 'Deploy schema update to Cloudflare Workers and invalidate D1 cache'}</span>
              </div>
              <div>
                <span className="font-bold">Rollback Plan: </span>
                <span className="text-slate-800">{scr.implementation?.rollbackPlan || 'Revert dropdown configuration commit #c49a1f and re-enable nullable channel validation'}</span>
              </div>
              <div>
                <span className="font-bold">Post-Implementation Validation: </span>
                <span className="text-slate-800">{scr.implementation?.postImplementationValidation || 'Test live creation of Price Set-up form with Linen, RGC, and verify MHA (Mono/Retail/Ecom) label'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 12: CHANGE CLOSURE (PDF Page 5) */}
        <div>
          <div className="bg-[#e2e8f0] border border-slate-900 py-1 px-3 mb-3">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
              12. CHANGE CLOSURE
            </h2>
          </div>

          <div className="border border-slate-900 p-3 text-xs sm:text-sm space-y-2">
            <div>
              <span className="font-bold">Actual Implementation Date: </span>
              <span className="font-mono text-slate-800">{scr.closure?.actualImplementationDate || 'Nov 13, 2026'}</span>
            </div>

            <div>
              <div className="font-bold mb-1">Implementation Result:</div>
              <div className="flex items-center gap-6 flex-wrap">
                {(['Successfully Implemented', 'Implemented with Issues', 'Rolled Back'] as SCRImplementationResult[]).map((res) => {
                  const isChecked = scr.closure?.implementationResult === res;
                  return (
                    <label key={res} className="inline-flex items-center gap-2">
                      <span className="font-mono">{isChecked ? '[x]' : '[ ]'}</span>
                      <span className={isChecked ? 'font-bold text-emerald-800' : 'text-slate-700'}>
                        {res}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-6 pt-1">
              <span className="font-bold">Post-Implementation Review Required:</span>
              <label className="inline-flex items-center gap-1.5">
                <span className="font-mono">{scr.closure?.pirRequired ? '[x]' : '[ ]'}</span>
                <span>Yes</span>
              </label>
              <label className="inline-flex items-center gap-1.5">
                <span className="font-mono">{!scr.closure?.pirRequired ? '[x]' : '[ ]'}</span>
                <span>No</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-300">
              <div>
                <span className="font-bold">Closed By: </span>
                <span className="font-medium text-slate-800">{scr.closure?.closedBy || 'Jenor Ricafort'}</span>
              </div>
              <div>
                <span className="font-bold">Closure Date: </span>
                <span className="font-mono text-slate-800">{scr.closure?.closureDate || 'Nov 13, 2026'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Document Footer Signoff Stamp */}
        <div className="mt-8 pt-4 border-t border-slate-400 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono">
          <div>Multiflex RNC Philippines, Inc. · MIS AppForge Governance</div>
          <div>Ref: {scr.documentNo} · Uratex Quality Standard</div>
        </div>

      </div>
    </div>
  );
};
