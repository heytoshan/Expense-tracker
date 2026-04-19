'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  LayoutDashboard, Receipt, Wallet, BarChart3, RefreshCw,
  LogOut, Sun, Moon, Menu, X, ChevronLeft, Shield
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard',           label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/expenses',  label: 'Expenses',  icon: Receipt },
  { href: '/dashboard/budgets',   label: 'Budgets',   icon: Wallet },
  { href: '/dashboard/analytics', label: 'Analytics',  icon: BarChart3 },
  { href: '/dashboard/recurring', label: 'Recurring',  icon: RefreshCw },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  const NavLink = ({ href, label, icon: Icon }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: 13,
          fontWeight: active ? 600 : 400,
          color: active ? 'var(--primary)' : 'var(--muted)',
          background: active ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'transparent',
          textDecoration: 'none',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--foreground)'; } }}
        onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; } }}
      >
        <Icon size={18} style={{ flexShrink: 0 }} />
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  };

  const BottomButton = ({ icon: Icon, label, onClick, color, hoverBg }) => (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 'var(--radius-sm)',
        fontSize: 13,
        fontWeight: 400,
        color: color || 'var(--muted)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = hoverBg || 'var(--surface-hover)'; e.currentTarget.style.color = color === 'var(--danger)' ? 'var(--danger)' : 'var(--foreground)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = color || 'var(--muted)'; }}
    >
      <Icon size={18} style={{ flexShrink: 0 }} />
      {!collapsed && <span>{label}</span>}
    </button>
  );

  const Content = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '24px 16px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--primary)',
            flexShrink: 0,
          }}
        >
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>E</span>
        </div>
        {!collapsed && (
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--foreground)' }}>
            ExpenseIQ
          </span>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
        {user?.role === 'ADMIN' && (
          <NavLink href="/dashboard/admin" label="Admin" icon={Shield} />
        )}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <BottomButton
          icon={theme === 'dark' ? Sun : Moon}
          label={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          onClick={toggleTheme}
        />

        {!collapsed && user && (
          <div style={{ padding: '8px 12px' }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
          </div>
        )}

        <BottomButton
          icon={LogOut}
          label="Log out"
          onClick={logout}
          color="var(--danger)"
          hoverBg="color-mix(in srgb, var(--danger) 8%, transparent)"
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        id="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(true)}
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 50,
          padding: 8,
          borderRadius: 'var(--radius-sm)',
          background: 'var(--surface)',
          border: '1px solid var(--border-color)',
          cursor: 'pointer',
          display: 'none',
        }}
        className="lg:hidden"
      >
        <Menu size={18} style={{ color: 'var(--foreground)' }} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden"
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className="lg:hidden"
        style={{
          position: 'fixed',
          inset: '0 auto 0 0',
          zIndex: 50,
          width: 264,
          background: 'var(--background)',
          borderRight: '1px solid var(--border-color)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
        }}
      >
        <button
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'absolute',
            top: 20,
            right: 12,
            padding: 4,
            borderRadius: 'var(--radius-sm)',
            background: 'transparent',
            border: 'none',
            color: 'var(--muted)',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>
        <Content />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex"
        style={{
          flexDirection: 'column',
          position: 'fixed',
          inset: '0 auto 0 0',
          zIndex: 40,
          width: collapsed ? 72 : 248,
          background: 'var(--background)',
          borderRight: '1px solid var(--border-color)',
          transition: 'width 0.25s ease',
        }}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute',
            right: -12,
            top: 32,
            width: 24,
            height: 24,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--surface)',
            border: '1px solid var(--border-color)',
            color: 'var(--muted)',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)'; }}
        >
          <ChevronLeft size={12} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }} />
        </button>
        <Content />
      </aside>
    </>
  );
}
