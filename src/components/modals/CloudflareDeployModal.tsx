import React, { useState } from 'react';
import { useAppForge } from '../../context/AppForgeContext';
import {
  Cloud,
  X,
  Download,
  Upload,
  CheckCircle2,
  Copy,
  Server,
  Terminal,
  FileCode,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const CloudflareDeployModal: React.FC = () => {
  const {
    isCloudflareModalOpen,
    setIsCloudflareModalOpen,
    exportData,
    importData,
    requests,
  } = useAppForge();

  const [activeTab, setActiveTab] = useState<'architecture' | 'wrangler' | 'function' | 'backup'>('architecture');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isCloudflareModalOpen) return null;

  const wranglerTomlCode = `# Cloudflare Pages & Workers Configuration
name = "uratex-mis-appforge"
compatibility_date = "2026-11-09"
compatibility_flags = ["nodejs_compat"]

[site]
bucket = "./dist"

# Cloudflare D1 Relational SQL Database (Optional server-side persistence)
[[d1_databases]]
binding = "DB"
database_name = "uratex-appforge-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Cloudflare KV for Session & Fast Cache
[[kv_namespaces]]
binding = "APPFORGE_KV"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

[vars]
ENVIRONMENT = "production"
URATEX_DIVISION = "MIS-PHILIPPINES"
`;

  const serverlessFunctionCode = `// functions/api/requests.ts
// Cloudflare Pages Function (Serverless Edge Worker)
interface Env {
  DB?: any;
  APPFORGE_KV?: any;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  // Returns all Uratex SDLC requests from edge KV or D1
  const cached = await context.env.APPFORGE_KV?.get("ALL_REQUESTS");
  if (cached) {
    return new Response(cached, {
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
    });
  }
  return new Response(JSON.stringify({ status: "ok", message: "Edge worker operational" }), {
    headers: { "Content-Type": "application/json" },
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const payload = await context.request.json();
  // Serverless mutation at the edge
  return new Response(JSON.stringify({ success: true, received: payload }), {
    headers: { "Content-Type": "application/json" },
  });
};
`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadBackup = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uratex-mis-appforge-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) return;
    const ok = importData(importJsonText.trim());
    if (ok) {
      setImportStatus('Successfully imported requests!');
      setTimeout(() => setImportStatus(null), 3000);
    } else {
      setImportStatus('Error: Invalid JSON schema format.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Cloudflare Workers & Pages Serverless Architecture
              </h3>
              <p className="text-[11px] text-slate-500">
                Edge deployment configuration and serverless database synchronization
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCloudflareModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-white text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'architecture'
                ? 'border-amber-500 text-amber-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Architecture
          </button>
          <button
            onClick={() => setActiveTab('wrangler')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'wrangler'
                ? 'border-amber-500 text-amber-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            wrangler.toml
          </button>
          <button
            onClick={() => setActiveTab('function')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'function'
                ? 'border-amber-500 text-amber-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Pages Function API
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'backup'
                ? 'border-amber-500 text-amber-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Export / Import DB
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          
          {/* TAB 1: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-emerald-950">
                    100% Cloudflare Edge & Serverless Compatible
                  </div>
                  <p className="text-emerald-800 text-[11px] leading-relaxed">
                    MIS AppForge is built strictly using standard Web Standards (Fetch, Streams,
                    Web Crypto, LocalStorage, and standard ES modules). It has zero proprietary
                    native Node runtime bindings, making it ready to build into <code className="font-mono bg-white/60 px-1 rounded">dist/</code> and host directly on Cloudflare Pages with zero configuration.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-amber-600" />
                    Frontend: Cloudflare Pages
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Global edge CDN hosting with ultra-fast latency across Philippine ISPs
                    (PLDT, Globe, Converge) from Cloudflare's Manila & Cebu edge PoPs.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-blue-600" />
                    Backend: Pages Functions / Workers
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Serverless functions located in <code className="font-mono bg-white px-1 rounded">/functions</code> execute at the edge with sub-millisecond cold starts and automatic scaling.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl space-y-2 font-mono text-[11px]">
                <div className="text-slate-400 font-sans font-semibold text-xs">
                  Deployment Quick Commands:
                </div>
                <div className="text-emerald-400"># 1. Build the production bundle</div>
                <div>npm run build</div>
                <div className="text-emerald-400 mt-1"># 2. Deploy directly via Cloudflare Wrangler</div>
                <div>npx wrangler pages deploy dist --project-name=uratex-mis-appforge</div>
              </div>
            </div>
          )}

          {/* TAB 2: WRANGLER.TOML */}
          {activeTab === 'wrangler' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  Ready-to-use <code className="font-mono text-amber-700">wrangler.toml</code>
                </span>
                <button
                  onClick={() => copyToClipboard(wranglerTomlCode, 'wrangler')}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-md font-semibold text-slate-700 text-xs transition-colors"
                >
                  {copiedKey === 'wrangler' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Config</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
                {wranglerTomlCode}
              </pre>
            </div>
          )}

          {/* TAB 3: PAGES FUNCTION */}
          {activeTab === 'function' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  Edge Worker Handler (<code className="font-mono text-blue-700">functions/api/requests.ts</code>)
                </span>
                <button
                  onClick={() => copyToClipboard(serverlessFunctionCode, 'function')}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-md font-semibold text-slate-700 text-xs transition-colors"
                >
                  {copiedKey === 'function' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
                {serverlessFunctionCode}
              </pre>
            </div>
          )}

          {/* TAB 4: BACKUP / RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Export All Requests & Checklists</div>
                  <div className="text-[11px] text-slate-500">
                    Currently tracking {requests.length} Uratex requests in persistent store
                  </div>
                </div>
                <button
                  onClick={handleDownloadBackup}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON</span>
                </button>
              </div>

              {/* Import JSON */}
              <form onSubmit={handleImportSubmit} className="space-y-2">
                <label className="font-bold text-slate-800 block">
                  Restore / Import JSON Database
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste exported JSON array here to restore database..."
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-emerald-700 font-semibold font-mono">
                    {importStatus}
                  </span>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import Data</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
