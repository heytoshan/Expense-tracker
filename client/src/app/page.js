'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { BarChart3, Shield, RefreshCw, TrendingUp, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) router.push('/dashboard');
  }, [loading, isAuthenticated, router]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>E</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)' }}>ExpenseIQ</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/login" style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 500, color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.2s ease' }}>
            Log in
          </Link>
          <Link href="/signup" style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600, color: '#fff', textDecoration: 'none', background: 'var(--primary)' }}>
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main style={{ textAlign: 'center', padding: '80px 24px 64px', maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.15, color: 'var(--foreground)', marginBottom: 16 }}>
          Take Control of<br />Your Finances
        </h1>

        <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.6 }}>
          Track every expense, set smart budgets, and gain powerful insights into your spending patterns. All in one clean dashboard.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 80 }}>
          <Link href="/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 'var(--radius-sm)',
            fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none', background: 'var(--primary)', transition: 'opacity 0.2s ease',
          }}>
            Start Tracking Free <ArrowRight size={16} />
          </Link>
          <Link href="/login" style={{
            display: 'inline-flex', alignItems: 'center', padding: '12px 24px', borderRadius: 'var(--radius-sm)',
            fontSize: 14, fontWeight: 500, color: 'var(--foreground)', textDecoration: 'none', border: '1px solid var(--border-color)',
          }}>
            I have an account
          </Link>
        </div>

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, maxWidth: 960, margin: '0 auto' }}>
          {[
            { Icon: BarChart3, title: 'Smart Analytics', desc: 'Interactive charts showing where your money goes', color: 'var(--primary)' },
            { Icon: Shield, title: 'Budget Alerts', desc: 'Set budgets per category and get warned near limits', color: 'var(--success)' },
            { Icon: RefreshCw, title: 'Auto Recurring', desc: 'Monthly recurring expenses logged automatically', color: 'var(--accent)' },
            { Icon: TrendingUp, title: 'CSV Export', desc: 'Export your data anytime for external analysis', color: 'var(--warning)' },
          ].map((f, i) => (
            <div key={i} style={{
              padding: 24, borderRadius: 'var(--radius-md)', background: 'var(--surface)',
              border: '1px solid var(--border-color)', textAlign: 'left',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `color-mix(in srgb, ${f.color} 10%, transparent)`, marginBottom: 16,
              }}>
                <f.Icon size={20} style={{ color: f.color }} />
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)', marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 600, margin: '64px auto 0', padding: 24, borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border-color)' }}>
          {[
            { value: '10K+', label: 'Expenses Tracked' },
            { value: '99.9%', label: 'Uptime' },
            { value: '∞', label: 'Free Forever' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>{stat.value}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '24px', borderTop: '1px solid var(--border-color)' }}>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>
          © {new Date().getFullYear()} ExpenseIQ. Built with ❤️ for smarter spending.
        </p>
      </footer>
    </div>
  );
}
