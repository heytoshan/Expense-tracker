'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Card, LoadingPage, Badge, SkeletonCard } from '@/components/ui';
import { CATEGORY_MAP, MONTHS, formatCurrency, formatDate } from '@/lib/constants';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, IndianRupee, Receipt, AlertTriangle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const TOOLTIP_STYLE = {
  backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8',
  borderColor: '#334155', borderWidth: 1, cornerRadius: 8, padding: 10, titleFont: { size: 12 }, bodyFont: { size: 12 },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [monthly, setMonthly] = useState(null);
  const [categories, setCategories] = useState(null);
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [recent, setRecent] = useState([]);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  
  const years = Array.from({ length: 10 }, (_, i) => now.getFullYear() - i);

  useEffect(() => { load(); }, [selectedMonth, selectedYear]);

  const load = async () => {
    try {
      const [mRes, cRes, bRes, eRes] = await Promise.all([
        api.get('/analytics/monthly', { params: { year: selectedYear } }),
        api.get('/analytics/category', { params: { month: selectedMonth, year: selectedYear } }),
        api.get('/budgets/status', { params: { month: selectedMonth, year: selectedYear } }),
        api.get('/expenses', { params: { limit: 5, sortBy: 'date', sortOrder: 'desc' } }),
      ]);
      setMonthly(mRes.data.data);
      setCategories(cRes.data.data);
      setBudgetStatus(bRes.data.data);
      setRecent(eRes.data.data.expenses);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div className="skeleton" style={{ height: 28, width: 240, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 16, width: 320 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </div>
    );
  }

  const thisMonth = monthly?.months?.[selectedMonth - 1]?.total || 0;
  const lastMonth = selectedMonth > 1 ? (monthly?.months?.[selectedMonth - 2]?.total || 0) : 0;
  const monthChange = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0;
  const exceeded = budgetStatus?.status?.filter((b) => b.exceeded) || [];
  const catColors = categories?.categories?.map((c) => CATEGORY_MAP[c.category]?.color || '#6366f1') || [];

  // Bar chart
  const barData = {
    labels: MONTHS,
    datasets: [{
      label: 'Monthly Spending',
      data: monthly?.months?.map((m) => m.total) || [],
      backgroundColor: 'rgba(99,102,241,0.5)',
      borderColor: '#6366f1', borderWidth: 1, borderRadius: 6, borderSkipped: false
    }]
  };
  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { ...TOOLTIP_STYLE, callbacks: { label: (c) => formatCurrency(c.raw) } } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.08)' }, ticks: { color: '#94a3b8', font: { size: 11 }, callback: (v) => `₹${v}` } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 }, maxRotation: 45 } }
    }
  };

  // Pie chart
  const pieData = {
    labels: categories?.categories?.map((c) => CATEGORY_MAP[c.category]?.label || c.category) || [],
    datasets: [{
      data: categories?.categories?.map((c) => c.total) || [],
      backgroundColor: catColors.map((c) => `${c}cc`),
      borderColor: catColors, borderWidth: 1, hoverOffset: 4
    }]
  };
  const pieOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12, usePointStyle: true, pointStyleWidth: 8, font: { size: 11 } } },
      tooltip: { ...TOOLTIP_STYLE, callbacks: { label: (c) => `${c.label}: ${formatCurrency(c.raw)}` } }
    }
  };

  const StatCard = ({ icon: Icon, label, value, sub, subColor }) => (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--muted)', fontSize: 13 }}>
        <Icon size={16} /><span>{label}</span>
      </div>
      <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--foreground)' }}>{value}</p>
      {sub && <p style={{ fontSize: 13, marginTop: 8, color: subColor || 'var(--muted)' }}>{sub}</p>}
    </Card>
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Greeting */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--foreground)' }}>
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
            Financial overview for {MONTHS[selectedMonth - 1]} {selectedYear}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            style={selectStyle}
          >
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={selectStyle}
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Stat grid */}
      <div className="responsive-grid">
        <StatCard icon={IndianRupee} label="This Month" value={formatCurrency(thisMonth)}
          sub={<span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {monthChange <= 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
            {Math.abs(monthChange)}% vs last month
          </span>}
          subColor={monthChange <= 0 ? 'var(--success)' : 'var(--danger)'} />

        <StatCard icon={Receipt} label="Year Total" value={formatCurrency(monthly?.yearTotal || 0)}
          sub={`${selectedYear} so far`} />

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--muted)', fontSize: 13 }}>
            <TrendingUp size={16} /><span>Top Category</span>
          </div>
          {categories?.categories?.[0] ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{CATEGORY_MAP[categories.categories[0].category]?.icon}</span>
                <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)' }}>
                  {CATEGORY_MAP[categories.categories[0].category]?.label}
                </p>
              </div>
              <p style={{ fontSize: 13, marginTop: 8, color: 'var(--muted)' }}>
                {formatCurrency(categories.categories[0].total)} ({categories.categories[0].percentage}%)
              </p>
            </>
          ) : <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--muted)' }}>None</p>}
        </Card>

        <Card style={{ borderColor: exceeded.length ? 'color-mix(in srgb, var(--danger) 25%, transparent)' : undefined }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--muted)', fontSize: 13 }}>
            <AlertTriangle size={16} /><span>Budget Alerts</span>
          </div>
          <p style={{ fontSize: 24, fontWeight: 700, color: exceeded.length ? 'var(--danger)' : 'var(--success)' }}>
            {exceeded.length > 0 ? exceeded.length : '✓'}
          </p>
          <p style={{ fontSize: 13, marginTop: 8, color: exceeded.length ? 'var(--danger)' : 'var(--success)' }}>
            {exceeded.length > 0 ? 'budgets exceeded' : 'All on track'}
          </p>
        </Card>
      </div>

      {/* Budget warnings */}
      {exceeded.length > 0 && (
        <div style={{ borderRadius: 'var(--radius-md)', padding: 20, background: 'color-mix(in srgb, var(--danger) 4%, transparent)', border: '1px solid color-mix(in srgb, var(--danger) 15%, transparent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />
            <h3 style={{ fontWeight: 600, color: 'var(--danger)', fontSize: 14 }}>Budget Exceeded</h3>
          </div>
          <div className="responsive-grid" style={{ gap: 12 }}>
            {exceeded.map((b) => (
              <div key={b.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 'var(--radius-sm)', padding: 12, background: 'var(--surface)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{CATEGORY_MAP[b.category]?.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)' }}>{CATEGORY_MAP[b.category]?.label}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)' }}>{formatCurrency(b.spent)}</p>
                  <p style={{ fontSize: 11, color: 'var(--muted)' }}>of {formatCurrency(b.budgeted)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div style={{ display: 'grid', gap: 16 }} className="lg:grid-cols-[2fr_1fr] grid-cols-1">
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)' }}>Monthly Spending</h2>
            <Badge variant="primary">{selectedYear}</Badge>
          </div>
          <div style={{ height: 260 }}><Bar data={barData} options={barOpts} /></div>
        </Card>

        <Card>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 20 }}>Category Breakdown</h2>
          <div style={{ height: 260 }}>
            {categories?.categories?.length > 0
              ? <Pie data={pieData} options={pieOpts} />
              : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 13, color: 'var(--muted)' }}>No data this month</div>}
          </div>
        </Card>
      </div>

      {/* Recent expenses */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)' }}>Recent Expenses</h2>
          <Link href="/dashboard/expenses" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', textDecoration: 'none' }}>
            View all <ArrowUpRight size={14} />
          </Link>
        </div>
        {recent.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recent.map((exp) => {
              const cat = CATEGORY_MAP[exp.category];
              return (
                <div key={exp._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12,
                  borderRadius: 'var(--radius-sm)', background: 'var(--background)', border: '1px solid var(--border-color)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, background: `${cat?.color || '#6366f1'}14` }}>
                      {cat?.icon || '📦'}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)' }}>{exp.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--muted)' }}>{cat?.label} · {formatDate(exp.date)}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>{formatCurrency(exp.amount)}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ textAlign: 'center', padding: 32, color: 'var(--muted)', fontSize: 13 }}>No expenses yet. Start tracking!</p>
        )}
      </Card>
    </div>
  );
}
const thStyle = { padding: '12px 24px', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' };
const tdStyle = { padding: '16px 24px', verticalAlign: 'middle' };
const selectStyle = {
  padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: 13, background: 'var(--surface)',
  border: '1px solid var(--border-color)', color: 'var(--foreground)', cursor: 'pointer', outline: 'none'
};
