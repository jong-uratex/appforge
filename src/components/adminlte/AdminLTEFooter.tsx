import React from 'react';

export const AdminLTEFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-4 sm:px-6 py-3 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2 select-none shrink-0">
      <div>
        <strong>
          Copyright &copy; 2026{' '}
          <span className="text-blue-600 font-semibold">
            Uratex Philippines (Multiflex RNC Philippines, Inc.)
          </span>
          .
        </strong>{' '}
        All rights reserved.
      </div>

      <div className="flex items-center gap-2 text-[11px] font-mono">
        <span className="text-gray-400">Serverless Architecture</span>
        <span className="text-gray-300">|</span>
        <span>
          MIS AppForge <b>Version</b> 2.4.0
        </span>
      </div>
    </footer>
  );
};
