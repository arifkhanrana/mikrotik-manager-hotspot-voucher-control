import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Server, Router, Wifi, Ticket, Users, DollarSign, Activity,
  Settings, Terminal, Shield, List, Plus, RefreshCw, Trash2,
  Printer, QrCode, Search, Download, CheckCircle, AlertTriangle,
  XCircle, Zap, Cpu, HardDrive, Globe, Eye, Copy, Lock, Unlock,
  CreditCard, FileText, ChevronRight, BarChart2, Radio, Play, Sliders,
  HelpCircle, ExternalLink, ArrowUpRight, ArrowDownLeft, Power, Sparkles,
  Filter, Check, X, LayoutDashboard, ChevronDown, Monitor, Smartphone,
  UserPlus, UserCheck, Wallet, Key, Phone, Mail, Info, Clock, Edit3,
  AlertCircle, ArrowRight, CheckSquare, Layers, LogIn, LogOut, ShieldCheck
} from 'lucide-react';

function App() {
  const [activeView, setActiveView] = useState('admin'); // 'admin' or 'portal'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [statusData, setStatusData] = useState(null);
  const [routers, setRouters] = useState([]);
  const [selectedRouter, setSelectedRouter] = useState(null);
  const [routerDetails, setRouterDetails] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sales, setSales] = useState({ sales: [], daily_stats: [] });
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modals state
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showQuickUserModal, setShowQuickUserModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showTopupAccountModal, setShowTopupAccountModal] = useState(false);
  const [selectedAccountForTopup, setSelectedAccountForTopup] = useState(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedVoucherForSell, setSelectedVoucherForSell] = useState(null);
  const [showRouterModal, setShowRouterModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printItems, setPrintItems] = useState([]);
  const [printMode, setPrintMode] = useState('thermal');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Check URL hash / query parameter
  useEffect(() => {
    if (window.location.hash === '#portal' || window.location.search.includes('mode=portal')) {
      setActiveView('portal');
    }
  }, []);

  // Fetch all initial data
  const loadData = async () => {
    try {
      const [statusRes, routerRes, profileRes, settingsRes, accountRes] = await Promise.all([
        fetch('./api/status').then(r => r.json()),
        fetch('./api/routers').then(r => r.json()),
        fetch('./api/profiles').then(r => r.json()),
        fetch('./api/settings').then(r => r.json()),
        fetch('./api/accounts').then(r => r.json())
      ]);

      setStatusData(statusRes);
      setRouters(routerRes);
      setProfiles(profileRes);
      setSettings(settingsRes);
      setAccounts(accountRes);

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
    } else if (activeTab === 'accounts') {
      fetch('./api/accounts').then(r => r.json()).then(setAccounts);
    } else if (activeTab === 'sessions') {
      fetch('./api/sessions').then(r => r.json()).then(data => setSessions(data.sessions || []));
    } else if (activeTab === 'sales') {
      fetch('./api/sales').then(r => r.json()).then(setSales);
    } else if (activeTab === 'logs') {
      fetch('./api/logs').then(r => r.json()).then(setLogs);
    }
  }, [activeTab]);

  // If customer landing portal view is selected
  if (activeView === 'portal') {
    return (
      <HotspotLandingPage
        settings={settings}
        profiles={profiles}
        onSwitchAdmin={() => setActiveView('admin')}
        showToast={showToast}
        loadData={loadData}
      />
    );
  }

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

        {/* Customer Portal Shortcut Button */}
        <div className="p-3 border-b border-slate-800 bg-indigo-950/30">
          <button
            onClick={() => setActiveView('portal')}
            className="w-full flex items-center justify-between bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 rounded-md px-3 py-2 text-xs font-semibold transition-all"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>Customer Portal & Login</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
          </button>
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

          <NavItem id="vouchers" label="Vouchers & Codes" icon={Ticket} badge={statusData?.vouchers?.active} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="accounts" label="User Accounts" icon={Users} badge={accounts.length} activeTab={activeTab} setActiveTab={setActiveTab} />
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
              {activeTab === 'accounts' && 'Hotspot Member Accounts & Self-Registration'}
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
              onClick={() => setShowAddAccountModal(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
            >
              <UserPlus className="w-4 h-4 text-indigo-400" />
              <span>Create Account</span>
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
              onAddAccount={() => setShowAddAccountModal(true)}
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

          {activeTab === 'accounts' && (
            <UserAccountsView
              accounts={accounts}
              profiles={profiles}
              settings={settings}
              onAddAccount={() => setShowAddAccountModal(true)}
              onTopupAccount={(acc) => {
                setSelectedAccountForTopup(acc);
                setShowTopupAccountModal(true);
              }}
              onRefresh={() => fetch('./api/accounts').then(r => r.json()).then(setAccounts)}
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
              onOpenPortal={() => setActiveView('portal')}
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
          onSuccess={() => {
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

      {/* Add Account Modal */}
      {showAddAccountModal && (
        <AddAccountModal
          profiles={profiles}
          onClose={() => setShowAddAccountModal(false)}
          onSuccess={() => {
            setShowAddAccountModal(false);
            showToast('Hotspot Member Account Created!');
            fetch('./api/accounts').then(r => r.json()).then(setAccounts);
            if (activeTab !== 'accounts') setActiveTab('accounts');
          }}
        />
      )}

      {/* Topup Account Modal */}
      {showTopupAccountModal && selectedAccountForTopup && (
        <TopupAccountModal
          account={selectedAccountForTopup}
          vouchers={vouchers}
          onClose={() => setShowTopupAccountModal(false)}
          onSuccess={(msg) => {
            setShowTopupAccountModal(false);
            showToast(msg || 'Account refilled!');
            fetch('./api/accounts').then(r => r.json()).then(setAccounts);
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
// HOTSPOT LANDING PAGE & CAPTIVE PORTAL LOGIN VIEW
// ----------------------------------------------------------------------
function HotspotLandingPage({ settings, profiles, onSwitchAdmin, showToast, loadData }) {
  const [portalTab, setPortalTab] = useState('voucher'); // 'voucher', 'account', 'register', 'trial', 'status'
  const [activeSession, setActiveSession] = useState(null);

  // Form states
  const [voucherCode, setVoucherCode] = useState('');
  const [memberUser, setMemberUser] = useState('');
  const [memberPass, setMemberPass] = useState('');

  // Register Form
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regProfileId, setRegProfileId] = useState(profiles[0]?.id || 2);

  // Status Checker
  const [checkCode, setCheckCode] = useState('');
  const [checkResult, setCheckResult] = useState(null);

  // Topup Form in Session
  const [topupVoucher, setTopupVoucher] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const businessName = settings.business_name || 'NetZone High-Speed WiFi';
  const hotspotTitle = settings.hotspot_title || 'Connect to High-Speed Internet';
  const contactPhone = settings.contact_number || '+1 (555) 019-2831';
  const currency = '$';

  // Handle Login (Voucher, Account, Guest Trial)
  const handlePortalLogin = async (e, mode) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('./api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          code: voucherCode,
          username: memberUser,
          password: memberPass
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Login failed. Please check details.');
      } else {
        setActiveSession(data);
        showToast(data.message || 'Access Granted!');
        if (loadData) loadData();
      }
    } catch (err) {
      setErrorMsg('Network error connecting to gateway.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Self Account Registration
  const handleRegisterAccount = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('./api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUser,
          password: regPass,
          full_name: regFullName,
          email_phone: regPhone,
          profile_id: Number(regProfileId) || 2
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to create account.');
      } else {
        showToast('Account created successfully! Logging in...');
        // Auto Login
        setMemberUser(regUser);
        setMemberPass(regPass);
        setPortalTab('account');
        // Trigger account login
        setTimeout(() => {
          fetch('./api/portal/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mode: 'account',
              username: regUser,
              password: regPass
            })
          }).then(r => r.json()).then(sess => {
            if (sess.success) setActiveSession(sess);
          });
        }, 500);
      }
    } catch (err) {
      setErrorMsg('Error creating account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Status Lookup
  const handleCheckStatus = async (e) => {
    e.preventDefault();
    if (!checkCode) return;
    setLoading(true);
    setCheckResult(null);
    setErrorMsg('');

    try {
      const res = await fetch(`./api/portal/status?code=${encodeURIComponent(checkCode)}`);
      const data = await res.json();
      if (res.ok && data.found) {
        setCheckResult(data);
      } else {
        setErrorMsg(data.message || 'No voucher or account found for code');
      }
    } catch (err) {
      setErrorMsg('Status lookup error.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Account Topup
  const handleAccountTopup = async (e) => {
    e.preventDefault();
    if (!topupVoucher || !activeSession?.username) return;
    setLoading(true);

    try {
      const res = await fetch('./api/accounts/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: activeSession.username,
          voucher_code: topupVoucher
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Refill failed', 'error');
      } else {
        showToast(data.message || 'Refilled successfully!');
        setActiveSession({
          ...activeSession,
          balance: data.new_balance,
          expires_at: data.new_expires_at
        });
        setTopupVoucher('');
      }
    } catch (err) {
      showToast('Topup connection error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20">
            <Wifi className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-wide">{businessName}</h1>
            <p className="text-xs text-indigo-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              {hotspotTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${contactPhone}`}
            className="hidden sm:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold"
          >
            <Phone className="w-3.5 h-3.5 text-indigo-400" />
            <span>Support: {contactPhone}</span>
          </a>
          <button
            onClick={onSwitchAdmin}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
          >
            <Shield className="w-4 h-4" />
            <span>Admin Console</span>
          </button>
        </div>
      </header>

      {/* Main Landing Page Hero & Portal */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Active Connected Banner if Logged In */}
        {activeSession ? (
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  <span>Internet Access Connected & Active</span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {activeSession.full_name ? `Welcome, ${activeSession.full_name}` : `Session ID: ${activeSession.code || activeSession.username}`}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-mono">
                  <span className="flex items-center gap-1 text-indigo-300">
                    <Zap className="w-3.5 h-3.5" /> Plan: {activeSession.profile_name} ({activeSession.rate_limit})
                  </span>
                  <span>IP: {activeSession.ip}</span>
                  <span>MAC: {activeSession.mac}</span>
                  {activeSession.balance !== undefined && (
                    <span className="text-emerald-400 font-bold">Balance: {currency}{activeSession.balance.toFixed(2)}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => setActiveSession(null)}
                  className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect Session</span>
                </button>
              </div>
            </div>

            {/* Member Refill / Topup Option */}
            {activeSession.user_type === 'account' && (
              <div className="mt-6 pt-6 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  Redeem Voucher Code to Account
                </h4>
                <form onSubmit={handleAccountTopup} className="flex flex-col sm:flex-row gap-2 max-w-md">
                  <input
                    type="text"
                    value={topupVoucher}
                    onChange={(e) => setTopupVoucher(e.target.value.toUpperCase())}
                    placeholder="Enter Voucher Code (e.g. NET-8921)"
                    className="flex-1 bg-slate-900 border border-slate-700 text-white font-mono text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={loading || !topupVoucher}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    Redeem Code
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* Hero Section & Hotspot Authenticator Card */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Hero Left Intro */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                <Wifi className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span>MikroTik Powered Gigabit WiFi Zone</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Fast, Secure & Unlimited <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-rose-400 to-amber-300">WiFi Hotspot</span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Connect your phone, laptop, or tablet in seconds. Purchase instant voucher codes or create a member account to manage your time and data passes.
              </p>

              {/* Network Feature Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
                  <Zap className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div>
                    <div className="font-bold text-xs text-white">Up to 25 Mbps</div>
                    <div className="text-[11px] text-slate-400">High-speed fiber</div>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-xs text-white">Encrypted WiFi</div>
                    <div className="text-[11px] text-slate-400">WPA2 / Captive</div>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-bold text-xs text-white">24/7 Availability</div>
                    <div className="text-[11px] text-slate-400">Instant connection</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Interactive Portal Login & Account Creation Form Card */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <LogIn className="w-5 h-5 text-indigo-400" />
                  Hotspot Gateway Login
                </h3>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Online
                </span>
              </div>

              {/* Portal Mode Tabs */}
              <div className="grid grid-cols-5 gap-1 bg-slate-950 p-1 rounded-xl text-center text-xs font-semibold">
                <button
                  onClick={() => { setPortalTab('voucher'); setErrorMsg(''); }}
                  className={`py-2 rounded-lg transition-all ${portalTab === 'voucher' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  Voucher
                </button>
                <button
                  onClick={() => { setPortalTab('account'); setErrorMsg(''); }}
                  className={`py-2 rounded-lg transition-all ${portalTab === 'account' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  Member
                </button>
                <button
                  onClick={() => { setPortalTab('register'); setErrorMsg(''); }}
                  className={`py-2 rounded-lg transition-all ${portalTab === 'register' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  Register
                </button>
                <button
                  onClick={() => { setPortalTab('trial'); setErrorMsg(''); }}
                  className={`py-2 rounded-lg transition-all ${portalTab === 'trial' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  Free Pass
                </button>
                <button
                  onClick={() => { setPortalTab('status'); setErrorMsg(''); }}
                  className={`py-2 rounded-lg transition-all ${portalTab === 'status' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  Check
                </button>
              </div>

              {/* Error Box */}
              {errorMsg && (
                <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-200 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* TAB 1: VOUCHER CODE LOGIN */}
              {portalTab === 'voucher' && (
                <form onSubmit={(e) => handlePortalLogin(e, 'voucher')} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">Voucher Code</label>
                    <div className="relative">
                      <Ticket className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        placeholder="e.g. NET-8921"
                        className="w-full bg-slate-950 border border-slate-700 text-white font-mono font-bold text-base rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">Enter the voucher code printed on your receipt or card.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !voucherCode}
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
                    <span>Connect to Hotspot</span>
                  </button>
                </form>
              )}

              {/* TAB 2: MEMBER ACCOUNT LOGIN */}
              {portalTab === 'account' && (
                <form onSubmit={(e) => handlePortalLogin(e, 'account')} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">Member Username</label>
                    <div className="relative">
                      <Users className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={memberUser}
                        onChange={(e) => setMemberUser(e.target.value.toLowerCase())}
                        placeholder="john_doe"
                        className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-sm rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={memberPass}
                        onChange={(e) => setMemberPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !memberUser || !memberPass}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                    <span>Member Sign In</span>
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setPortalTab('register')}
                      className="text-xs text-indigo-400 hover:underline font-medium"
                    >
                      Don't have an account? Register here
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: CREATE HOTSPOT MEMBER ACCOUNT */}
              {portalTab === 'register' && (
                <form onSubmit={handleRegisterAccount} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">Full Name</label>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300 block">Phone / Email</label>
                      <input
                        type="text"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+1 555-0192"
                        className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300 block">Username</label>
                      <input
                        type="text"
                        required
                        value={regUser}
                        onChange={(e) => setRegUser(e.target.value.toLowerCase())}
                        placeholder="alex_hotspot"
                        className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300 block">Password</label>
                      <input
                        type="password"
                        required
                        value={regPass}
                        onChange={(e) => setRegPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300 block">Initial Plan</label>
                      <select
                        value={regProfileId}
                        onChange={(e) => setRegProfileId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-indigo-500 font-medium"
                      >
                        {profiles.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({currency}{p.price})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !regUser || !regPass || !regFullName}
                    className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 mt-1"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    <span>Create Member Account</span>
                  </button>
                </form>
              )}

              {/* TAB 4: FREE 15-MIN TRIAL PASS */}
              {portalTab === 'trial' && (
                <div className="space-y-4 text-center py-2">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">15 Minutes Free Guest Trial</h4>
                    <p className="text-xs text-slate-400 mt-1">Get immediate free internet access to test connection speed.</p>
                  </div>
                  <button
                    onClick={(e) => handlePortalLogin(e, 'guest')}
                    disabled={loading}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    <span>Activate Free Trial Now</span>
                  </button>
                </div>
              )}

              {/* TAB 5: PASS STATUS CHECKER */}
              {portalTab === 'status' && (
                <div className="space-y-4">
                  <form onSubmit={handleCheckStatus} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300 block">Voucher Code or Username</label>
                      <input
                        type="text"
                        value={checkCode}
                        onChange={(e) => setCheckCode(e.target.value)}
                        placeholder="NET-8921 or john_doe"
                        className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !checkCode}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <Search className="w-4 h-4 text-indigo-400" />
                      <span>Check Pass Status</span>
                    </button>
                  </form>

                  {checkResult && (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-white">{checkResult.code || checkResult.username}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                          checkResult.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {checkResult.status}
                        </span>
                      </div>
                      <div className="text-slate-400 flex justify-between">
                        <span>Profile:</span>
                        <span className="text-slate-200 font-medium">{checkResult.profile_name} ({checkResult.rate_limit})</span>
                      </div>
                      {checkResult.expires_at > 0 && (
                        <div className="text-slate-400 flex justify-between">
                          <span>Expires:</span>
                          <span className="text-amber-400 font-mono">{new Date(checkResult.expires_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hotspot Tariff Plans Showcase */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-lg text-white">Available WiFi Tariff Passes</h3>
              <p className="text-xs text-slate-400">Choose a pass tailored for your speed and time requirements.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {profiles.map(p => (
              <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black font-mono text-white">{currency}{p.price.toFixed(2)}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                      {p.rate_limit}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-100">{p.name}</h4>
                  <p className="text-xs text-slate-400">
                    Valid for {p.validity_value} {p.validity_unit}. High speed unthrottled access.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Shared Devices:</span>
                    <span className="font-mono">{p.shared_users} Device{p.shared_users > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Data Limit:</span>
                    <span className="font-mono">{p.data_limit_mb ? `${(p.data_limit_mb / 1024).toFixed(1)} GB` : 'Unlimited'}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setPortalTab('voucher');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700 hover:border-indigo-500 font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1 mt-2"
                >
                  <span>Select Pass</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Landing Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 px-6 text-center text-xs text-slate-500 mt-auto">
        <p>© {new Date().getFullYear()} {businessName}. Powered by MikroTik RouterOS & Cloudflare Durable Objects.</p>
      </footer>
    </div>
  );
}

// ----------------------------------------------------------------------
// 1. DASHBOARD VIEW
// ----------------------------------------------------------------------
function DashboardView({ status, router, details, onNavigate, onGenBatch, onQuickUser, onAddAccount }) {
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
              onClick={onAddAccount}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700/80 text-slate-200 transition-all text-left"
            >
              <div>
                <div className="font-bold text-xs">Register Member Account</div>
                <div className="text-[11px] text-slate-400">Create new user login account</div>
              </div>
              <UserPlus className="w-4 h-4 text-indigo-400" />
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
  const [activeSubTab, setActiveSubTab] = useState('interfaces'); // 'interfaces', 'firewall', 'queues', 'dhcp'

  return (
    <div className="space-y-6">
      {/* Routers Grid Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Managed MikroTik Gateways</h3>
          <p className="text-xs text-slate-400">Manage connected routers, API ports, and hardware parameters.</p>
        </div>
        <button
          onClick={onAddRouter}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Router Gateway</span>
        </button>
      </div>

      {/* Routers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routers.map(r => {
          const isSelected = selectedRouter?.id === r.id;
          return (
            <div
              key={r.id}
              onClick={() => onSelectRouter(r)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Server className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span className="font-bold text-xs text-white">{r.name}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {r.status}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-400 font-mono">
                <div>Host: <span className="text-slate-200">{r.host}:{r.port}</span></div>
                <div>Model: <span className="text-slate-200">{r.model}</span></div>
                <div>ROS: <span className="text-slate-200">v{r.ros_version}</span></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Router Details Section */}
      {selectedRouter && details && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-indigo-400" />
              <h4 className="font-bold text-sm text-white">{selectedRouter.name} - Deep Telemetry</h4>
            </div>

            {/* Sub-Tabs */}
            <div className="flex bg-slate-950 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveSubTab('interfaces')}
                className={`px-3 py-1 rounded-md transition-all ${activeSubTab === 'interfaces' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Interfaces
              </button>
              <button
                onClick={() => setActiveSubTab('firewall')}
                className={`px-3 py-1 rounded-md transition-all ${activeSubTab === 'firewall' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Firewall
              </button>
              <button
                onClick={() => setActiveSubTab('queues')}
                className={`px-3 py-1 rounded-md transition-all ${activeSubTab === 'queues' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Simple Queues
              </button>
              <button
                onClick={() => setActiveSubTab('dhcp')}
                className={`px-3 py-1 rounded-md transition-all ${activeSubTab === 'dhcp' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                DHCP Leases
              </button>
            </div>
          </div>

          {/* SubTab 1: Interfaces */}
          {activeSubTab === 'interfaces' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">MAC Address</th>
                    <th className="p-2.5">MTU</th>
                    <th className="p-2.5">RX Speed</th>
                    <th className="p-2.5">TX Speed</th>
                    <th className="p-2.5">Comment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {details.interfaces.map((iface, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-slate-200 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${iface.running ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
                        {iface.name}
                      </td>
                      <td className="p-2.5 text-indigo-400">{iface.type}</td>
                      <td className="p-2.5 text-slate-400">{iface.mac}</td>
                      <td className="p-2.5 text-slate-400">{iface.mtu}</td>
                      <td className="p-2.5 text-emerald-400 font-semibold">{(iface.rx_kbps / 1000).toFixed(1)} Mbps</td>
                      <td className="p-2.5 text-indigo-400 font-semibold">{(iface.tx_kbps / 1000).toFixed(1)} Mbps</td>
                      <td className="p-2.5 text-slate-400 italic">{iface.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SubTab 2: Firewall Filters & NAT */}
          {activeSubTab === 'firewall' && (
            <div className="space-y-4">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Firewall Filter Rules</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2">Chain</th>
                      <th className="p-2">Action</th>
                      <th className="p-2">State / Match</th>
                      <th className="p-2">Bytes</th>
                      <th className="p-2">Comment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {details.firewall_filters.map((f, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="p-2 text-indigo-400">{f.chain}</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            f.action === 'accept' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {f.action}
                          </span>
                        </td>
                        <td className="p-2 text-slate-300">{f.connection_state || f.protocol || '-'}</td>
                        <td className="p-2 text-slate-400">{(f.bytes / 1024).toFixed(0)} KB</td>
                        <td className="p-2 text-slate-400 italic">{f.comment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SubTab 3: Queues */}
          {activeSubTab === 'queues' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Target IP</th>
                    <th className="p-2.5">Max Limit</th>
                    <th className="p-2.5">Burst Limit</th>
                    <th className="p-2.5">Total Bytes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {details.queues.map((q, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-slate-200">{q.name}</td>
                      <td className="p-2.5 text-indigo-400">{q.target}</td>
                      <td className="p-2.5 text-emerald-400">{q.max_limit}</td>
                      <td className="p-2.5 text-amber-400">{q.burst_limit}</td>
                      <td className="p-2.5 text-slate-400">{q.bytes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SubTab 4: DHCP Leases */}
          {activeSubTab === 'dhcp' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">IP Address</th>
                    <th className="p-2.5">MAC Address</th>
                    <th className="p-2.5">Host Name</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Expires After</th>
                    <th className="p-2.5">Comment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {details.dhcp_leases.map((l, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-emerald-400">{l.address}</td>
                      <td className="p-2.5 text-slate-300">{l.mac}</td>
                      <td className="p-2.5 text-indigo-300">{l.host_name}</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-500/20 text-indigo-300">
                          {l.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-400">{l.expires_after}</td>
                      <td className="p-2.5 text-slate-400 italic">{l.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

  const currency = '$';

  const filteredVouchers = vouchers.filter(v => {
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    if (profileFilter !== 'all' && String(v.profile_id) !== profileFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        v.code.toLowerCase().includes(q) ||
        (v.comment && v.comment.toLowerCase().includes(q)) ||
        (v.used_by_mac && v.used_by_mac.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const toggleSelectVoucher = (id) => {
    if (selectedVouchers.includes(id)) {
      setSelectedVouchers(selectedVouchers.filter(item => item !== id));
    } else {
      setSelectedVouchers([...selectedVouchers, id]);
    }
  };

  const selectAll = () => {
    if (selectedVouchers.length === filteredVouchers.length) {
      setSelectedVouchers([]);
    } else {
      setSelectedVouchers(filteredVouchers.map(v => v.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedVouchers.length} vouchers?`)) return;
    for (const id of selectedVouchers) {
      await fetch(`./api/vouchers/${id}`, { method: 'DELETE' });
    }
    showToast(`${selectedVouchers.length} vouchers deleted`);
    setSelectedVouchers([]);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, comment..."
              className="bg-slate-950 border border-slate-800 text-xs rounded-lg pl-9 pr-3 py-1.5 text-white focus:outline-none focus:border-indigo-500 w-48"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active (Unused)</option>
            <option value="used">Used / Active Session</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={profileFilter}
            onChange={(e) => setProfileFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
          >
            <option value="all">All Profiles / Tariffs</option>
            {profiles.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {selectedVouchers.length > 0 && (
            <>
              <button
                onClick={() => {
                  const items = vouchers.filter(v => selectedVouchers.includes(v.id));
                  onPrint(items, 'thermal');
                }}
                className="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Thermal ({selectedVouchers.length})</span>
              </button>

              <button
                onClick={() => {
                  const items = vouchers.filter(v => selectedVouchers.includes(v.id));
                  onPrint(items, 'grid');
                }}
                className="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Grid Sheet ({selectedVouchers.length})</span>
              </button>

              <button
                onClick={handleDeleteSelected}
                className="bg-rose-600/20 text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </>
          )}

          <button
            onClick={onGenBatch}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Batch</span>
          </button>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedVouchers.length === filteredVouchers.length && filteredVouchers.length > 0}
                    onChange={selectAll}
                    className="rounded bg-slate-800 border-slate-700"
                  />
                </th>
                <th className="p-3">Voucher Code</th>
                <th className="p-3">Password</th>
                <th className="p-3">Tariff Plan</th>
                <th className="p-3">Price</th>
                <th className="p-3">Status</th>
                <th className="p-3">MAC / IP</th>
                <th className="p-3">Comment</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-500">
                    No vouchers match current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map(v => {
                  const isChecked = selectedVouchers.includes(v.id);
                  return (
                    <tr key={v.id} className="hover:bg-slate-800/40 transition-all">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectVoucher(v.id)}
                          className="rounded bg-slate-800 border-slate-700"
                        />
                      </td>
                      <td className="p-3 font-bold text-white tracking-wide">{v.code}</td>
                      <td className="p-3 text-slate-400">{v.password}</td>
                      <td className="p-3 text-indigo-400 font-sans font-medium">{v.profile_name || 'Pass'}</td>
                      <td className="p-3 text-emerald-400 font-bold">{currency}{v.price.toFixed(2)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          v.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          v.status === 'used' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                          'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{v.used_by_mac || '-'}</td>
                      <td className="p-3 text-slate-400 font-sans italic max-w-xs truncate">{v.comment}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {v.status === 'active' && (
                            <button
                              onClick={() => onSell(v)}
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] font-sans"
                            >
                              Sell
                            </button>
                          )}
                          <button
                            onClick={() => onPrint([v], 'thermal')}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title="Print Voucher"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 4. MEMBER ACCOUNTS VIEW (CREATE ACCOUNTS SECTION)
// ----------------------------------------------------------------------
function UserAccountsView({ accounts, profiles, settings, onAddAccount, onTopupAccount, onRefresh, showToast }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const currency = '$';

  const filteredAccounts = accounts.filter(a => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.username.toLowerCase().includes(q) ||
        a.full_name.toLowerCase().includes(q) ||
        (a.email_phone && a.email_phone.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete member account "${name}"?`)) return;
    await fetch(`./api/accounts/${id}`, { method: 'DELETE' });
    showToast(`Account ${name} deleted`);
    onRefresh();
  };

  const handleToggleStatus = async (a) => {
    const nextStatus = a.status === 'active' ? 'suspended' : 'active';
    await fetch(`./api/accounts/${a.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    });
    showToast(`Account ${a.username} ${nextStatus}`);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header & Account Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Hotspot Member Accounts & Self-Registration</h3>
          <p className="text-xs text-slate-400">Registered member profiles, balances, and login credentials.</p>
        </div>
        <button
          onClick={onAddAccount}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register Member Account</span>
        </button>
      </div>

      {/* Account KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">{accounts.length}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Active Members</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {accounts.filter(a => a.status === 'active').length}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Total Member Balances</span>
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
            {currency}{accounts.reduce((acc, a) => acc + (a.balance || 0), 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member name, user..."
            className="w-full bg-slate-950 border border-slate-800 text-xs rounded-lg pl-9 pr-3 py-1.5 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Accounts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Username</th>
                <th className="p-3 font-sans">Full Name & Contact</th>
                <th className="p-3">Assigned Tariff</th>
                <th className="p-3">Account Balance</th>
                <th className="p-3">Status</th>
                <th className="p-3">MAC Address</th>
                <th className="p-3">Expires At</th>
                <th className="p-3 text-right font-sans">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 font-sans">
                    No member accounts found. Click "Register Member Account" to create one.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map(a => (
                  <tr key={a.id} className="hover:bg-slate-800/40 transition-all">
                    <td className="p-3 font-bold text-white tracking-wide">{a.username}</td>
                    <td className="p-3 font-sans">
                      <div className="font-semibold text-slate-200">{a.full_name}</div>
                      <div className="text-[11px] text-slate-400">{a.email_phone || 'No contact'}</div>
                    </td>
                    <td className="p-3 text-indigo-400 font-sans">{a.profile_name || 'Standard Pass'}</td>
                    <td className="p-3 font-bold text-emerald-400">{currency}{a.balance.toFixed(2)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        a.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{a.used_by_mac || 'Unbound'}</td>
                    <td className="p-3 text-amber-400 font-mono">
                      {a.expires_at > 0 ? new Date(a.expires_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="p-3 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onTopupAccount(a)}
                          className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1"
                        >
                          <Wallet className="w-3 h-3" />
                          <span>Refill</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(a)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title={a.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                        >
                          {a.status === 'active' ? <Lock className="w-3.5 h-3.5 text-rose-400" /> : <Unlock className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                        <button
                          onClick={() => handleDelete(a.id, a.username)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300"
                          title="Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 5. PROFILES & TARIFFS VIEW
// ----------------------------------------------------------------------
function ProfilesView({ profiles, settings, onAddProfile, onRefresh, showToast }) {
  const currency = '$';

  const handleDeleteProfile = async (id, name) => {
    if (!confirm(`Delete tariff profile "${name}"?`)) return;
    await fetch(`./api/profiles/${id}`, { method: 'DELETE' });
    showToast(`Profile ${name} deleted`);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Hotspot Tariff Profiles & Speed Plans</h3>
          <p className="text-xs text-slate-400">Configure speed limits (e.g. 5M/2M), validity duration, pricing, and shared users.</p>
        </div>
        <button
          onClick={onAddProfile}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Tariff Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {profiles.map(p => (
          <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 relative">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black font-mono text-white">{currency}{p.price.toFixed(2)}</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                {p.rate_limit}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-100">{p.name}</h4>
              <p className="text-xs text-slate-400 mt-1">
                Valid: {p.validity_value} {p.validity_unit} • {p.shared_users} User{p.shared_users > 1 ? 's' : ''}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1 font-mono">
              <div>Data Limit: <span className="text-slate-200">{p.data_limit_mb ? `${p.data_limit_mb} MB` : 'Unlimited'}</span></div>
              <div>MAC Binding: <span className="text-slate-200">{p.lock_mac ? 'Enabled' : 'Disabled'}</span></div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => handleDeleteProfile(p.id, p.name)}
                className="p-1.5 rounded bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-300"
                title="Delete Profile"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 6. ACTIVE SESSIONS VIEW
// ----------------------------------------------------------------------
function ActiveSessionsView({ sessions, onRefresh, showToast }) {
  const handleKick = async (id, user) => {
    if (!confirm(`Force disconnect / kick user ${user}?`)) return;
    await fetch(`./api/sessions/${id}/kick`, { method: 'POST' });
    showToast(`User ${user} disconnected from hotspot`);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Live Active Hotspot Sessions</h3>
          <p className="text-xs text-slate-400">Currently authenticated connected devices on the MikroTik gateway.</p>
        </div>
        <button
          onClick={onRefresh}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Sessions</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">User / Code</th>
                <th className="p-3 font-sans">Tariff Plan</th>
                <th className="p-3">IP Address</th>
                <th className="p-3">MAC Address</th>
                <th className="p-3">Host Device</th>
                <th className="p-3">Uptime</th>
                <th className="p-3">Data Used</th>
                <th className="p-3 text-right font-sans">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sessions.map(s => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition-all">
                  <td className="p-3 font-bold text-white">{s.user}</td>
                  <td className="p-3 text-indigo-400 font-sans">{s.profile}</td>
                  <td className="p-3 text-emerald-400">{s.ip}</td>
                  <td className="p-3 text-slate-300">{s.mac}</td>
                  <td className="p-3 text-slate-400 font-sans">{s.host_name}</td>
                  <td className="p-3 text-amber-400">{s.uptime}</td>
                  <td className="p-3 text-slate-300">{s.bytes_in_mb} MB / {(s.bytes_out_mb / 1024).toFixed(1)} GB</td>
                  <td className="p-3 text-right font-sans">
                    <button
                      onClick={() => handleKick(s.id, s.user)}
                      className="px-2.5 py-1 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold text-[11px]"
                    >
                      Kick
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 7. SALES ANALYTICS VIEW
// ----------------------------------------------------------------------
function SalesAnalyticsView({ salesData, settings, showToast }) {
  const currency = '$';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-white">Voucher Sales & Revenue Analytics</h3>
        <p className="text-xs text-slate-400">Historical transaction logs and daily revenue reports.</p>
      </div>

      {/* Sales Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3 font-sans">Plan</th>
                <th className="p-3">Price</th>
                <th className="p-3 font-sans">Seller</th>
                <th className="p-3 font-sans">Method</th>
                <th className="p-3 font-sans">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {salesData.sales.map(s => (
                <tr key={s.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-white">{s.code}</td>
                  <td className="p-3 text-indigo-400 font-sans">{s.profile_name}</td>
                  <td className="p-3 text-emerald-400 font-bold">{currency}{s.price.toFixed(2)}</td>
                  <td className="p-3 text-slate-300 font-sans">{s.seller}</td>
                  <td className="p-3 text-slate-400 font-sans">{s.payment_method}</td>
                  <td className="p-3 text-slate-400 font-sans">{new Date(s.sold_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 8. CAPTIVE PORTAL CUSTOMIZER VIEW
// ----------------------------------------------------------------------
function PortalCustomizerView({ settings, onSaveSettings, onOpenPortal }) {
  const [businessName, setBusinessName] = useState(settings.business_name || 'NetZone Hotspot');
  const [hotspotTitle, setHotspotTitle] = useState(settings.hotspot_title || 'Connect to High-Speed Internet');
  const [contactNumber, setContactNumber] = useState(settings.contact_number || '+1 (555) 019-2831');
  const [receiptHeader, setReceiptHeader] = useState(settings.receipt_header || 'Welcome to NetZone Hotspot!');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings({
      business_name: businessName,
      hotspot_title: hotspotTitle,
      contact_number: contactNumber,
      receipt_header: receiptHeader
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Captive Portal Landing Page Studio</h3>
          <p className="text-xs text-slate-400">Customize hotspot branding, landing login text, and customer welcome messages.</p>
        </div>
        <button
          onClick={onOpenPortal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Launch Live Customer Portal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">Hotspot Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">Welcome Title / Slogan</label>
            <input
              type="text"
              value={hotspotTitle}
              onChange={(e) => setHotspotTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">Support Contact Phone</label>
            <input
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">Receipt & Ticket Header</label>
            <textarea
              rows="3"
              value={receiptHeader}
              onChange={(e) => setReceiptHeader(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-lg transition-all"
          >
            Save Branding Changes
          </button>
        </form>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Mobile Portal Preview</h4>
          <div className="w-64 mx-auto border-4 border-slate-700 rounded-3xl p-3 bg-slate-950 space-y-3 shadow-2xl">
            <div className="text-center pt-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 mx-auto flex items-center justify-center font-bold text-white text-xs mb-1">
                <Wifi className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-white leading-tight">{businessName}</div>
              <div className="text-[10px] text-indigo-400">{hotspotTitle}</div>
            </div>

            <div className="bg-slate-900 p-2.5 rounded-xl space-y-2 border border-slate-800">
              <div className="text-[10px] font-bold text-slate-300">Enter Voucher Code</div>
              <div className="bg-slate-950 border border-slate-700 rounded p-1.5 text-[10px] text-slate-500 font-mono">NET-8921</div>
              <div className="bg-indigo-600 text-white text-[10px] font-bold py-1.5 rounded text-center">Connect WiFi</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 9. TERMINAL & SCRIPT VIEW
// ----------------------------------------------------------------------
function TerminalScriptView({ selectedRouter, showToast }) {
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'output', text: 'MikroTik RouterOS 7.15.1 (c) 1999-2024' },
    { type: 'output', text: 'Type "help" or "?" for available commands.' }
  ]);
  const [cmdInput, setCmdInput] = useState('');
  const [scriptCode, setScriptCode] = useState('');
  const termEndRef = useRef(null);

  useEffect(() => {
    termEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  const handleExecCommand = async (e) => {
    e.preventDefault();
    if (!cmdInput.trim()) return;

    const cmd = cmdInput.trim();
    setTerminalHistory(prev => [...prev, { type: 'input', text: `[admin@Core-Gateway] > ${cmd}` }]);
    setCmdInput('');

    try {
      const res = await fetch('./api/terminal/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      });
      const data = await res.json();
      setTerminalHistory(prev => [...prev, { type: 'output', text: data.output }]);
    } catch {
      setTerminalHistory(prev => [...prev, { type: 'output', text: 'Error communicating with CLI terminal.' }]);
    }
  };

  const generateScript = async () => {
    const res = await fetch('./api/script/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hotspot_name: "NetZone-Hotspot",
        dns_name: "netzone.wifi"
      })
    });
    const data = await res.json();
    setScriptCode(data.script);
  };

  useEffect(() => {
    generateScript();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Terminal CLI */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-96">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <span className="text-xs font-bold text-white flex items-center gap-2 font-mono">
            <Terminal className="w-4 h-4 text-emerald-400" />
            RouterOS CLI Terminal (Winbox/SSH)
          </span>
        </div>

        <div className="flex-1 bg-black p-3 rounded-lg font-mono text-xs text-emerald-400 overflow-y-auto space-y-1">
          {terminalHistory.map((line, i) => (
            <div key={i} className={line.type === 'input' ? 'text-white font-bold' : 'text-emerald-400 whitespace-pre-wrap'}>
              {line.text}
            </div>
          ))}
          <div ref={termEndRef} />
        </div>

        <form onSubmit={handleExecCommand} className="mt-3 flex gap-2">
          <input
            type="text"
            value={cmdInput}
            onChange={(e) => setCmdInput(e.target.value)}
            placeholder="Type command e.g. /system resource print"
            className="flex-1 bg-slate-950 border border-slate-800 text-white font-mono text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          />
          <button type="submit" className="bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-lg">
            Exec
          </button>
        </form>
      </div>

      {/* RSC Script Generator */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-96">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <span className="text-xs font-bold text-white font-mono flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Auto-Generated RouterOS Setup Script (.rsc)
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(scriptCode);
              showToast('Script copied to clipboard!');
            }}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded border border-slate-700 flex items-center gap-1"
          >
            <Copy className="w-3.5 h-3.5" /> Copy
          </button>
        </div>

        <textarea
          readOnly
          value={scriptCode}
          className="flex-1 bg-black text-slate-300 font-mono text-[11px] p-3 rounded-lg focus:outline-none resize-none"
        />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 10. SYSTEM LOGS VIEW
// ----------------------------------------------------------------------
function LogsView({ logs, onRefresh }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white">System Event Logs</h3>
        <button onClick={onRefresh} className="p-1.5 rounded bg-slate-800 text-slate-300">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Category</th>
                <th className="p-3">Level</th>
                <th className="p-3">Log Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.map(l => (
                <tr key={l.id} className="hover:bg-slate-800/40">
                  <td className="p-3 text-slate-400">{new Date(l.timestamp).toLocaleTimeString()}</td>
                  <td className="p-3 text-indigo-400 font-bold">{l.category}</td>
                  <td className="p-3">
                    <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                      l.level === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-300'
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
    </div>
  );
}

// ----------------------------------------------------------------------
// 11. SETTINGS VIEW
// ----------------------------------------------------------------------
function SettingsView({ settings, onSave }) {
  const [currency, setCurrency] = useState(settings.currency || 'USD ($)');
  const [dnsName, setDnsName] = useState(settings.dns_name || 'wifi.netzone.hotspot');

  return (
    <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
      <h3 className="font-bold text-white text-base">System Preferences</h3>

      <div className="space-y-3 text-xs">
        <div>
          <label className="font-bold text-slate-300 block mb-1">Currency Symbol</label>
          <input
            type="text"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 focus:outline-none"
          />
        </div>

        <div>
          <label className="font-bold text-slate-300 block mb-1">Hotspot DNS Name</label>
          <input
            type="text"
            value={dnsName}
            onChange={(e) => setDnsName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 focus:outline-none"
          />
        </div>

        <button
          onClick={() => onSave({ currency, dns_name: dnsName })}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg transition-all"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// MODALS
// ----------------------------------------------------------------------

// Batch Voucher Modal
function BatchVoucherModal({ profiles, onClose, onSuccess }) {
  const [profileId, setProfileId] = useState(profiles[0]?.id || 1);
  const [quantity, setQuantity] = useState(20);
  const [codeLength, setCodeLength] = useState(6);
  const [prefix, setPrefix] = useState('NET');
  const [characterSet, setCharacterSet] = useState('numbers');
  const [samePassword, setSamePassword] = useState(true);
  const [comment, setComment] = useState('Batch Print');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('./api/vouchers/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: Number(profileId),
          quantity: Number(quantity),
          code_length: Number(codeLength),
          prefix,
          character_set: characterSet,
          same_password: samePassword,
          comment
        })
      });

      if (res.ok) {
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Ticket className="w-4 h-4 text-indigo-400" />
            Batch Voucher Generator
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Tariff Plan</label>
            <select
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 focus:outline-none"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Code Length</label>
              <input
                type="number"
                value={codeLength}
                onChange={(e) => setCodeLength(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Prefix</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Characters</label>
              <select
                value={characterSet}
                onChange={(e) => setCharacterSet(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 focus:outline-none"
              >
                <option value="numbers">Numbers Only (12345)</option>
                <option value="uppercase">Uppercase Letters (ABCDE)</option>
                <option value="mixed">Mixed Alphanumeric</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Comment</label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg transition-all"
          >
            {loading ? 'Generating...' : `Generate ${quantity} Vouchers`}
          </button>
        </form>
      </div>
    </div>
  );
}

// Quick User / Single Voucher Modal
function QuickUserModal({ profiles, onClose, onSuccess }) {
  const [profileId, setProfileId] = useState(profiles[0]?.id || 1);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('./api/vouchers/quick-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: Number(profileId),
          code,
          password,
          comment
        })
      });

      if (res.ok) {
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            Create Single User / Voucher
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Username / Code</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. GUEST-9901"
              className="w-full bg-slate-950 border border-slate-800 text-white font-mono rounded-lg p-2 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Password</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank for same as code"
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Tariff Plan</label>
            <select
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 focus:outline-none"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !code}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg transition-all"
          >
            Create User
          </button>
        </form>
      </div>
    </div>
  );
}

// Add Member Account Modal
function AddAccountModal({ profiles, onClose, onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [emailPhone, setEmailPhone] = useState('');
  const [profileId, setProfileId] = useState(profiles[0]?.id || 2);
  const [balance, setBalance] = useState(10.00);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('./api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          full_name: fullName,
          email_phone: emailPhone,
          profile_id: Number(profileId),
          balance: Number(balance)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create account');
      } else {
        onSuccess();
      }
    } catch {
      setError('Connection error creating account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-400" />
            Register Hotspot Member Account
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {error && <div className="p-2.5 bg-rose-950 border border-rose-800 text-rose-200 text-xs rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Marcus Vance"
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="marcus_v"
                className="w-full bg-slate-950 border border-slate-800 text-white font-mono rounded-lg p-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Contact (Phone/Email)</label>
              <input
                type="text"
                value={emailPhone}
                onChange={(e) => setEmailPhone(e.target.value)}
                placeholder="marcus@email.com"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Initial Balance ($)</label>
              <input
                type="number"
                step="0.5"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Default Tariff Profile</label>
            <select
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 focus:outline-none"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !username || !password || !fullName}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg transition-all"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}

// Topup Account Modal
function TopupAccountModal({ account, vouchers, onClose, onSuccess }) {
  const [voucherCode, setVoucherCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('./api/accounts/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: account.id,
          voucher_code: voucherCode
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Topup failed');
      } else {
        onSuccess(data.message);
      }
    } catch {
      setError('Connection error during topup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            Refill Account: {account.username}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {error && <div className="p-2.5 bg-rose-950 border border-rose-800 text-rose-200 text-xs rounded-lg">{error}</div>}

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
          <div className="text-slate-400">Current Balance: <span className="text-emerald-400 font-bold">${account.balance.toFixed(2)}</span></div>
          <div className="text-slate-400">Owner: <span className="text-white font-medium">{account.full_name}</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Voucher Code to Redeem</label>
            <input
              type="text"
              required
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              placeholder="e.g. NET-8921"
              className="w-full bg-slate-950 border border-slate-800 text-white font-mono rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !voucherCode}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg transition-all"
          >
            Redeem Voucher & Credit Account
          </button>
        </form>
      </div>
    </div>
  );
}

// Sell Voucher Modal
function SellVoucherModal({ voucher, settings, onClose, onSuccess }) {
  const [seller, setSeller] = useState('Front Desk Cashier');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [loading, setLoading] = useState(false);

  const handleSell = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('./api/vouchers/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voucher_id: voucher.id,
          seller,
          payment_method: paymentMethod
        })
      });

      if (res.ok) {
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Cashier POS - Sell Voucher
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
          <div className="flex justify-between font-bold text-sm">
            <span className="text-white">Code: {voucher.code}</span>
            <span className="text-emerald-400">${voucher.price.toFixed(2)}</span>
          </div>
          <div className="text-slate-400">Plan: {voucher.profile_name}</div>
        </div>

        <form onSubmit={handleSell} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Cashier / Staff</label>
            <input
              type="text"
              value={seller}
              onChange={(e) => setSeller(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 focus:outline-none"
            >
              <option value="Cash">Cash</option>
              <option value="M-Pesa / Mobile Money">M-Pesa / Mobile Money</option>
              <option value="Credit Card">Credit Card</option>
              <option value="QR Pay">QR Pay</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg transition-all"
          >
            Confirm Sale & Activate
          </button>
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
  const [model, setModel] = useState('RB750Gr3');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('./api/routers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, host, username, password, model })
      });

      if (res.ok) {
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-400" />
            Add MikroTik Router Gateway
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Router Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Branch Office AP"
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Host IP Address</label>
            <input
              type="text"
              required
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="192.168.88.1"
              className="w-full bg-slate-950 border border-slate-800 text-white font-mono rounded-lg p-2 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">API Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">API Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !name || !host}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg transition-all"
          >
            Add Router
          </button>
        </form>
      </div>
    </div>
  );
}

// Add Profile Modal
function AddProfileModal({ routerId, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [rateLimit, setRateLimit] = useState('10M/3M');
  const [validityValue, setValidityValue] = useState(1);
  const [validityUnit, setValidityUnit] = useState('days');
  const [price, setPrice] = useState(2.00);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('./api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          router_id: routerId,
          name,
          rate_limit: rateLimit,
          validity_value: Number(validityValue),
          validity_unit: validityUnit,
          price: Number(price),
          shared_users: 1
        })
      });

      if (res.ok) {
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            Add Tariff Profile
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Profile Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 24 Hours Unlimited Day Pass"
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Rate Limit (Rx/Tx)</label>
              <input
                type="text"
                required
                value={rateLimit}
                onChange={(e) => setRateLimit(e.target.value)}
                placeholder="10M/3M"
                className="w-full bg-slate-950 border border-slate-800 text-white font-mono rounded-lg p-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Price ($)</label>
              <input
                type="number"
                step="0.10"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Validity Duration</label>
              <input
                type="number"
                value={validityValue}
                onChange={(e) => setValidityValue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Unit</label>
              <select
                value={validityUnit}
                onChange={(e) => setValidityUnit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 focus:outline-none"
              >
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !name}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg transition-all"
          >
            Create Tariff Profile
          </button>
        </form>
      </div>
    </div>
  );
}

// Print Thermal / Grid Vouchers Modal
function PrintModal({ items, mode, settings, onClose }) {
  const businessName = settings.business_name || 'NetZone Hotspot';
  const receiptHeader = settings.receipt_header || 'Welcome to NetZone Hotspot!';
  const receiptFooter = settings.receipt_footer || 'Support: call +1 555-019-2831';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Printer className="w-4 h-4 text-indigo-400" />
            Print Preview ({items.length} Voucher{items.length > 1 ? 's' : ''})
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" /> Print Now
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-xl border border-slate-800 printable-area">
          {mode === 'thermal' ? (
            /* Thermal Receipt 58mm / 80mm format */
            <div className="space-y-6 max-w-xs mx-auto">
              {items.map(v => (
                <div key={v.id} className="bg-white text-black p-4 rounded shadow font-mono text-center space-y-2 border border-slate-300">
                  <div className="font-bold text-sm tracking-wider uppercase border-b pb-1 border-slate-300">{businessName}</div>
                  <div className="text-[10px] text-slate-600">{receiptHeader}</div>
                  <div className="py-2 my-1 border-y border-dashed border-slate-400">
                    <div className="text-[10px] uppercase text-slate-500">VOUCHER CODE</div>
                    <div className="text-xl font-extrabold tracking-widest text-indigo-900">{v.code}</div>
                    <div className="text-xs text-slate-700">Password: {v.password}</div>
                  </div>
                  <div className="text-[11px] font-bold">{v.profile_name || 'WiFi Pass'}</div>
                  <div className="text-[9px] text-slate-500 pt-1 border-t border-slate-200">{receiptFooter}</div>
                </div>
              ))}
            </div>
          ) : (
            /* Grid Card Sheet format */
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map(v => (
                <div key={v.id} className="bg-white text-black p-3 rounded-lg border-2 border-dashed border-slate-400 text-center space-y-1.5 font-mono">
                  <div className="text-[10px] font-bold text-indigo-900 uppercase tracking-wide">{businessName}</div>
                  <div className="text-xs font-black tracking-widest bg-slate-100 p-1 rounded border border-slate-300">{v.code}</div>
                  <div className="text-[10px] text-slate-700">Pass: {v.password}</div>
                  <div className="text-[9px] font-bold text-indigo-600">{v.profile_name || 'Pass'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Mount React App
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
