import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Server, Router, Wifi, Ticket, Users, DollarSign, Activity,
  Settings, Terminal, Shield, List, Plus, RefreshCw, Trash2,
  Printer, QrCode, Search, Download, CheckCircle, AlertTriangle,
  XCircle, Zap, Cpu, HardDrive, Globe, Eye, Copy, Lock, Unlock,
  CreditCard, FileText, ChevronRight, BarChart2, Radio, Play, Sliders,
  HelpCircle, ExternalLink, ArrowUpRight, ArrowDownLeft, Power, Sparkles,
  Filter, Check, X, LayoutDashboard, ChevronDown, Monitor, Smartphone
} from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [statusData, setStatusData] = useState(null);
  const [routers, setRouters] = useState([]);
  const [selectedRouter, setSelectedRouter] = useState(null);
  const [routerDetails, setRouterDetails] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sales, setSales] = useState({ sales: [], daily_stats: [] });
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modals state
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showQuickUserModal, setShowQuickUserModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedVoucherForSell, setSelectedVoucherForSell] = useState(null);
  const [showRouterModal, setShowRouterModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printItems, setPrintItems] = useState([]);
  const [printMode, setPrintMode] = useState('thermal'); // 'thermal' or 'grid'

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch all initial data
  const loadData = async () => {
    try {
      const [statusRes, routerRes, profileRes, settingsRes] = await Promise.all([
        fetch('./api/status').then(r => r.json()),
        fetch('./api/routers').then(r => r.json()),
        fetch('./api/profiles').then(r => r.json()),
        fetch('./api/settings').then(r => r.json())
      ]);

      setStatusData(statusRes);
      setRouters(routerRes);
      setProfiles(profileRes);
      setSettings(settingsRes);

      if (routerRes.length > 0 && !selectedRouter) {
        setSelectedRouter(routerRes[0]);
      }
    } catch (err) {
      console.error('Failed loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(async () => {
      try {
        const s = await fetch('./api/status').then(r => r.json());
        setStatusData(s);
      } catch (e) {}
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch router details when selected router changes
  useEffect(() => {
    if (selectedRouter) {
      fetch(`./api/routers/${selectedRouter.id}/details`)
        .then(r => r.json())
        .then(data => setRouterDetails(data))
        .catch(err => console.error(err));
    }
  }, [selectedRouter]);

  // Fetch tab-specific data
  useEffect(() => {
    if (activeTab === 'vouchers') {
      fetch('./api/vouchers').then(r => r.json()).then(setVouchers);
    } else if (activeTab === 'sessions') {
      fetch('./api/sessions').then(r => r.json()).then(data => setSessions(data.sessions || []));
    } else if (activeTab === 'sales') {
      fetch('./api/sales').then(r => r.json()).then(setSales);
    } else if (activeTab === 'logs') {
      fetch('./api/logs').then(r => r.json()).then(setLogs);
    }
  }, [activeTab]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border text-sm font-medium animate-bounce ${
          toast.type === 'error' ? 'bg-rose-950 border-rose-700 text-rose-200' : 'bg-indigo-950 border-indigo-700 text-indigo-200'
        }`}>
          {toast.type === 'error' ? <AlertTriangle className="w-5 h-5 text-rose-400" /> : <CheckCircle className="w-5 h-5 text-emerald-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              <Router className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white tracking-wide leading-tight">MikroTik OS</h1>
              <p className="text-[11px] text-indigo-400 font-medium">Hotspot & ISP Control</p>
            </div>
          </div>
        </div>

        {/* Router Selector Dropdown */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-900/50">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1 block">Active Gateway</label>
          <div className="relative">
            <select
              value={selectedRouter ? selectedRouter.id : ''}
              onChange={(e) => {
                const r = routers.find(item => item.id === Number(e.target.value));
                if (r) setSelectedRouter(r);
              }}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md px-2.5 py-1.5 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            >
              {routers.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.host})</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-xs font-medium">
          <NavItem id="dashboard" label="Dashboard Overview" icon={LayoutDashboard} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="routers" label="Router Hardware" icon={Server} badge={routers.length} activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <div className="pt-3 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2">Hotspot Control</span>
          </div>

          <NavItem id="vouchers" label="Vouchers & Users" icon={Ticket} badge={statusData?.vouchers?.active} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="profiles" label="Tariffs & Profiles" icon={Sliders} badge={profiles.length} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="sessions" label="Active Sessions" icon={Wifi} badge={statusData?.active_sessions} activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <div className="pt-3 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2">Tools & Analytics</span>
          </div>

          <NavItem id="sales" label="Sales & Reports" icon={BarChart2} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="portal" label="Captive Portal Studio" icon={Monitor} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="terminal" label="RouterOS CLI & Scripts" icon={Terminal} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="logs" label="System Event Logs" icon={List} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="settings" label="System Settings" icon={Settings} activeTab={activeTab} setActiveTab={setActiveTab} />
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/80 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>REST API Ready</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">v7.15.1</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        {/* Top bar */}
        <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-slate-100 text-sm capitalize">
              {activeTab === 'dashboard' && 'Control Panel Overview'}
              {activeTab === 'routers' && 'RouterOS Device Telemetry & Interfaces'}
              {activeTab === 'vouchers' && 'Hotspot Voucher Management'}
              {activeTab === 'profiles' && 'User Profiles & Bandwidth Tariffs'}
              {activeTab === 'sessions' && 'Live Connected Hotspot Sessions'}
              {activeTab === 'sales' && 'Voucher Sales & Revenue Analytics'}
              {activeTab === 'portal' && 'Captive Portal Landing Page Studio'}
              {activeTab === 'terminal' && 'RouterOS Terminal & Auto Scripting'}
              {activeTab === 'logs' && 'Router System & Hotspot Event Logs'}
              {activeTab === 'settings' && 'System & Business Configuration'}
            </h2>
            {selectedRouter && (
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 border border-slate-700 text-slate-300">
                {selectedRouter.host}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBatchModal(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Batch Vouchers</span>
            </button>
            <button
              onClick={() => setShowQuickUserModal(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Add User</span>
            </button>
            <button
              onClick={loadData}
              className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-all"
              title="Refresh Telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Tab Content Rendering */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              status={statusData}
              router={selectedRouter}
              details={routerDetails}
              onNavigate={setActiveTab}
              onGenBatch={() => setShowBatchModal(true)}
              onQuickUser={() => setShowQuickUserModal(true)}
            />
          )}

          {activeTab === 'routers' && (
            <RouterManagerView
              routers={routers}
              selectedRouter={selectedRouter}
              details={routerDetails}
              onAddRouter={() => setShowRouterModal(true)}
              onSelectRouter={setSelectedRouter}
              onRefresh={loadData}
              showToast={showToast}
            />
          )}

          {activeTab === 'vouchers' && (
            <VoucherControlView
              vouchers={vouchers}
              profiles={profiles}
              settings={settings}
              onRefresh={() => fetch('./api/vouchers').then(r => r.json()).then(setVouchers)}
              onGenBatch={() => setShowBatchModal(true)}
              onQuickUser={() => setShowQuickUserModal(true)}
              onSell={(v) => {
                setSelectedVoucherForSell(v);
                setShowSellModal(true);
              }}
              onPrint={(vouchersList, mode) => {
                setPrintItems(vouchersList);
                setPrintMode(mode);
                setShowPrintModal(true);
              }}
              showToast={showToast}
            />
          )}

          {activeTab === 'profiles' && (
            <ProfilesView
              profiles={profiles}
              settings={settings}
              onAddProfile={() => setShowProfileModal(true)}
              onRefresh={() => fetch('./api/profiles').then(r => r.json()).then(setProfiles)}
              showToast={showToast}
            />
          )}

          {activeTab === 'sessions' && (
            <ActiveSessionsView
              sessions={sessions}
              onRefresh={() => fetch('./api/sessions').then(r => r.json()).then(d => setSessions(d.sessions || []))}
              showToast={showToast}
            />
          )}

          {activeTab === 'sales' && (
            <SalesAnalyticsView
              salesData={sales}
              settings={settings}
              showToast={showToast}
            />
          )}

          {activeTab === 'portal' && (
            <PortalCustomizerView
              settings={settings}
              onSaveSettings={async (newSet) => {
                await fetch('./api/settings', {
                  method: 'POST',
                  body: JSON.stringify(newSet)
                });
                setSettings({...settings, ...newSet});
                showToast('Captive portal settings saved!');
              }}
            />
          )}

          {activeTab === 'terminal' && (
            <TerminalScriptView
              selectedRouter={selectedRouter}
              showToast={showToast}
            />
          )}

          {activeTab === 'logs' && (
            <LogsView
              logs={logs}
              onRefresh={() => fetch('./api/logs').then(r => r.json()).then(setLogs)}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSave={async (newSet) => {
                await fetch('./api/settings', {
                  method: 'POST',
                  body: JSON.stringify(newSet)
                });
                setSettings(newSet);
                showToast('Settings saved successfully!');
              }}
            />
          )}
        </div>
      </main>

      {/* Batch Voucher Modal */}
      {showBatchModal && (
        <BatchVoucherModal
          profiles={profiles}
          onClose={() => setShowBatchModal(false)}
          onSuccess={(newVouchersList) => {
            setShowBatchModal(false);
            showToast('Batch vouchers generated successfully!');
            fetch('./api/vouchers').then(r => r.json()).then(setVouchers);
            if (activeTab !== 'vouchers') setActiveTab('vouchers');
          }}
        />
      )}

      {/* Quick User / Single Voucher Modal */}
      {showQuickUserModal && (
        <QuickUserModal
          profiles={profiles}
          onClose={() => setShowQuickUserModal(false)}
          onSuccess={() => {
            setShowQuickUserModal(false);
            showToast('User / Voucher created!');
            fetch('./api/vouchers').then(r => r.json()).then(setVouchers);
            if (activeTab !== 'vouchers') setActiveTab('vouchers');
          }}
        />
      )}

      {/* Sell Voucher Modal */}
      {showSellModal && selectedVoucherForSell && (
        <SellVoucherModal
          voucher={selectedVoucherForSell}
          settings={settings}
          onClose={() => setShowSellModal(false)}
          onSuccess={() => {
            setShowSellModal(false);
            showToast(`Voucher ${selectedVoucherForSell.code} sold & activated!`);
            fetch('./api/vouchers').then(r => r.json()).then(setVouchers);
            loadData();
          }}
        />
      )}

      {/* Router Add Modal */}
      {showRouterModal && (
        <AddRouterModal
          onClose={() => setShowRouterModal(false)}
          onSuccess={() => {
            setShowRouterModal(false);
            showToast('New router added!');
            loadData();
          }}
        />
      )}

      {/* Profile Add Modal */}
      {showProfileModal && (
        <AddProfileModal
          routerId={selectedRouter?.id || 1}
          onClose={() => setShowProfileModal(false)}
          onSuccess={() => {
            setShowProfileModal(false);
            showToast('Tariff profile added!');
            fetch('./api/profiles').then(r => r.json()).then(setProfiles);
          }}
        />
      )}

      {/* Print Modal */}
      {showPrintModal && (
        <PrintModal
          items={printItems}
          mode={printMode}
          settings={settings}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}

function NavItem({ id, label, icon: Icon, badge, activeTab, setActiveTab }) {
  const active = activeTab === id;
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
        active
          ? 'bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/30'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-500'}`} />
        <span>{label}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
          active ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ----------------------------------------------------------------------
// 1. DASHBOARD VIEW
// ----------------------------------------------------------------------
function DashboardView({ status, router, details, onNavigate, onGenBatch, onQuickUser }) {
  const currency = '$';

  return (
    <div className="space-y-6">
      {/* Top Stat Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today Sales</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {currency}{status?.today_revenue ? status.today_revenue.toFixed(2) : '0.00'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {status?.today_sales_count || 0} vouchers sold today
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Hotspot Users</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Wifi className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {status?.active_sessions || 0}
            </div>
            <p className="text-[11px] text-indigo-400 mt-1 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live connected
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Vouchers</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {status?.vouchers?.active || 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Ready for sale / use
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Bandwidth Speed</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <div>
              <span className="text-xs text-emerald-400 font-mono font-semibold flex items-center gap-0.5">
                <ArrowDownLeft className="w-3.5 h-3.5" /> RX
              </span>
              <span className="text-lg font-bold font-mono text-white">{status?.traffic?.rx_mbps || 0} <span className="text-xs text-slate-400">Mbps</span></span>
            </div>
            <div>
              <span className="text-xs text-indigo-400 font-mono font-semibold flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> TX
              </span>
              <span className="text-lg font-bold font-mono text-white">{status?.traffic?.tx_mbps || 0} <span className="text-xs text-slate-400">Mbps</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Router Telemetry Overview */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="font-bold text-slate-100 text-sm">{router?.name || 'Core Router Gateway'}</h3>
                <p className="text-xs text-slate-400 font-mono">{router?.host} • RouterOS v{router?.ros_version}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Online
            </span>
          </div>

          {/* Router Hardware Gauge Meters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg text-center">
              <Cpu className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-400 uppercase block">CPU Load</span>
              <span className="text-lg font-bold font-mono text-white">{details?.resources?.cpu_load || 12}%</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg text-center">
              <HardDrive className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Free RAM</span>
              <span className="text-lg font-bold font-mono text-white">{details?.resources?.free_memory_mb || 184} MB</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg text-center">
              <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Voltage</span>
              <span className="text-lg font-bold font-mono text-white">{details?.resources?.voltage || '24.1V'}</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg text-center">
              <Activity className="w-4 h-4 text-rose-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Uptime</span>
              <span className="text-xs font-bold font-mono text-slate-200 block mt-1.5">{details?.resources?.uptime || '14d 06h'}</span>
            </div>
          </div>

          {/* Live Simulated Bandwidth Graph */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-400" />
                Real-Time Traffic Monitor (ether1-WAN)
              </h4>
              <span className="text-[11px] font-mono text-slate-500">Live 1s interval</span>
            </div>
            <LiveTrafficChart rx={status?.traffic?.rx_mbps || 20} tx={status?.traffic?.tx_mbps || 45} />
          </div>
        </div>

        {/* Quick Operator Actions */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Quick Operations
            </h3>

            <button
              onClick={onGenBatch}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 text-indigo-200 transition-all text-left"
            >
              <div>
                <div className="font-bold text-xs">Generate Batch Vouchers</div>
                <div className="text-[11px] text-slate-400">Bulk create 10, 50, 100+ vouchers</div>
              </div>
              <Plus className="w-4 h-4 text-indigo-400" />
            </button>

            <button
              onClick={onQuickUser}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700/80 text-slate-200 transition-all text-left"
            >
              <div>
                <div className="font-bold text-xs">Create Single User</div>
                <div className="text-[11px] text-slate-400">Custom username & password</div>
              </div>
              <Users className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('sessions')}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700/80 text-slate-200 transition-all text-left"
            >
              <div>
                <div className="font-bold text-xs">Monitor Hotspot Sessions</div>
                <div className="text-[11px] text-slate-400">View active connected devices & kick</div>
              </div>
              <Wifi className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('terminal')}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700/80 text-slate-200 transition-all text-left"
            >
              <div>
                <div className="font-bold text-xs">RouterOS Script & CLI</div>
                <div className="text-[11px] text-slate-400">Export .rsc script or run terminal</div>
              </div>
              <Terminal className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Live Canvas Traffic Chart
function LiveTrafficChart({ rx, tx }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(prev => {
      const next = [...prev, { rx, tx, t: Date.now() }];
      if (next.length > 25) next.shift();
      return next;
    });
  }, [rx, tx]);

  const maxVal = Math.max(...history.map(d => Math.max(d.rx, d.tx)), 60);

  return (
    <div className="h-40 w-full relative flex items-end gap-1 pt-4">
      {history.map((pt, idx) => {
        const rxH = (pt.rx / maxVal) * 100;
        const txH = (pt.tx / maxVal) * 100;

        return (
          <div key={idx} className="flex-1 flex items-end justify-center gap-0.5 h-full group relative">
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 hidden group-hover:block bg-slate-800 border border-slate-700 text-[10px] text-slate-200 p-1.5 rounded shadow-lg z-20 whitespace-nowrap font-mono">
              <div>RX: {pt.rx} Mbps</div>
              <div>TX: {pt.tx} Mbps</div>
            </div>

            <div
              className="w-1.5 bg-emerald-500/80 rounded-t transition-all duration-300"
              style={{ height: `${rxH}%` }}
            ></div>
            <div
              className="w-1.5 bg-indigo-500/80 rounded-t transition-all duration-300"
              style={{ height: `${txH}%` }}
            ></div>
          </div>
        );
      })}
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. ROUTER MANAGER VIEW
// ----------------------------------------------------------------------
function RouterManagerView({ routers, selectedRouter, details, onAddRouter, onSelectRouter, onRefresh, showToast }) {
  const [activeTab, setActiveTab] = useState('interfaces');

  return (
    <div className="space-y-6">
      {/* Router Selection Bar & Add */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <Server className="w-6 h-6 text-indigo-400" />
          <div>
            <h3 className="font-bold text-slate-100 text-sm">{selectedRouter?.name}</h3>
            <p className="text-xs text-slate-400 font-mono">
              IP: {selectedRouter?.host}:{selectedRouter?.port} • REST SSL: {selectedRouter?.rest_port}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddRouter}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Router
          </button>
        </div>
      </div>

      {/* Router Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('interfaces')}
          className={`px-3 py-1.5 rounded-md transition-all ${activeTab === 'interfaces' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
        >
          Interfaces ({details?.interfaces?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('firewall')}
          className={`px-3 py-1.5 rounded-md transition-all ${activeTab === 'firewall' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
        >
          Firewall & NAT Rules
        </button>
        <button
          onClick={() => setActiveTab('queues')}
          className={`px-3 py-1.5 rounded-md transition-all ${activeTab === 'queues' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
        >
          Simple Queues (Bandwidth)
        </button>
        <button
          onClick={() => setActiveTab('dhcp')}
          className={`px-3 py-1.5 rounded-md transition-all ${activeTab === 'dhcp' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
        >
          DHCP Server Leases
        </button>
      </div>

      {/* Tab 1: Interfaces Table */}
      {activeTab === 'interfaces' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Interface Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">MAC Address</th>
                <th className="p-3">MTU</th>
                <th className="p-3">Real-time Traffic (RX / TX)</th>
                <th className="p-3">Comment</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {details?.interfaces?.map((iface, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="p-3 font-semibold text-slate-200">{iface.name}</td>
                  <td className="p-3 text-slate-400 uppercase">{iface.type}</td>
                  <td className="p-3 text-slate-400">{iface.mac}</td>
                  <td className="p-3 text-slate-400">{iface.mtu}</td>
                  <td className="p-3">
                    <span className="text-emerald-400 mr-3">↓ {(iface.rx_kbps / 1024).toFixed(1)} Mbps</span>
                    <span className="text-indigo-400">↑ {(iface.tx_kbps / 1024).toFixed(1)} Mbps</span>
                  </td>
                  <td className="p-3 text-slate-400 font-sans">{iface.comment}</td>
                  <td className="p-3 text-right font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      iface.running ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {iface.running ? 'Running' : 'Disabled'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Firewall Filters & NAT */}
      {activeTab === 'firewall' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h4 className="font-bold text-sm text-slate-200 mb-3">Firewall Filter Rules</h4>
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-2">Chain</th>
                  <th className="p-2">Action</th>
                  <th className="p-2">Condition</th>
                  <th className="p-2">Comment</th>
                  <th className="p-2 text-right">Packets / Bytes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {details?.firewall_filters?.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-800/40">
                    <td className="p-2 text-indigo-400 font-bold">{rule.chain}</td>
                    <td className="p-2">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        rule.action === 'accept' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {rule.action}
                      </span>
                    </td>
                    <td className="p-2 text-slate-300">{rule.connection_state || rule.protocol || 'all'}</td>
                    <td className="p-2 text-slate-400 font-sans">{rule.comment}</td>
                    <td className="p-2 text-right text-slate-400">{rule.packets} pkts ({Math.round(rule.bytes/1024)} KB)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h4 className="font-bold text-sm text-slate-200 mb-3">Firewall NAT Rules</h4>
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-2">Chain</th>
                  <th className="p-2">Action</th>
                  <th className="p-2">Out Interface</th>
                  <th className="p-2">Comment</th>
                  <th className="p-2 text-right">Bytes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {details?.firewall_nat?.map((nat) => (
                  <tr key={nat.id} className="hover:bg-slate-800/40">
                    <td className="p-2 text-blue-400 font-bold">{nat.chain}</td>
                    <td className="p-2 text-amber-400 font-bold">{nat.action}</td>
                    <td className="p-2 text-slate-300">{nat.out_interface || nat.in_interface || 'any'}</td>
                    <td className="p-2 text-slate-400 font-sans">{nat.comment}</td>
                    <td className="p-2 text-right text-slate-400">{(nat.bytes / 1048576).toFixed(1)} MB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Simple Queues */}
      {activeTab === 'queues' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-4">
          <h4 className="font-bold text-sm text-slate-200 mb-3">Simple Bandwidth Queues</h4>
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-2.5">Queue Name</th>
                <th className="p-2.5">Target IP</th>
                <th className="p-2.5">Max Limit (Upload/Download)</th>
                <th className="p-2.5">Burst Limit</th>
                <th className="p-2.5 text-right">Bytes Transferred</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {details?.queues?.map((q, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="p-2.5 font-bold text-indigo-300 font-sans">{q.name}</td>
                  <td className="p-2.5 text-slate-200">{q.target}</td>
                  <td className="p-2.5 text-emerald-400 font-bold">{q.max_limit}</td>
                  <td className="p-2.5 text-amber-400">{q.burst_limit}</td>
                  <td className="p-2.5 text-right text-slate-400">{q.bytes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: DHCP Leases */}
      {activeTab === 'dhcp' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-4">
          <h4 className="font-bold text-sm text-slate-200 mb-3">DHCP Server Active Leases</h4>
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-2.5">IP Address</th>
                <th className="p-2.5">MAC Address</th>
                <th className="p-2.5">Host Name</th>
                <th className="p-2.5">Lease Expiry</th>
                <th className="p-2.5">Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {details?.dhcp_leases?.map((l, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="p-2.5 font-bold text-slate-100">{l.address}</td>
                  <td className="p-2.5 text-slate-400">{l.mac}</td>
                  <td className="p-2.5 text-indigo-300 font-sans">{l.host_name}</td>
                  <td className="p-2.5 text-amber-400">{l.expires_after}</td>
                  <td className="p-2.5 text-slate-400 font-sans">{l.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. VOUCHER CONTROL VIEW
// ----------------------------------------------------------------------
function VoucherControlView({ vouchers, profiles, settings, onRefresh, onGenBatch, onQuickUser, onSell, onPrint, showToast }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [profileFilter, setProfileFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedVouchers, setSelectedVouchers] = useState([]);

  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => {
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;
      if (profileFilter !== 'all' && String(v.profile_id) !== String(profileFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        return v.code.toLowerCase().includes(q) || (v.comment && v.comment.toLowerCase().includes(q)) || (v.used_by_mac && v.used_by_mac.toLowerCase().includes(q));
      }
      return true;
    });
  }, [vouchers, statusFilter, profileFilter, search]);

  const toggleSelectAll = () => {
    if (selectedVouchers.length === filteredVouchers.length) {
      setSelectedVouchers([]);
    } else {
      setSelectedVouchers(filteredVouchers.map(v => v.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedVouchers(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = async (filterType) => {
    if (!confirm(`Are you sure you want to delete ${filterType} vouchers?`)) return;
    await fetch('./api/vouchers/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ filter: filterType })
    });
    showToast(`Batch deleted ${filterType} vouchers`);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, comment, MAC..."
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md pl-9 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md px-3 py-1.5 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active (Available)</option>
            <option value="used">Used / Online</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={profileFilter}
            onChange={(e) => setProfileFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md px-3 py-1.5 focus:outline-none"
          >
            <option value="all">All Tariffs</option>
            {profiles.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {selectedVouchers.length > 0 && (
            <>
              <button
                onClick={() => {
                  const selectedList = vouchers.filter(v => selectedVouchers.includes(v.id));
                  onPrint(selectedList, 'thermal');
                }}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow transition-all"
              >
                <Printer className="w-4 h-4" />
                Print ({selectedVouchers.length})
              </button>
              <button
                onClick={() => {
                  const selectedList = vouchers.filter(v => selectedVouchers.includes(v.id));
                  onPrint(selectedList, 'grid');
                }}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow transition-all"
              >
                <QrCode className="w-4 h-4" />
                A4 Cards ({selectedVouchers.length})
              </button>
            </>
          )}

          <button
            onClick={() => handleBatchDelete('used')}
            className="p-1.5 bg-slate-800 hover:bg-rose-950 hover:border-rose-700 text-slate-400 hover:text-rose-300 border border-slate-700 rounded-md text-xs transition-all"
            title="Clean Used Vouchers"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
          <div>Showing {filteredVouchers.length} of {vouchers.length} vouchers</div>
          {selectedVouchers.length > 0 && (
            <div className="text-indigo-400 font-bold">{selectedVouchers.length} items selected</div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedVouchers.length > 0 && selectedVouchers.length === filteredVouchers.length}
                    onChange={toggleSelectAll}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                </th>
                <th className="p-3">Voucher Code</th>
                <th className="p-3">Password</th>
                <th className="p-3">Tariff Profile</th>
                <th className="p-3">Price</th>
                <th className="p-3">Status</th>
                <th className="p-3">MAC / Connected IP</th>
                <th className="p-3">Batch / Comment</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredVouchers.map((v) => {
                const isSelected = selectedVouchers.includes(v.id);

                return (
                  <tr key={v.id} className={`hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-indigo-950/20' : ''}`}>
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(v.id)}
                        className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                      />
                    </td>
                    <td className="p-3 font-bold text-white tracking-wider">{v.code}</td>
                    <td className="p-3 text-slate-400">{v.password}</td>
                    <td className="p-3 text-indigo-300 font-sans font-medium">{v.profile_name || 'Standard'}</td>
                    <td className="p-3 text-emerald-400 font-bold">${v.price ? v.price.toFixed(2) : '0.00'}</td>
                    <td className="p-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        v.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        v.status === 'used' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' :
                        'bg-slate-800 text-slate-500'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      {v.used_by_mac ? `${v.used_by_mac}` : '—'}
                    </td>
                    <td className="p-3 text-slate-400 font-sans text-[11px]">{v.comment || v.batch_id}</td>
                    <td className="p-3 text-right font-sans">
                      <div className="flex items-center justify-end gap-1">
                        {v.status === 'active' && (
                          <button
                            onClick={() => onSell(v)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold transition-all shadow"
                          >
                            Sell
                          </button>
                        )}
                        <button
                          onClick={() => onPrint([v], 'thermal')}
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                          title="Print Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 4. PROFILES & TARIFFS VIEW
// ----------------------------------------------------------------------
function ProfilesView({ profiles, settings, onAddProfile, onRefresh, showToast }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-100 text-sm">Hotspot Bandwidth Tariffs & Packages</h3>
          <p className="text-xs text-slate-400">Configure speed limits, duration limits, data caps, and pricing</p>
        </div>
        <button
          onClick={onAddProfile}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Tariff Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {profiles.map((p) => (
          <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-slate-100 text-sm">{p.name}</h4>
                <p className="text-[11px] text-indigo-400 font-mono mt-0.5">{p.rate_limit}</p>
              </div>
              <span className="text-xl font-bold font-mono text-emerald-400">${p.price.toFixed(2)}</span>
            </div>

            <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
              <div className="flex justify-between text-slate-400">
                <span>Duration / Validity:</span>
                <span className="font-semibold text-slate-200">{p.validity_value} {p.validity_unit}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Data Cap:</span>
                <span className="font-semibold text-slate-200">{p.data_limit_mb ? `${p.data_limit_mb} MB` : 'Unlimited'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shared Devices:</span>
                <span className="font-semibold text-slate-200">{p.shared_users} Device(s)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Lock to MAC:</span>
                <span className="font-semibold text-slate-200">{p.lock_mac ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 5. ACTIVE SESSIONS VIEW
// ----------------------------------------------------------------------
function ActiveSessionsView({ sessions, onRefresh, showToast }) {
  const handleKick = async (id, user) => {
    if (!confirm(`Disconnect user ${user} from hotspot?`)) return;
    await fetch(`./api/sessions/${id}/kick`, { method: 'POST' });
    showToast(`User ${user} kicked from hotspot!`);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-100 text-sm">Live Hotspot Connected Devices</h3>
          <p className="text-xs text-slate-400">Real-time session monitor & kick active users</p>
        </div>
        <button
          onClick={onRefresh}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 text-xs flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-sans font-semibold">
            <tr>
              <th className="p-3">User / Voucher</th>
              <th className="p-3">Profile</th>
              <th className="p-3">IP Address</th>
              <th className="p-3">MAC Address</th>
              <th className="p-3">Device Name</th>
              <th className="p-3">Uptime</th>
              <th className="p-3">Data Used (In / Out)</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sessions.map((s) => (
              <tr key={s.id} className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white font-sans">{s.user}</td>
                <td className="p-3 text-indigo-300 font-sans">{s.profile}</td>
                <td className="p-3 text-slate-200">{s.ip}</td>
                <td className="p-3 text-slate-400">{s.mac}</td>
                <td className="p-3 text-slate-300 font-sans">{s.host_name}</td>
                <td className="p-3 text-amber-400">{s.uptime}</td>
                <td className="p-3 text-slate-300">
                  <span className="text-emerald-400 mr-2">↓ {s.bytes_in_mb} MB</span>
                  <span className="text-indigo-400">↑ {s.bytes_out_mb} MB</span>
                </td>
                <td className="p-3 text-right font-sans">
                  <button
                    onClick={() => handleKick(s.id, s.user)}
                    className="px-2 py-1 bg-rose-600/20 border border-rose-600/40 hover:bg-rose-600 text-rose-300 hover:text-white rounded text-[11px] font-bold transition-all"
                  >
                    Disconnect
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 6. SALES ANALYTICS VIEW
// ----------------------------------------------------------------------
function SalesAnalyticsView({ salesData, settings, showToast }) {
  const sales = salesData?.sales || [];
  const daily = salesData?.daily_stats || [];

  const maxRevenue = Math.max(...daily.map(d => d.revenue), 10);

  return (
    <div className="space-y-6">
      {/* Revenue Chart */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
        <h3 className="font-bold text-slate-100 text-sm">Last 7 Days Revenue Trend</h3>
        <div className="h-44 flex items-end gap-3 pt-6 border-b border-slate-800/80 pb-2">
          {daily.map((d, i) => {
            const pct = (d.revenue / maxRevenue) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-mono text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  ${d.revenue.toFixed(1)}
                </span>
                <div
                  className="w-full max-w-[36px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t transition-all duration-500"
                  style={{ height: `${Math.max(pct, 5)}%` }}
                ></div>
                <span className="text-[11px] font-mono text-slate-400 mt-1">{d.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sales Transactions Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 font-bold text-sm text-slate-200">
          Voucher Sales Log History
        </div>
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-sans">
            <tr>
              <th className="p-3">Voucher Code</th>
              <th className="p-3">Plan Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Seller / Cashier</th>
              <th className="p-3">Payment Method</th>
              <th className="p-3 text-right">Date & Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sales.map((s) => (
              <tr key={s.id} className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">{s.code}</td>
                <td className="p-3 text-indigo-300 font-sans">{s.profile_name}</td>
                <td className="p-3 text-emerald-400 font-bold">${s.price.toFixed(2)}</td>
                <td className="p-3 text-slate-300 font-sans">{s.seller}</td>
                <td className="p-3 text-slate-400 font-sans">{s.payment_method}</td>
                <td className="p-3 text-right text-slate-400">
                  {new Date(s.sold_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 7. CAPTIVE PORTAL STUDIO VIEW
// ----------------------------------------------------------------------
function PortalCustomizerView({ settings, onSaveSettings }) {
  const [title, setTitle] = useState(settings.hotspot_title || 'Connect to High-Speed Internet');
  const [businessName, setBusinessName] = useState(settings.business_name || 'NetZone Hotspot');
  const [contact, setContact] = useState(settings.contact_number || '+1 555-019-2831');
  const [previewDevice, setPreviewDevice] = useState('mobile');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Config Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-3">
          Hotspot Landing Page Designer
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Brand / Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Headline Welcome Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Support Contact Number</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={() => onSaveSettings({
              business_name: businessName,
              hotspot_title: title,
              contact_number: contact
            })}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold p-2.5 rounded shadow transition-all mt-4"
          >
            Save Portal Customization
          </button>
        </div>
      </div>

      {/* Live Phone / Desktop Interactive Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center min-h-[500px]">
        <div className="flex items-center gap-2 mb-4 text-xs">
          <button
            onClick={() => setPreviewDevice('mobile')}
            className={`px-3 py-1 rounded font-semibold transition-all ${previewDevice === 'mobile' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            <Smartphone className="w-4 h-4 inline mr-1" /> Mobile
          </button>
          <button
            onClick={() => setPreviewDevice('desktop')}
            className={`px-3 py-1 rounded font-semibold transition-all ${previewDevice === 'desktop' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            <Monitor className="w-4 h-4 inline mr-1" /> Desktop
          </button>
        </div>

        {/* Device Frame */}
        <div className={`bg-slate-950 border-4 border-slate-800 shadow-2xl rounded-3xl overflow-hidden transition-all ${
          previewDevice === 'mobile' ? 'w-[320px] h-[520px]' : 'w-[90%] h-[400px]'
        }`}>
          <div className="bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 h-full p-6 flex flex-col justify-between text-center">
            <div className="space-y-3 pt-4">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl mx-auto flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/30">
                <Wifi className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white leading-tight">{businessName}</h2>
              <p className="text-xs text-indigo-300">{title}</p>
            </div>

            {/* Voucher Login Form Box */}
            <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 space-y-3 shadow-xl backdrop-blur-sm">
              <input
                type="text"
                placeholder="Enter Voucher Code..."
                className="w-full bg-slate-950 border border-slate-800 text-center text-sm font-bold tracking-widest text-white rounded-xl py-2.5 focus:outline-none focus:border-indigo-500"
              />
              <button className="w-full bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-indigo-600/30">
                Connect to Wi-Fi
              </button>
            </div>

            <div className="text-[10px] text-slate-500 pb-2">
              Support: {contact} • Terms & Conditions apply
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 8. TERMINAL & SCRIPT GENERATOR VIEW
// ----------------------------------------------------------------------
function TerminalScriptView({ selectedRouter, showToast }) {
  const [terminalCmd, setTerminalCmd] = useState('');
  const [cliHistory, setCliHistory] = useState([
    { type: 'output', text: 'RouterOS CLI Simulation [v7.15.1]\nType "help" or "?" for list of available commands.' }
  ]);
  const [generatedScript, setGeneratedScript] = useState('');

  const handleRunCmd = async (e) => {
    e.preventDefault();
    if (!terminalCmd.trim()) return;

    const cmd = terminalCmd;
    setTerminalCmd('');
    setCliHistory(prev => [...prev, { type: 'input', text: `[admin@Core-Gateway] > ${cmd}` }]);

    const res = await fetch('./api/terminal/exec', {
      method: 'POST',
      body: JSON.stringify({ command: cmd })
    }).then(r => r.json());

    setCliHistory(prev => [...prev, { type: 'output', text: res.output }]);
  };

  const handleGenScript = async () => {
    const res = await fetch('./api/script/generate', {
      method: 'POST',
      body: JSON.stringify({})
    }).then(r => r.json());

    setGeneratedScript(res.script);
    showToast('RouterOS setup script generated!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Web CLI Terminal */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-[520px]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>RouterOS CLI Web Terminal</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Connected: {selectedRouter?.host || '192.168.88.1'}
          </span>
        </div>

        <div className="flex-1 bg-slate-950 rounded-lg p-3 font-mono text-xs overflow-y-auto space-y-2 border border-slate-800">
          {cliHistory.map((h, i) => (
            <div key={i} className={h.type === 'input' ? 'text-indigo-400 font-bold' : 'text-slate-300 whitespace-pre-wrap'}>
              {h.text}
            </div>
          ))}
        </div>

        <form onSubmit={handleRunCmd} className="mt-3 flex gap-2">
          <input
            type="text"
            value={terminalCmd}
            onChange={(e) => setTerminalCmd(e.target.value)}
            placeholder="Type command e.g. /system resource print..."
            className="flex-1 bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 rounded p-2 focus:outline-none focus:border-indigo-500"
          />
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 rounded">
            Run
          </button>
        </form>
      </div>

      {/* Script Generator */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-[520px]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <h3 className="font-bold text-slate-100 text-sm">RouterOS Auto-Script Generator (.rsc)</h3>
          <button
            onClick={handleGenScript}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded"
          >
            Generate .rsc
          </button>
        </div>

        <textarea
          readOnly
          value={generatedScript || '# Click "Generate .rsc" to create RouterOS setup script...'}
          className="flex-1 bg-slate-950 border border-slate-800 rounded p-3 font-mono text-[11px] text-emerald-400 focus:outline-none resize-none"
        />

        {generatedScript && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(generatedScript);
              showToast('Script copied to clipboard!');
            }}
            className="mt-3 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2 rounded border border-slate-700 flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" /> Copy Script
          </button>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 9. LOGS VIEW
// ----------------------------------------------------------------------
function LogsView({ logs, onRefresh }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-100 text-sm">Router System & Hotspot Event Logs</h3>
        <button onClick={onRefresh} className="p-1.5 bg-slate-800 text-slate-300 rounded text-xs border border-slate-700">
          <RefreshCw className="w-3.5 h-3.5 inline mr-1" /> Refresh
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Category</th>
              <th className="p-3">Level</th>
              <th className="p-3">Message Body</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-slate-800/40">
                <td className="p-3 text-slate-400">{new Date(l.timestamp).toLocaleTimeString()}</td>
                <td className="p-3 text-indigo-400 font-bold uppercase">{l.category}</td>
                <td className="p-3">
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    l.level === 'warning' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {l.level}
                  </span>
                </td>
                <td className="p-3 text-slate-200">{l.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 10. SETTINGS VIEW
// ----------------------------------------------------------------------
function SettingsView({ settings, onSave }) {
  const [form, setForm] = useState(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl space-y-4">
      <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-3">
        Business & Hotspot System Configuration
      </h3>

      <div className="space-y-3 text-xs">
        <div>
          <label className="block text-slate-400 font-medium mb-1">Business Name</label>
          <input
            type="text"
            value={form.business_name || ''}
            onChange={(e) => setForm({...form, business_name: e.target.value})}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Currency Symbol</label>
          <input
            type="text"
            value={form.currency || 'USD ($)'}
            onChange={(e) => setForm({...form, currency: e.target.value})}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Hotspot DNS Domain Name</label>
          <input
            type="text"
            value={form.dns_name || 'netzone.wifi'}
            onChange={(e) => setForm({...form, dns_name: e.target.value})}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Receipt Header Message</label>
          <input
            type="text"
            value={form.receipt_header || ''}
            onChange={(e) => setForm({...form, receipt_header: e.target.value})}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Receipt Footer Support Message</label>
          <input
            type="text"
            value={form.receipt_footer || ''}
            onChange={(e) => setForm({...form, receipt_footer: e.target.value})}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
          />
        </div>

        <button
          onClick={() => onSave(form)}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-2.5 rounded transition-all mt-4"
        >
          Save System Configuration
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// MODALS
// ----------------------------------------------------------------------

// Batch Generator Modal
function BatchVoucherModal({ profiles, onClose, onSuccess }) {
  const [profileId, setProfileId] = useState(profiles[0]?.id || 1);
  const [quantity, setQuantity] = useState(10);
  const [prefix, setPrefix] = useState('NET');
  const [codeLength, setCodeLength] = useState(6);
  const [charSet, setCharSet] = useState('uppercase');
  const [samePass, setSamePass] = useState(true);
  const [comment, setComment] = useState('Counter Batch');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('./api/vouchers/generate', {
      method: 'POST',
      body: JSON.stringify({
        profile_id: Number(profileId),
        quantity: Number(quantity),
        prefix,
        code_length: Number(codeLength),
        character_set: charSet,
        same_password: samePass,
        comment
      })
    });
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <Ticket className="w-5 h-5 text-indigo-400" />
            Batch Voucher Generator
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Select Tariff Profile</label>
            <select
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name} - ${p.price.toFixed(2)} ({p.rate_limit})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Quantity (pcs)</label>
              <input
                type="number"
                min="1"
                max="500"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Prefix</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Code Length</label>
              <input
                type="number"
                min="4"
                max="10"
                value={codeLength}
                onChange={(e) => setCodeLength(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Character Type</label>
              <select
                value={charSet}
                onChange={(e) => setCharSet(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
              >
                <option value="numbers">Numbers Only (12389)</option>
                <option value="uppercase">Uppercase Letters (ABC234)</option>
                <option value="mixed">Mixed Letters & Digits</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Batch Comment / Tag</label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-2.5 rounded-lg shadow-lg shadow-indigo-600/20 transition-all"
            >
              Generate {quantity} Vouchers
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Quick User Single Modal
function QuickUserModal({ profiles, onClose, onSuccess }) {
  const [profileId, setProfileId] = useState(profiles[0]?.id || 1);
  const [code, setCode] = useState('');
  const [pass, setPass] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('./api/vouchers/quick-create', {
      method: 'POST',
      body: JSON.stringify({
        profile_id: Number(profileId),
        code,
        password: pass,
        comment
      })
    });
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Add Single User / Voucher
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Username / Voucher Code</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. VIP-GUEST1"
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Password (Optional)</label>
            <input
              type="text"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Leave blank to match username"
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Tariff Profile</label>
            <select
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name} (${p.price.toFixed(2)})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Comment</label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Customer details..."
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-2.5 rounded-lg shadow-lg transition-all"
            >
              Create User / Voucher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Sell Voucher Modal
function SellVoucherModal({ voucher, settings, onClose, onSuccess }) {
  const [seller, setSeller] = useState('Front Desk Counter');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('./api/vouchers/sell', {
      method: 'POST',
      body: JSON.stringify({
        voucher_id: voucher.id,
        seller,
        payment_method: paymentMethod
      })
    });
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            Sell & Activate Voucher
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center space-y-1">
          <div className="text-xs text-slate-400">Voucher Code</div>
          <div className="text-xl font-bold font-mono text-indigo-400 tracking-wider">{voucher.code}</div>
          <div className="text-xs text-emerald-400 font-bold">${voucher.price ? voucher.price.toFixed(2) : '0.00'}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Cashier / Seller</label>
            <input
              type="text"
              value={seller}
              onChange={(e) => setSeller(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
            >
              <option value="Cash">Cash</option>
              <option value="M-Pesa / Mobile Money">M-Pesa / Mobile Money</option>
              <option value="Credit Card">Credit Card</option>
              <option value="QR Code Pay">QR Code Pay</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2.5 rounded-lg shadow-lg transition-all"
            >
              Confirm Sale & Activate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add Router Modal
function AddRouterModal({ onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [host, setHost] = useState('');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('./api/routers', {
      method: 'POST',
      body: JSON.stringify({ name, host, username, password })
    });
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-400" />
            Add MikroTik Router
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Router Display Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Branch Office hAP ac3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Host IP Address</label>
            <input
              type="text"
              required
              placeholder="e.g. 192.168.88.1"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">API Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">API Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-2.5 rounded-lg shadow-lg transition-all"
            >
              Add Router
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add Tariff Profile Modal
function AddProfileModal({ routerId, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [rateLimit, setRateLimit] = useState('10M/3M');
  const [validityVal, setValidityVal] = useState(1);
  const [validityUnit, setValidityUnit] = useState('days');
  const [price, setPrice] = useState(2.00);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('./api/profiles', {
      method: 'POST',
      body: JSON.stringify({
        router_id: routerId,
        name,
        rate_limit: rateLimit,
        validity_value: Number(validityVal),
        validity_unit: validityUnit,
        price: Number(price)
      })
    });
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            Create Bandwidth Tariff Plan
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Plan Name</label>
            <input
              type="text"
              required
              placeholder="e.g. 24 Hours Ultra Pass"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Rate Limit (Rx/Tx)</label>
              <input
                type="text"
                required
                placeholder="10M/3M"
                value={rateLimit}
                onChange={(e) => setRateLimit(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Validity Duration</label>
              <input
                type="number"
                min="1"
                value={validityVal}
                onChange={(e) => setValidityVal(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Unit</label>
              <select
                value={validityUnit}
                onChange={(e) => setValidityUnit(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none"
              >
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-2.5 rounded-lg shadow-lg transition-all"
            >
              Save Tariff Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Print Thermal & Grid Modal
function PrintModal({ items, mode, settings, onClose }) {
  const dnsName = settings.dns_name || 'netzone.wifi';
  const bizName = settings.business_name || 'NetZone Wi-Fi';

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex flex-col items-center justify-start p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl p-6 space-y-4 shadow-2xl no-print">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-400" />
            Print Voucher Cards ({items.length} items) - {mode === 'thermal' ? '58/80mm Thermal Receipt' : 'A4 Grid Cards'}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded shadow flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Trigger System Print
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      {/* Printable Area */}
      <div className="printable-area w-full max-w-4xl bg-white text-black p-6 rounded-lg my-4">
        {mode === 'thermal' ? (
          // Thermal Receipts Layout
          <div className="flex flex-col items-center gap-6">
            {items.map((item) => (
              <div key={item.id} className="w-[280px] border-2 border-dashed border-black p-4 text-center font-mono space-y-2 text-black bg-white">
                <div className="font-bold text-sm uppercase">{bizName}</div>
                <div className="text-[10px]">Connect Wi-Fi: {dnsName}</div>
                <div className="border-t border-b border-black py-2 my-2">
                  <div className="text-[10px] uppercase font-bold text-gray-700">Voucher Code</div>
                  <div className="text-xl font-bold tracking-widest my-1">{item.code}</div>
                  <div className="text-[10px]">Password: <span className="font-bold">{item.password}</span></div>
                </div>
                <div className="text-xs font-bold">Speed: {item.profile_rate_limit || item.rate_limit || '10Mbps'}</div>
                <div className="text-xs font-bold">Price: ${item.price ? item.price.toFixed(2) : '0.00'}</div>
                <div className="text-[9px] text-gray-600 pt-1">{settings.receipt_footer || 'Enjoy high speed internet!'}</div>
              </div>
            ))}
          </div>
        ) : (
          // A4 Grid Cards Layout
          <div className="grid grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="border border-black p-3 text-center font-mono rounded bg-white text-black space-y-1">
                <div className="font-bold text-xs uppercase">{bizName}</div>
                <div className="text-[9px]">SSID / Portal: {dnsName}</div>
                <div className="bg-gray-100 p-2 rounded my-1 border border-gray-300">
                  <div className="text-base font-bold tracking-wider">{item.code}</div>
                  <div className="text-[10px]">Pass: {item.password}</div>
                </div>
                <div className="text-[10px] font-bold">${item.price ? item.price.toFixed(2) : '0.00'} • {item.validity}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
