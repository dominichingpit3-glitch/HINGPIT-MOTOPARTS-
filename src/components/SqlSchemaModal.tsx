import React, { useState, useEffect } from 'react';
import { Database, Copy, Check, Download, Server, RefreshCw, Layers, ShieldCheck, Code2, X, Cloud, CloudCheck, AlertCircle, ArrowUpRight, Zap, CheckCircle2 } from 'lucide-react';
import { SQL_SCHEMA_POSTGRES, SQL_SCHEMA_MYSQL } from '../data/sqlSchema';
import { api, SupabaseDetailedStatus } from '../services/api';

interface SqlSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  productCount: number;
  userCount: number;
  orderCount: number;
  onRefreshData?: () => void;
  onClearAll?: () => void;
}

export const SqlSchemaModal: React.FC<SqlSchemaModalProps> = ({
  isOpen,
  onClose,
  productCount,
  userCount,
  orderCount,
  onRefreshData,
  onClearAll
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'sync' | 'sql'>('sync');
  const [selectedDialect, setSelectedDialect] = useState<'postgres' | 'mysql'>('postgres');
  const [copied, setCopied] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  // Supabase live status and connection
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseDetailedStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState('');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');
  const [savingCredentials, setSavingCredentials] = useState(false);
  const [configMessage, setConfigMessage] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  const activeSchema = selectedDialect === 'postgres' ? SQL_SCHEMA_POSTGRES : SQL_SCHEMA_MYSQL;

  const loadStatus = async () => {
    setLoadingStatus(true);
    try {
      const status = await api.getSupabaseStatus();
      setSupabaseStatus(status);
      if (status?.url && !supabaseUrlInput) {
        setSupabaseUrlInput(status.url);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([activeSchema], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedDialect === 'postgres' ? 'motoparts_postgres_supabase_schema.sql' : 'motoparts_mysql_schema.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleConnectSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
      setConfigMessage({ type: 'error', text: 'Please enter both Supabase Project URL and Anon/Service Role Key.' });
      return;
    }

    setSavingCredentials(true);
    setConfigMessage(null);
    try {
      const res = await api.configureSupabase(supabaseUrlInput.trim(), supabaseKeyInput.trim());
      if (res.success) {
        if (res.warning) {
          setConfigMessage({ type: 'warning', text: res.warning });
        } else {
          setConfigMessage({ type: 'success', text: res.message || 'Supabase connected successfully!' });
        }
        await loadStatus();
        if (onRefreshData) onRefreshData();
      } else {
        setConfigMessage({ type: 'error', text: res.error || 'Failed to connect to Supabase.' });
      }
    } catch (err: any) {
      setConfigMessage({ type: 'error', text: err.message || 'Failed to save configuration.' });
    } finally {
      setSavingCredentials(false);
    }
  };

  const handleSyncAllToSupabase = async () => {
    setSyncingAll(true);
    setSyncSuccessMessage(null);
    try {
      const res = await api.syncAllToSupabase();
      if (res.success) {
        setSyncSuccessMessage(res.message);
        await loadStatus();
        if (onRefreshData) onRefreshData();
      } else {
        setConfigMessage({ type: 'error', text: res.message || 'Sync failed.' });
      }
    } catch (err: any) {
      setConfigMessage({ type: 'error', text: err.message || 'Sync error occurred.' });
    } finally {
      setSyncingAll(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-['Chakra_Petch']">
                  SUPABASE CLOUD DATABASE & SQL SCHEMA
                </h2>
                {supabaseStatus?.status === 'connected' ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Supabase Connected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Setup Needed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Direct PostgreSQL persistence for Accounts (<code className="text-emerald-400">users</code>), Products (<code className="text-emerald-400">products</code>), Reviews (<code className="text-emerald-400">reviews</code>), and Orders (<code className="text-emerald-400">orders</code>)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-4 sm:px-6 gap-2">
          <button
            onClick={() => setActiveTab('sync')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'sync'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>1. Supabase Cloud Connection & Sync</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'sql'
                ? 'border-rose-500 text-rose-400 bg-rose-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>2. SQL Schema Script (Postgres & MySQL)</span>
          </button>
        </div>

        {/* Tab 1: Live Supabase Cloud Connection & Sync */}
        {activeTab === 'sync' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-950 space-y-5">
            
            {/* Supabase Status Banner */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full ${supabaseStatus?.status === 'connected' ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse' : 'bg-amber-400'}`} />
                  <h3 className="text-sm font-bold text-white">Supabase Cloud Database Status</h3>
                </div>
                <button
                  onClick={loadStatus}
                  disabled={loadingStatus}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
                  <span>Refresh Status</span>
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {supabaseStatus?.message || 'Checking database connection status...'}
              </p>

              {/* Table Status Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className={`p-2.5 rounded-lg border ${supabaseStatus?.tables?.users ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold">Table: users</span>
                    {supabaseStatus?.tables?.users ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <span className="text-[10px] opacity-80 block mt-0.5">
                    {supabaseStatus?.counts?.users ?? userCount} accounts stored
                  </span>
                </div>

                <div className={`p-2.5 rounded-lg border ${supabaseStatus?.tables?.products ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold">Table: products</span>
                    {supabaseStatus?.tables?.products ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <span className="text-[10px] opacity-80 block mt-0.5">
                    {supabaseStatus?.counts?.products ?? productCount} parts stored
                  </span>
                </div>

                <div className={`p-2.5 rounded-lg border ${supabaseStatus?.tables?.reviews ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold">Table: reviews</span>
                    {supabaseStatus?.tables?.reviews ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <span className="text-[10px] opacity-80 block mt-0.5">
                    {supabaseStatus?.counts?.reviews ?? 0} reviews stored
                  </span>
                </div>

                <div className={`p-2.5 rounded-lg border ${supabaseStatus?.tables?.orders ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold">Table: orders</span>
                    {supabaseStatus?.tables?.orders ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <span className="text-[10px] opacity-80 block mt-0.5">
                    {supabaseStatus?.counts?.orders ?? orderCount} orders stored
                  </span>
                </div>
              </div>
            </div>

            {/* Supabase Connection Inputs */}
            <form onSubmit={handleConnectSupabase} className="p-4 sm:p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CloudCheck className="w-4 h-4 text-emerald-400" />
                  Connect or Update Supabase Credentials
                </h4>
                <span className="text-[10px] text-slate-400">
                  Find these in Supabase &gt; Project Settings &gt; API
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Supabase API Key (Anon Public or Service Role)
                  </label>
                  <input
                    type="password"
                    value={supabaseKeyInput}
                    onChange={(e) => setSupabaseKeyInput(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {configMessage && (
                <div className={`p-3 rounded-lg text-xs border ${
                  configMessage.type === 'success' ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' :
                  configMessage.type === 'warning' ? 'bg-amber-950/40 border-amber-800 text-amber-300' :
                  'bg-rose-950/40 border-rose-800 text-rose-300'
                }`}>
                  {configMessage.text}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <button
                  type="submit"
                  disabled={savingCredentials}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all active:scale-95"
                >
                  {savingCredentials ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>{savingCredentials ? 'Connecting...' : 'Save & Connect Supabase'}</span>
                </button>

                {supabaseStatus?.status === 'connected' && (
                  <button
                    type="button"
                    onClick={handleSyncAllToSupabase}
                    disabled={syncingAll}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all active:scale-95"
                  >
                    {syncingAll ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
                    <span>{syncingAll ? 'Syncing...' : 'Sync All Data to Supabase Now'}</span>
                  </button>
                )}
              </div>

              {syncSuccessMessage && (
                <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{syncSuccessMessage}</span>
                </div>
              )}
            </form>

            {/* Quick 3-Step Setup Instructions */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2.5 text-slate-300">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> How to guarantee 100% sync to Supabase:
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-400 leading-relaxed text-[11px]">
                <li>Go to the <strong className="text-white">"2. SQL Schema Script"</strong> tab above, click <strong className="text-white">"Copy SQL Script"</strong>.</li>
                <li>Open your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold">Supabase Project Dashboard</a> &gt; <strong className="text-white">SQL Editor</strong> &gt; <strong className="text-white">New Query</strong>, paste the script and click <strong className="text-white">RUN</strong>.</li>
                <li>Copy your <strong className="text-white">Project URL</strong> and <strong className="text-white">anon public API key</strong> from Supabase Project Settings &gt; API, paste them above, and click <strong className="text-white">"Save & Connect Supabase"</strong>!</li>
              </ol>
            </div>

          </div>
        )}

        {/* Tab 2: SQL DDL Schema Code */}
        {activeTab === 'sql' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-950 space-y-4">
            
            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              {/* Dialect Tabs */}
              <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setSelectedDialect('postgres')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedDialect === 'postgres'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>PostgreSQL / Supabase</span>
                </button>
                <button
                  onClick={() => setSelectedDialect('mysql')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedDialect === 'mysql'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>MySQL 8.0+</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 active:scale-95"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/30 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .sql</span>
                </button>
              </div>
            </div>

            {/* Code Viewer */}
            <div className="relative rounded-xl border border-slate-800 bg-[#0B0F19] overflow-hidden">
              <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono">{selectedDialect === 'postgres' ? 'schema.postgres.sql' : 'schema.mysql.sql'}</span>
                <span className="text-emerald-400 font-semibold">Includes `DROP POLICY IF EXISTS` fix</span>
              </div>
              <pre className="p-4 text-[11px] sm:text-xs font-mono text-emerald-300/90 leading-relaxed overflow-x-auto select-all max-h-96">
                {activeSchema}
              </pre>
            </div>

            {/* Admin Clean Slate Section */}
            {onClearAll && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Want to wipe all uploaded items and start fresh?
                </span>
                {confirmClear ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onClearAll();
                        setConfirmClear(false);
                      }}
                      className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-500"
                    >
                      Confirm Wipe
                    </button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="px-2 py-1 text-slate-400 text-xs hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline"
                  >
                    Clear All Uploaded Items (Clean Slate)
                  </button>
                )}
              </div>
            )}

          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Live Products: <strong className="text-rose-400">{productCount}</strong></span>
            <span>Accounts: <strong className="text-blue-400">{userCount}</strong></span>
            <span>Orders: <strong className="text-emerald-400">{orderCount}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
};
