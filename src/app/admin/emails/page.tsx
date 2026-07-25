/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mail, Search, RefreshCw, ChevronDown, ChevronUp, AlertCircle, CheckCircle, ExternalLink
} from 'lucide-react';

interface EmailNotification {
  id: string;
  orderId: string;
  orderNumber: string;
  type: string;
  recipient: string;
  status: string;
  providerMessageId: string | null;
  error: string | null;
  sentAt: string;
}

const TYPE_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  ORDER_CONFIRMATION: { label: 'Customer Confirmation', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
  NEW_ORDER_ADMIN: { label: 'Admin Alert', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
  ORDER_SHIPPED: { label: 'Shipped Notice', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
  ORDER_DELIVERED: { label: 'Delivered Notice', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
};

export default function EmailsLogPage() {
  const [logs, setLogs] = useState<EmailNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'FAILED'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/emails');
      const data = await res.json();
      if (data.success) {
        setLogs(data.notifications || []);
      } else {
        setError(data.error || 'Failed to load email logs.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Filtering logs based on user search and dropdown filter settings
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.recipient.toLowerCase().includes(search.toLowerCase()) ||
      log.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      log.orderId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || log.status === statusFilter;

    const matchesType =
      typeFilter === 'ALL' || log.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Email Notifications Log</h1>
          <p className="text-sm text-slate-500">Track and audit system-generated transactional emails sent via Resend.</p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Log
        </button>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by recipient email or order number..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'SUCCESS' | 'FAILED')}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Success Only</option>
            <option value="FAILED">Failed Only</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="ORDER_CONFIRMATION">Customer Confirmation</option>
            <option value="NEW_ORDER_ADMIN">Admin Alert</option>
            <option value="ORDER_SHIPPED">Shipped Notice</option>
            <option value="ORDER_DELIVERED">Delivered Notice</option>
          </select>
        </div>
      </div>

      {/* Main Table view */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
          <button onClick={fetchLogs} className="font-bold underline ml-auto">Retry</button>
        </div>
      )}

      {!error && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Order</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Type</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Recipient</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Date Sent</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [1, 2, 3].map((n) => (
                    <tr key={n} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                    </tr>
                  ))
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <Mail size={32} className="mx-auto mb-3 text-slate-300" />
                      <p className="text-sm">No notification records found matching filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const isExpanded = expandedId === log.id;
                    const typeConfig = TYPE_LABELS[log.type] || { label: log.type, bg: 'bg-slate-50 border-slate-200', text: 'text-slate-700' };

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/orders/${log.orderId}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                          >
                            {log.orderNumber}
                            <ExternalLink size={12} />
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-1 text-[11px] font-bold border rounded-full ${typeConfig.bg} ${typeConfig.text}`}>
                            {typeConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-[180px]" title={log.recipient}>
                          {log.recipient}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold ${log.status === 'SUCCESS' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {log.status === 'SUCCESS' ? (
                              <CheckCircle size={14} className="text-emerald-500" />
                            ) : (
                              <AlertCircle size={14} className="text-rose-500" />
                            )}
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(log.sentAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => toggleExpand(log.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors"
                          >
                            Logs
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expanded Log detail drawer/card */}
      {!loading && expandedId && (() => {
        const selected = logs.find((l) => l.id === expandedId);
        if (!selected) return null;

        return (
          <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-slate-400">NOTIFICATION DEBUG INFO</span>
              <button
                onClick={() => setExpandedId(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500">Record ID:</p>
                <p className="text-slate-300 font-bold select-all">{selected.id}</p>
              </div>
              <div>
                <p className="text-slate-500">Resend Message ID:</p>
                <p className="text-slate-300 font-bold select-all">{selected.providerMessageId || 'N/A'}</p>
              </div>
            </div>
            <div>
              <p className="text-slate-500">Recipient Target:</p>
              <p className="text-slate-300 select-all">{selected.recipient}</p>
            </div>
            <div>
              <p className="text-slate-500">Provider Status / Raw Errors:</p>
              {selected.error ? (
                <pre className="mt-1 p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-red-300 overflow-x-auto whitespace-pre-wrap max-h-40">
                  {selected.error}
                </pre>
              ) : (
                <p className="text-emerald-400 font-bold">Successfully processed by provider API (No errors recorded).</p>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
