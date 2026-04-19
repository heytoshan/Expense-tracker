'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, Select, LoadingPage, Badge } from '@/components/ui';
import { CATEGORY_MAP, MONTHS, formatCurrency } from '@/lib/constants';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const TOOLTIP_STYLE = { backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: '#334155', borderWidth: 1, cornerRadius: 8, padding: 10, titleFont: { size: 12 }, bodyFont: { size: 12 } };

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [monthly, setMonthly] = useState(null);
  const [categories, setCategories] = useState(null);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => { load(); }, [month, year]);

  const load = async () => {
    try {
      setLoading(true);
      const [mRes, cRes] = await Promise.all([
        api.get('/analytics/monthly', { params: { year } }),
        api.get('/analytics/category', { params: { month, year } }),
      ]);
      setMonthly(mRes.data.data);
      setCategories(cRes.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const MONTH_OPTS = MONTHS.map((m, i) => ({ value: i + 1, label: m }));
  const YEAR_OPTS = Array.from({ length: 5 }, (_, i) => { const y = now.getFullYear() - 2 + i; return { value: y, label: y.toString() }; });

  if (loading) return <LoadingPage />;

  const thisMonth = monthly?.months?.[month - 1];
  const prevMonth = monthly?.months?.[month - 2];
  const change = prevMonth?.total > 0 ? Math.round(((thisMonth?.total - prevMonth.total) / prevMonth.total) * 100) : 0;

  // Bar
  const barData = {
    labels: MONTHS,
    datasets: [{
      label: `Spending ${year}`,
      data: monthly?.months?.map((m) => m.total) || [],
      backgroundColor: monthly?.months?.map((_, i) => i === month - 1 ? 'rgba(99,102,241,0.7)' : 'rgba(99,102,241,0.25)') || [],
      borderColor: '#6366f1', borderWidth: 1, borderRadius: 6, borderSkipped: false
    }]
  };
  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { ...TOOLTIP_STYLE, callbacks: { label: (c) => formatCurrency(c.raw) } } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.08)' }, ticks: { color: '#94a3b8', font: { size: 11 }, callback: (v) => `$${v}` } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 }, maxRotation: 45 } }
    }
  };

  // Line
  let cum = 0;
  const cumData = (monthly?.months || []).map((m) => { cum += m.total; return cum; });
  const lineData = {
    labels: MONTHS,
    datasets: [{ label: 'Cumulative', data: cumData, borderColor: '#22d3ee', backgroundColor: 'rgba(34,211,238,0.06)', fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#22d3ee', pointBorderColor: 'var(--background)', pointBorderWidth: 2 }]
  };
  const lineOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { ...TOOLTIP_STYLE, callbacks: { label: (c) => formatCurrency(c.raw) } } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.08)' }, ticks: { color: '#94a3b8', font: { size: 11 }, callback: (v) => `$${v}` } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 }, maxRotation: 45 } }
    }
  };

  // Pie
  const catColors = categories?.categories?.map((c) => CATEGORY_MAP[c.category]?.color || '#6366f1') || [];
  const pieData = {
    labels: categories?.categories?.map((c) => CATEGORY_MAP[c.category]?.label || c.category) || [],
    datasets: [{ data: categories?.categories?.map((c) => c.total) || [], backgroundColor: catColors.map((c) => `${c}cc`), borderColor: catColors, borderWidth: 1, hoverOffset: 4 }]
  };
  const pieOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#94a3b8', padding: 12, usePointStyle: true, pointStyleWidth: 8, font: { size: 11 } } },
      tooltip: { ...TOOLTIP_STYLE, callbacks: { label: (c) => `${c.label}: ${formatCurrency(c.raw)}` } }
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--foreground)' }}>Analytics</h1>
        <p style={{ fontSize: 13, marginTop: 4, color: 'var(--muted)' }}>Deep dive into your spending patterns</p>
      </div>

      <Card>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 160 }}><Select id="analytics-month" label="Month" options={MONTH_OPTS} value={month} onChange={(e) => setMonth(+e.target.value)} /></div>
          <div style={{ minWidth: 120 }}><Select id="analytics-year" label="Year" options={YEAR_OPTS} value={year} onChange={(e) => setYear(+e.target.value)} /></div>
        </div>
      </Card>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--muted)', fontSize: 13 }}><Calendar size={16} /><span>{MONTHS[month - 1]} Total</span></div>
          <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--foreground)' }}>{formatCurrency(thisMonth?.total || 0)}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 13, color: change <= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {change <= 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
            <span>{Math.abs(change)}% vs prev month</span>
          </div>
        </Card>
        <Card>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>Transactions</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--foreground)' }}>{thisMonth?.count || 0}</p>
          <p style={{ fontSize: 13, marginTop: 8, color: 'var(--muted)' }}>Avg: {formatCurrency(thisMonth?.count > 0 ? thisMonth.total / thisMonth.count : 0)}</p>
        </Card>
        <Card>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>Year Total</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--foreground)' }}>{formatCurrency(monthly?.yearTotal || 0)}</p>
          <p style={{ fontSize: 13, marginTop: 8, color: 'var(--muted)' }}>{year}</p>
        </Card>
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        <Card>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 20 }}>Monthly Trend</h2>
          <div style={{ height: 280 }}><Bar data={barData} options={barOpts} /></div>
        </Card>
        <Card>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 20 }}>Cumulative Spending</h2>
          <div style={{ height: 280 }}><Line data={lineData} options={lineOpts} /></div>
        </Card>
      </div>

      {/* Pie + Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 16 }} className="max-lg:grid-cols-1">
        <Card>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 20 }}>
            Category Breakdown — {MONTHS[month - 1]}
          </h2>
          <div style={{ height: 280 }}>
            {categories?.categories?.length > 0
              ? <Pie data={pieData} options={pieOpts} />
              : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 13, color: 'var(--muted)' }}>No data</div>}
          </div>
        </Card>

        <Card>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 20 }}>Category Details</h2>
          {categories?.categories?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto' }}>
              {categories.categories.map((cat) => {
                const info = CATEGORY_MAP[cat.category];
                return (
                  <div key={cat.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 'var(--radius-sm)', background: 'var(--background)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, background: `${info?.color || '#6366f1'}14` }}>
                        {info?.icon || '📦'}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)' }}>{info?.label || cat.category}</p>
                        <p style={{ fontSize: 12, color: 'var(--muted)' }}>{cat.count} transactions</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{formatCurrency(cat.total)}</p>
                      <Badge variant="primary">{cat.percentage}%</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)', fontSize: 13 }}>No data available</div>
          )}
        </Card>
      </div>
    </div>
  );
}
