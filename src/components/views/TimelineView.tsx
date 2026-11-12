import React from 'react';
import { useAppForge } from '../../context/AppForgeContext';
import { SDLC_STAGES_CONFIG } from '../../data/seedData';
import { Calendar, Clock, ChevronRight } from 'lucide-react';

export const TimelineView: React.FC = () => {
  const {
    requests,
    searchQuery,
    selectedDepartment,
    selectedUrgency,
    selectedType,
    setSelectedRequest,
  } = useAppForge();

  const filteredRequests = requests.filter((r) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        r.code.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedDepartment !== 'All' && r.department !== selectedDepartment) return false;
    if (selectedUrgency !== 'All' && r.urgency !== selectedUrgency) return false;
    if (selectedType !== 'All' && r.type !== selectedType) return false;
    return true;
  });

  const getStageColor = (stage: number) => {
    const cfg = SDLC_STAGES_CONFIG.find((s) => s.stage === stage);
    return cfg?.badgeColor || 'bg-blue-600 text-white';
  };

  // Mock timeline quarter boundaries (2026 Q3, Q4, 2027 Q1)
  const quarters = [
    { label: 'Q3 2026 (Jul - Sep)', range: '2026-07 to 2026-09' },
    { label: 'Q4 2026 (Oct - Dec)', range: '2026-10 to 2026-12' },
    { label: 'Q1 2027 (Jan - Mar)', range: '2027-01 to 2027-03' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto">
      
      {/* Intro info bar */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded p-3.5 text-xs shadow-2xs border-t-3 border-t-teal-600">
        <div className="flex items-center gap-2 text-slate-700">
          <Calendar className="w-4 h-4 text-teal-600" />
          <span className="font-bold">Uratex SDLC Delivery Schedule & Quarter Horizon</span>
          <span className="text-slate-400">·</span>
          <span>Timeline mapping across Conception through Go-Live and Evaluation</span>
        </div>
        <div className="font-mono text-slate-500 tabular-nums">
          {filteredRequests.length} Scheduled Deliverables
        </div>
      </div>

      {/* Timeline Grid Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        
        {/* Quarter Headers */}
        <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-600">
          <div className="col-span-4 p-3 border-r border-slate-200">
            Request / Initiative
          </div>
          {quarters.map((q, idx) => (
            <div
              key={idx}
              className="col-span-2 sm:col-span-2 text-center p-3 border-r border-slate-200 last:border-r-0"
            >
              <div className="font-bold text-slate-800">{q.label.split(' ')[0]}</div>
              <div className="text-[10px] text-slate-400">{q.label.split(' ')[1]}</div>
            </div>
          ))}
          <div className="col-span-2 p-3 text-right">
            Effort / Target
          </div>
        </div>

        {/* Timeline Rows */}
        <div className="divide-y divide-slate-100">
          {filteredRequests.map((req) => {
            // Determine relative bar positioning across our 2026-06 to 2027-03 span
            const effort = req.sdlc.planning.effortEstimateDays || 10;
            const progress =
              req.currentSDLCStage >= 11
                ? 100
                : req.currentSDLCStage === 8
                ? 90
                : req.currentSDLCStage === 6
                ? 75
                : req.currentSDLCStage === 5
                ? req.sdlc.development.percentComplete || 50
                : req.currentSDLCStage >= 3
                ? 30
                : 15;

            return (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className="grid grid-cols-12 items-center hover:bg-blue-50/40 cursor-pointer p-3 text-xs transition-colors group"
              >
                {/* Left: Code, Title, Lead */}
                <div className="col-span-4 pr-3 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                      {req.code}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 truncate">
                      {req.department}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 group-hover:text-blue-700 truncate">
                    {req.title}
                  </div>
                </div>

                {/* Middle: Gantt Bar Span across the 6 columns */}
                <div className="col-span-6 px-2">
                  <div className="w-full bg-slate-100 h-7 rounded-lg p-1 relative overflow-hidden flex items-center">
                    {/* Fill bar */}
                    <div
                      className={`h-full rounded-md flex items-center justify-between px-2 text-[10px] font-bold ${getStageColor(
                        req.currentSDLCStage
                      )} shadow-2xs transition-all`}
                      style={{
                        width: `${Math.max(35, Math.min(100, progress + 15))}%`,
                      }}
                    >
                      <span className="truncate">Stage {req.currentSDLCStage}: {req.status}</span>
                      <span className="font-mono tabular-nums opacity-90">{progress}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 px-1 font-mono tabular-nums">
                    <span>Start: {req.startDate}</span>
                    <span>Target: {req.targetGoLiveDate}</span>
                  </div>
                </div>

                {/* Right: Effort & Lead */}
                <div className="col-span-2 text-right pl-3">
                  <div className="font-bold text-slate-800 font-mono tabular-nums">
                    {effort} man-days
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                    <img
                      src={req.assignedLeadAvatar}
                      alt={req.assignedLead}
                      className="w-4 h-4 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="truncate max-w-[80px]">{req.assignedLead.split(' ')[0]}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
