import React, { useState } from 'react';
import { Database, Copy, Check, Download, Server, RefreshCw, Layers, ShieldCheck, Cpu, Code2, X } from 'lucide-react';
import { SQL_SCHEMA_POSTGRES, SQL_SCHEMA_MYSQL } from '../data/sqlSchema';

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

  const [selectedDialect, setSelectedDialect] = useState<'postgres' | 'mysql'>('postgres');
  const [copied, setCopied] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const activeSchema = selectedDialect === 'postgres' ? SQL_SCHEMA_POSTGRES : SQL_SCHEMA_MYSQL;

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
                  SQL RELATIONAL DATABASE SCHEMA & CODE
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Multi-Device Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Production DDL & DML scripts for Products, Reviews, User Accounts, and GCash Orders
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

        {/* Live Multi-Device Sync Banner */}
        <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <Server className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="text-slate-300">
              <strong className="text-white">Active Server Sync:</strong> When you upload products on this device, our Node/Express backend stores them so <em>all other devices and phones visiting the site see them immediately!</em>
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-400">
            <span>Live Products: <strong className="text-rose-400">{productCount}</strong></span>
            <span>Accounts: <strong className="text-blue-400">{userCount}</strong></span>
            <span>Orders: <strong className="text-emerald-400">{orderCount}</strong></span>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="p-4 sm:px-6 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
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

            {onRefreshData && (
              <button
                onClick={onRefreshData}
                title="Sync & refresh live data"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* SQL Code Display Box */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-950 space-y-4">
          
          {/* Tables Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">1. USERS TABLE</span>
              <span className="text-white font-semibold">users</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Rider & Seller profiles, GCash, addresses</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">2. PRODUCTS TABLE</span>
              <span className="text-white font-semibold">products</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Parts, prices, fitment, stock, images</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">3. REVIEWS TABLE</span>
              <span className="text-white font-semibold">reviews</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Ratings (1-5), verified rider feedback</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">4. ORDERS TABLE</span>
              <span className="text-white font-semibold">orders & items</span>
              <p className="text-[10px] text-slate-400 mt-0.5">GCash PayMongo refs, tracking, parcels</p>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="relative rounded-xl border border-slate-800 bg-[#0B0F19] overflow-hidden">
            <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono">{selectedDialect === 'postgres' ? 'schema.postgres.sql' : 'schema.mysql.sql'}</span>
              <span>UTF-8 • SQL DDL</span>
            </div>
            <pre className="p-4 text-[11px] sm:text-xs font-mono text-emerald-300/90 leading-relaxed overflow-x-auto select-all max-h-80">
              {activeSchema}
            </pre>
          </div>

          {/* Quick Setup Guide */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2 text-slate-300">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> How to deploy this SQL to your database:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 leading-normal text-[11px]">
              <li>Open your <strong>Supabase Dashboard</strong>, <strong>Neon Console</strong>, or <strong>Cloud SQL / pgAdmin</strong>.</li>
              <li>Click <strong>SQL Editor</strong> &gt; <strong>New Query</strong>.</li>
              <li>Click <strong>Copy SQL Script</strong> above and paste it into the editor.</li>
              <li>Click <strong>RUN</strong>. All 5 tables, foreign keys, JSONB columns, and indexes will be created instantly.</li>
            </ol>
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

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Powered by MotoParts Express Multi-Device Engine
          </span>
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
