'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, Button, Input, Select, Modal, LoadingPage, EmptyState, Badge } from '@/components/ui';
import { CATEGORIES, CATEGORY_MAP, MONTHS, formatCurrency } from '@/lib/constants';
import toast from 'react-hot-toast';
import { Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

export default function BudgetsPage() {
  const [status, setStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ category: 'food', amount: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/budgets/status', { params: { month, year } });
      setStatus(data.data.status || []);
    } catch { toast.error('Failed to fetch budgets'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBudgets(); }, [month, year]);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!form.amount || +form.amount <= 0) { toast.error('Enter a valid amount'); return; }
    setSubmitting(true);
    try {
      await api.post('/budgets', { category: form.category, amount: parseFloat(form.amount), month, year });
      toast.success('Budget saved');
      setModalOpen(false);
      setForm({ category: 'food', amount: '' });
      fetchBudgets();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (cat) => {
    try {
      const { data } = await api.get('/budgets', { params: { month, year } });
      const budget = data.data.budgets.find((b) => b.category === cat);
      if (budget) { await api.delete(`/budgets/${budget._id}`); toast.success('Budget deleted'); fetchBudgets(); }
    } catch { toast.error('Failed to delete'); }
  };

  const MONTH_OPTS = MONTHS.map((m, i) => ({ value: i + 1, label: m }));
  const YEAR_OPTS = Array.from({ length: 5 }, (_, i) => { const y = now.getFullYear() - 2 + i; return { value: y, label: y.toString() }; });

  const totalBudgeted = status.reduce((s, b) => s + b.budgeted, 0);
  const totalSpent = status.reduce((s, b) => s + b.spent, 0);
  const exceeded = status.filter((b) => b.exceeded).length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--foreground)' }}>Budgets</h1>
          <p style={{ fontSize: 13, marginTop: 4, color: 'var(--muted)' }}>Set spending limits per category</p>
        </div>
        <Button onClick={() => setModalOpen(true)} id="add-budget"><Plus size={14} /> Set Budget</Button>
      </div>

      {/* Month/year pickers */}
      <Card>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 160 }}><Select id="budget-month" label="Month" options={MONTH_OPTS} value={month} onChange={(e) => setMonth(+e.target.value)} /></div>
          <div style={{ minWidth: 120 }}><Select id="budget-year" label="Year" options={YEAR_OPTS} value={year} onChange={(e) => setYear(+e.target.value)} /></div>
        </div>
      </Card>

      {/* Summary */}
      {status.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
          <Card>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>Total Budgeted</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--foreground)' }}>{formatCurrency(totalBudgeted)}</p>
          </Card>
          <Card>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>Total Spent</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--foreground)' }}>{formatCurrency(totalSpent)}</p>
          </Card>
          <Card>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>Status</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {exceeded > 0
                ? <><AlertTriangle size={18} style={{ color: 'var(--danger)' }} /><span style={{ fontSize: 16, fontWeight: 700, color: 'var(--danger)' }}>{exceeded} exceeded</span></>
                : <><CheckCircle size={18} style={{ color: 'var(--success)' }} /><span style={{ fontSize: 16, fontWeight: 700, color: 'var(--success)' }}>All on track</span></>
              }
            </div>
          </Card>
        </div>
      )}

      {/* Budget cards */}
      {loading ? <LoadingPage /> : status.length === 0 ? (
        <EmptyState icon="💰" title="No budgets set" description={`Set your first budget for ${MONTHS[month - 1]} ${year}`}
          action={<Button onClick={() => setModalOpen(true)}><Plus size={14} /> Set a Budget</Button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {status.map((b) => {
            const cat = CATEGORY_MAP[b.category];
            const pct = Math.min(b.percentage, 100);
            const barBg = b.exceeded ? 'var(--danger)' : b.percentage > 80 ? 'var(--warning)' : 'var(--success)';
            const bVariant = b.exceeded ? 'danger' : b.percentage > 80 ? 'warning' : 'success';
            return (
              <Card key={b.category} style={{ borderColor: b.exceeded ? 'color-mix(in srgb, var(--danger) 20%, transparent)' : undefined }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: `${cat?.color || '#6366f1'}14` }}>
                      {cat?.icon || '📦'}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{cat?.label || b.category}</p>
                      <p style={{ fontSize: 12, color: 'var(--muted)' }}>{formatCurrency(b.spent)} of {formatCurrency(b.budgeted)}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Badge variant={bVariant}>{b.percentage}%</Badge>
                    <button onClick={() => handleDelete(b.category)} title="Delete" style={{ padding: 6, borderRadius: 'var(--radius-sm)', background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', transition: 'all 0.15s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)'; }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {/* Progress */}
                <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'var(--surface-hover)', overflow: 'hidden' }}>
                  <div className="progress-bar" style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: barBg }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {b.remaining >= 0 ? `${formatCurrency(b.remaining)} remaining` : `${formatCurrency(Math.abs(b.remaining))} over budget`}
                  </span>
                  {b.exceeded && (
                    <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--danger)' }}>
                      <AlertTriangle size={12} /> Exceeded
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Set Budget">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Select id="budget-cat" label="Category" options={CATEGORIES.map((c) => ({ value: c.value, label: `${c.icon} ${c.label}` }))}
            value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input id="budget-amount" label="Budget Amount" type="number" step="0.01" min="0.01" placeholder="Enter monthly budget…"
            value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>
            For {MONTHS[month - 1]} {year}. Existing budget for this category will be overwritten.
          </p>
          <div style={{ display: 'flex', gap: 12, paddingTop: 8, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting} id="budget-submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
