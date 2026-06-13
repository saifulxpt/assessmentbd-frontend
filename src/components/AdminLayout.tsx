'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

// ---- types ----
interface AdminUser {
  id: number;
  name: string;
  email?: string;
  is_admin: boolean;
  is_super_admin: boolean;
  permissions?: string[];
  avatar?: string;
}

// ---- icons (inline lucide-style SVGs) ----
const Icon = ({ name, className = 'ni' }: { name: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    'layout-dashboard': <><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></>,
    'book-open': <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>,
    'layers': <><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></>,
    'help-circle': <><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></>,
    'users': <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    'shield-alert': <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M12 8v4"/><path d="M12 16h.01"/></>,
    'target': <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
    'headphones': <><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></>,
    'credit-card': <><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></>,
    'megaphone': <><path d="m3 11 19-9-9 19-2-8-8-2z"/></>,
    'message-square': <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
    'bar-chart-2': <><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></>,
    'database': <><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></>,
    'file-text': <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></>,
    'bell': <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>,
    'settings': <><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></>,
    'sliders-horizontal': <><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="12" y2="12"/><line x1="21" x2="3" y1="18" y2="18"/><polyline points="8 3 4 6 8 9"/><polyline points="16 15 20 18 16 21"/></>,
    'layout-template': <><rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/></>,
    'key-round': <><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"/><circle cx="16.5" cy="7.5" r=".5"/></>,
    'share-2': <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></>,
    'ticket': <><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></>,
    'image': <><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></>,
    'log-out': <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></>,
    'globe': <><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
    'circle-dot': <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/></>,
    'chevron-down': <><polyline points="6 9 12 15 18 9"/></>,
    'menu': <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    'x': <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  };
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name] ?? <circle cx="12" cy="12" r="4"/>}
    </svg>
  );
};

// ---- NavItem ----
function NavItem({ href, icon, label, active, collapsed, mobileOpen }: {
  href: string; icon: string; label: string; active: boolean; collapsed: boolean; mobileOpen: boolean;
}) {
  const show = !collapsed || mobileOpen;
  return (
    <Link href={href} prefetch={false} className={`nav-item ${active ? 'active' : ''}`}>
      <Icon name={icon} className="ni" />
      {show && <span className="nl">{label}</span>}
    </Link>
  );
}

// ---- SubNavItem ----
function SubNavItem({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} prefetch={false} className={`nav-sub-item ${active ? 'active' : ''}`}>
      <Icon name="circle-dot" className="w-3.5 h-3.5 ni" />
      {label}
    </Link>
  );
}

// ---- Collapsible Group ----
function NavGroup({ icon, label, children, defaultOpen, collapsed, mobileOpen }: {
  icon: string; label: string; children: React.ReactNode; defaultOpen?: boolean; collapsed: boolean; mobileOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const show = !collapsed || mobileOpen;
  return (
    <div>
      <button onClick={() => setOpen(o => !o)} className="nav-item w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Icon name={icon} className="ni" />
          {show && <span className="nl">{label}</span>}
        </div>
        {show && <Icon name="chevron-down" className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />}
      </button>
      {open && show && (
        <div className="pl-7 pr-2 mt-1 space-y-1">{children}</div>
      )}
    </div>
  );
}

export default function AdminLayout({ children, adminUser }: {
  children: React.ReactNode;
  adminUser: AdminUser | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('sd_sidebar_admin');
    return stored !== null ? stored === 'true' : window.innerWidth >= 1024;
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Sync resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('sd_sidebar_admin', String(sidebarOpen));
  }, [sidebarOpen]);

  // Close profile on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const is = (pattern: string) => pathname.startsWith(pattern);

  const name = adminUser?.name ?? 'Admin';
  const initial = name.charAt(0).toUpperCase();
  const collapsed = !sidebarOpen && !mobileOpen;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --sidebar-w: 240px; --sidebar-c: 64px; --topbar-h: 64px;
          --brand: #4DB381; --brand-hover: #3da06e; --brand-tint: #f0faf5;
          --brand-light: #d1f5e4; --brand-ring: rgba(77,179,129,.18);
        }
        *, *::before, *::after { font-family: 'Inter', sans-serif; }
        html, body { height: 100%; margin: 0; padding: 0; }
        body { background: #EEF1F6; color: #1a2535; }
        .app-shell { display: flex; height: 100vh; height: 100dvh; overflow: hidden; }
        .sd-sidebar {
          width: var(--sidebar-w); min-width: var(--sidebar-w);
          background: #fff; border-right: 1px solid #eef2f6;
          display: flex; flex-direction: column; height: 100%;
          transition: width .24s cubic-bezier(.4,0,.2,1), min-width .24s cubic-bezier(.4,0,.2,1);
          overflow: hidden; position: relative; z-index: 50; flex-shrink: 0;
        }
        .sd-sidebar.collapsed { width: var(--sidebar-c); min-width: var(--sidebar-c); }
        .sd-logo-row { height: var(--topbar-h); display: flex; align-items: center; padding: 0 14px 0 16px; gap: 9px; border-bottom: 1px solid #f1f5f9; flex-shrink: 0; }
        .sd-logo-mark { width: 34px; height: 34px; background: var(--brand); border-radius: 9px; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; box-shadow: 0 2px 6px rgba(77,179,129,.35); }
        .sd-logo-text { flex: 1; overflow: hidden; display: flex; align-items: center; }
        .sd-logo-text strong { font-size: 16px; font-weight: 800; color: #1a2535; white-space: nowrap; letter-spacing: -.3px; }
        .sd-logo-text strong em { font-style: normal; color: var(--brand); }
        .sd-toggle { width: 28px; height: 28px; border: none; background: transparent; border-radius: 7px; display: flex; align-items: center; justify-content: center; color: #b0bec9; cursor: pointer; transition: background .15s, color .15s; flex-shrink: 0; }
        .sd-toggle:hover { background: #f1f5f9; color: #475569; }
        .sd-nav { flex: 1; overflow-y: auto; padding: 6px 0 8px; }
        .sd-nav::-webkit-scrollbar { width: 0; }
        .nav-item { display: flex; align-items: center; gap: 10px; margin: 2px 8px; padding: 10px 14px; border-radius: 10px; color: #64748b; font-size: 14px; font-weight: 600; text-decoration: none; cursor: pointer; transition: background .15s, color .15s; white-space: nowrap; overflow: hidden; position: relative; border: none; width: calc(100% - 16px); text-align: left; background: transparent; }
        .nav-item:hover { background: var(--brand-tint); color: var(--brand-hover); }
        .nav-item.active { background: var(--brand); color: #fff; box-shadow: 0 2px 8px rgba(77,179,129,.3); }
        .nav-item.active .ni { color: #fff; }
        .nav-item-light { background: var(--brand-light) !important; color: var(--brand) !important; }
        .ni { width: 18px; height: 18px; flex-shrink: 0; transition: color .15s; }
        .nl { flex: 1; overflow: hidden; text-overflow: ellipsis; }
        .nav-sep { height: 1px; background: #f1f5f9; margin: 6px 16px; flex-shrink: 0; }
        .nav-sub-item { display:flex; align-items:center; gap:9px; margin:1px 0; padding:8px 12px; border-radius:9px; color:#64748b; font-size:13px; font-weight:600; text-decoration:none; transition:background .15s, color .15s; white-space:nowrap; overflow:hidden; }
        .nav-sub-item:hover { background:var(--brand-tint); color:var(--brand-hover); }
        .nav-sub-item.active { background:var(--brand); color:#fff; }
        .sd-topbar { height: var(--topbar-h); background: #fff; border-bottom: 1px solid #eef2f6; display: flex; align-items: center; padding: 0 24px; gap: 12px; flex-shrink: 0; z-index: 30; }
        .sd-topbar-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
        .sd-topbar-right { display: flex; align-items: center; gap: 4px; }
        .sd-tb-btn { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; background: transparent; border: none; color: #64748b; cursor: pointer; transition: all .15s; }
        .sd-tb-btn:hover { background: #f1f5f9; color: #1a2535; }
        .sd-avatar-btn { display: flex; align-items: center; gap: 7px; padding: 4px 8px 4px 4px; border-radius: 10px; border: none; background: transparent; cursor: pointer; transition: background .15s; }
        .sd-avatar-btn:hover { background: #f1f5f9; }
        .sd-avatar-initials { width: 32px; height: 32px; border-radius: 8px; background: #0b57d0; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; flex-shrink: 0; }
        .sd-avatar-name { font-size: 13px; font-weight: 700; color: #1a2535; white-space: nowrap; }
        .sd-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
        .sd-content { flex: 1; overflow-y: auto; padding: 28px 32px; }
        .sd-card, .card { background: rgba(255,255,255,0.65); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.8); border-radius: 28px; box-shadow: 0 8px 32px rgba(15,23,42,0.04); transition: all 0.4s cubic-bezier(0.16,1,0.3,1); }
        .sd-card:hover, .card:hover { background: rgba(255,255,255,0.85); box-shadow: 0 14px 44px rgba(15,23,42,0.08); transform: translateY(-2px); }
        .btn-brand, .btn-primary { background: var(--brand); color: #fff; font-weight: 700; font-size: 13px; padding: 10px 20px; border-radius: 20px; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; transition: all .18s ease; text-decoration: none; box-shadow: 0 4px 14px rgba(77,179,129,.3); }
        .btn-brand:hover, .btn-primary:hover { transform: translateY(-1.5px); box-shadow: 0 6px 20px rgba(77,179,129,.4); }
        .btn-outline { background: rgba(255,255,255,0.7); color: #475569; font-weight: 600; font-size: 13px; padding: 10px 20px; border-radius: 20px; border: 1.5px solid rgba(226,232,240,0.8); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; transition: all .15s; text-decoration: none; }
        .btn-outline:hover { background: #fff; border-color: #94a3b8; }
        .sd-table th { font-size: 11px; font-weight: 700; color: #64748b; padding: 11px 16px; border-bottom: 1px solid #e8edf3; text-transform: uppercase; letter-spacing: .04em; }
        .sd-table td { padding: 14px 16px; font-size: 13px; color: #334155; border-bottom: 1px solid #f1f5f9; }
        .sd-table tr:last-child td { border-bottom: none; }
        .sd-table tr:hover td { background: #fafbfc; }
        .sd-input { width: 100%; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 13px; font-weight: 500; color: #0f172a; background-color: #fff; outline: none; transition: border-color .2s, box-shadow .2s; }
        .sd-input:focus { border-color: var(--brand); box-shadow: 0 0 0 3px var(--brand-ring); }
        .badge-active { background: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; padding: 2px 9px; border-radius: 20px; display: inline-block; }
        .badge-inactive { background: #fef9c3; color: #ca8a04; font-size: 11px; font-weight: 700; padding: 2px 9px; border-radius: 20px; display: inline-block; }
        .badge-danger { background: #fef2f2; color: #dc2626; font-size: 11px; font-weight: 700; padding: 2px 9px; border-radius: 20px; display: inline-block; }
        .flash-ok { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; border-radius: 12px; padding: 12px 16px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
        .flash-err { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; border-radius: 12px; padding: 12px 16px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
        .sd-ph { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
        .sd-ph h1 { font-size: 21px; font-weight: 800; color: #1a2535; letter-spacing: -.4px; margin: 0; }
        .sd-ph p { font-size: 13px; color: #94a3b8; font-weight: 500; margin: 3px 0 0; }
        .topbar-dropdown { position: absolute; right: 0; top: calc(100% + 6px); width: 208px; background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; overflow: hidden; z-index: 50; box-shadow: 0 4px 6px rgba(15,23,42,.04), 0 20px 40px -8px rgba(15,23,42,.14); }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #dde3ec; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--brand); }
        @media (max-width: 1023px) {
          .sd-sidebar { position: fixed; top: 0; left: 0; height: 100%; transform: translateX(-100%); transition: transform .25s ease; box-shadow: 4px 0 24px rgba(0,0,0,.12); }
          .sd-sidebar.mobile-open { transform: translateX(0); }
        }
        @media (max-width: 767px) {
          :root { --topbar-h: 58px; }
          .sd-content { padding: 20px 16px; }
          .sd-ph h1 { font-size: 18px; }
        }
      `}} />

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div className="app-shell">

        {/* ═══ SIDEBAR ═══ */}
        <aside className={`sd-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>

          {/* Logo */}
          <div className="sd-logo-row">
            <div className="sd-logo-mark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            {!collapsed && (
              <div className="sd-logo-text">
                <strong>Assessment<em>BD</em></strong>
              </div>
            )}
            <button className="sd-toggle" onClick={() => { if (window.innerWidth >= 1024) setSidebarOpen(o => !o); else setMobileOpen(false); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="sd-nav">
            <NavItem href="/admin/dashboard" icon="layout-dashboard" label="Dashboard" active={pathname === '/admin/dashboard'} collapsed={!sidebarOpen} mobileOpen={mobileOpen} />
            <NavItem href="/admin/courses" icon="book-open" label="Courses" active={is('/admin/courses')} collapsed={!sidebarOpen} mobileOpen={mobileOpen} />
            <NavItem href="/admin/exams" icon="layers" label="Competency Units" active={is('/admin/exams')} collapsed={!sidebarOpen} mobileOpen={mobileOpen} />
            <NavItem href="/admin/questions" icon="help-circle" label="Question Bank" active={is('/admin/questions')} collapsed={!sidebarOpen} mobileOpen={mobileOpen} />
            <NavItem href="/admin/users" icon="users" label="Users" active={is('/admin/users') && !is('/admin/users/security')} collapsed={!sidebarOpen} mobileOpen={mobileOpen} />
            <NavItem href="/admin/users/security" icon="shield-alert" label="Security Analysis" active={is('/admin/users/security')} collapsed={!sidebarOpen} mobileOpen={mobileOpen} />
            <NavItem href="/admin/leads" icon="target" label="Course Leads" active={is('/admin/leads')} collapsed={!sidebarOpen} mobileOpen={mobileOpen} />
            <NavItem href="/admin/support" icon="headphones" label="Support" active={is('/admin/support')} collapsed={!sidebarOpen} mobileOpen={mobileOpen} />

            <NavGroup icon="credit-card" label="Finance" defaultOpen={is('/admin/subscriptions') || is('/admin/withdrawals')} collapsed={!sidebarOpen} mobileOpen={mobileOpen}>
              <SubNavItem href="/admin/subscriptions" label="Subscriptions" active={is('/admin/subscriptions')} />
              <SubNavItem href="/admin/withdrawals" label="Withdrawals" active={is('/admin/withdrawals')} />
            </NavGroup>

            <NavItem href="/admin/campaigns" icon="megaphone" label="Marketing Campaigns" active={is('/admin/campaigns')} collapsed={!sidebarOpen} mobileOpen={mobileOpen} />
            <NavItem href="/admin/sms-logs" icon="message-square" label="SMS Logs" active={is('/admin/sms-logs')} collapsed={!sidebarOpen} mobileOpen={mobileOpen} />
            <NavItem href="/admin/analytics" icon="bar-chart-2" label="Analytics & Reports" active={is('/admin/analytics')} collapsed={!sidebarOpen} mobileOpen={mobileOpen} />
            <NavItem href="/admin/backups" icon="database" label="Backups" active={is('/admin/backups')} collapsed={!sidebarOpen} mobileOpen={mobileOpen} />
            <NavItem href="/admin/blogs" icon="file-text" label="Blog Posts" active={is('/admin/blogs')} collapsed={!sidebarOpen} mobileOpen={mobileOpen} />
            <NavItem href="/admin/notices" icon="bell" label="Notice Board" active={is('/admin/notices')} collapsed={!sidebarOpen} mobileOpen={mobileOpen} />

            <div className="nav-sep" />

            <NavGroup icon="settings" label="Settings" defaultOpen={is('/admin/settings')} collapsed={!sidebarOpen} mobileOpen={mobileOpen}>
              <SubNavItem href="/admin/settings" label="General" active={pathname === '/admin/settings'} />
              <SubNavItem href="/admin/settings/site" label="Site Content" active={is('/admin/settings/site')} />
              <SubNavItem href="/admin/settings/landing" label="Landing Page" active={is('/admin/settings/landing')} />
              <SubNavItem href="/admin/settings/api" label="API Settings" active={is('/admin/settings/api')} />
              <SubNavItem href="/admin/settings/security" label="Security" active={is('/admin/settings/security')} />
              <SubNavItem href="/admin/settings/referral" label="Referral" active={is('/admin/settings/referral')} />
              <SubNavItem href="/admin/settings/coupon" label="Coupons" active={is('/admin/settings/coupon')} />
              <SubNavItem href="/admin/settings/resources" label="Resources" active={is('/admin/settings/resources')} />
            </NavGroup>
          </nav>
        </aside>

        {/* ═══ MAIN ═══ */}
        <div className="sd-main">

          {/* Topbar */}
          <header className="sd-topbar">
            <div className="sd-topbar-left">
              <button className="sd-tb-btn" onClick={() => { if (window.innerWidth >= 1024) setSidebarOpen(o => !o); else setMobileOpen(true); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
              <div className="w-px h-5 bg-slate-200 mx-2" />
              <span className="hidden sm:block font-bold text-slate-700 text-sm">Admin Panel</span>
            </div>
            <div className="sd-topbar-right">
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <div className="relative" ref={profileRef}>
                <button className="sd-avatar-btn" onClick={() => setProfileOpen(o => !o)}>
                  <span className="sd-avatar-initials">{initial}</span>
                  <span className="sd-avatar-name hidden md:block">{name.split(' ')[0]}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: '.2s', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {profileOpen && (
                  <div className="topbar-dropdown">
                    <div className="p-3 border-b border-slate-100" style={{ background: '#f0faf5' }}>
                      <div className="font-bold text-sm text-slate-800">{name}</div>
                      <div className="text-[11px] text-slate-500 font-medium">Administrator</div>
                    </div>
                    <div className="p-2">
                      <Link href="/admin/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors" onClick={() => setProfileOpen(false)}>
                        <Icon name="settings" className="w-4 h-4" /> Settings
                      </Link>
                      <Link href="/" target="_blank" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors" onClick={() => setProfileOpen(false)}>
                        <Icon name="globe" className="w-4 h-4" /> Visit Website
                      </Link>
                      <div className="my-1 border-t border-slate-100" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
                        <Icon name="log-out" className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="sd-content">
            {children}
          </main>
        </div>

      </div>
    </>
  );
}
