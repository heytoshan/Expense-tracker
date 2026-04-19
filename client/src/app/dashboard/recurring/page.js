'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, Button, Input, Select, Modal, LoadingPage, EmptyState, Badge } from '@/components/ui';
import { CATEGORIES, CATEGORY_MAP, formatCurrency } from '@/lib/constants';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, RefreshCw, Pause, Play } from 'lucide-react';

const ORDINAL_SUFFIX = (n) => ['st', 'nd', 'rd'][n - 1] || 'th';

export default function RecurringPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', amount: '', category: 'food', dayOfMonth: '1', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try { setLoading(true); const { data } = await api.get('/recurring'); setExpenses(data.data.expenses); }
    catch { toast.error('Failed to fetch'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ title: '', amount: '', category: 'food', dayOfMonth: '1', notes: '' }); setModalOpen(true); };
  const openEdit = (exp) => { setEditing(exp); setForm({ title: exp.title, amount: exp.amount.toString(), category: exp.category, dayOfMonth: exp.dayOfMonth.toString(), notes: exp.notes || '' }); setModalOpen(true); };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!form.title.trim() || !form.amount || +form.amount <= 0) { toast.error('Fill in all required fields'); return; }
    setSubmitting(true);
    try {
      const payload = { title: form.title.trim(), amount: parseFloat(form.amount), category: form.category, dayOfMonth: parseInt(form.dayOfMonth), notes: form.notes.trim() };
      editing ? await api.put(`/recurring/${editing._id}`, payload) : await api.post('/recurring', payload);
      toast.success(editing ? 'Updated' : 'Created');
      setModalOpen(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSubmitting(false); }
  };

  const toggleActive = async (exp) => {
    try { await api.put(`/recurring/${exp._id}`, { isActive: !exp.isActive }); toast.success(exp.isActive ? 'Paused' : 'Activated'); load(); }
    catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this recurring expense?')) return;
    try { await api.delete(`/recurring/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const DAY_OPTS = Array.from({ length: 28 }, (_, i) => ({ value: `${i + 1}`, label: `${i + 1}${ORDINAL_SUFFIX(i + 1)} of each month` }));
  const activeCount = expenses.filter((e) => e.isActive).length;
  const monthlyTotal = expenses.filter((e) => e.isActive).reduce((s, e) => s + e.amount, 0);

  const ActionBtn = ({ icon: Icon, onClick, title, dangerHover }) => (
    <button onClick={onClick} title={title} style={{ padding: 6, borderRadius: 'var(--radius-sm)', background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', transition: 'all 0.15s ease' }}
      onMouseEnter={(e) => { e.currentTarget.style.color = dangerHover ? 'var(--danger)' : 'var(--foreground)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)'; }}>
      <Icon size={14} />
    </button>
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--foreground)' }}>Recurring Expenses</h1>
          <p style={{ fontSize: 13, marginTop: 4, color: 'var(--muted)' }}>Automatically tracked monthly expenses</p>
        </div>
        <Button onClick={openCreate} id="add-recurring"><Plus size={14} /> Add Recurring</Button>
      </div>

      {expenses.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
          {[
            { label: 'Total', value: expenses.length, color: 'var(--foreground)' },
            { label: 'Active', value: activeCount, color: 'var(--success)' },
            { label: 'Monthly Cost', value: formatCurrency(monthlyTotal), color: 'var(--primary)' },
          ].map((s) => (
            <Card key={s.label}>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>{s.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</p>
            </Card>
          ))}
        </div>
      )}

      {loading ? <LoadingPage /> : expenses.length === 0 ? (
        <EmptyState icon="🔄" title="No recurring expenses"
          description="Set up recurring expenses to auto-track subscriptions and monthly bills"
          action={<Button onClick={openCreate}><Plus size={14} /> Create Recurring Expense</Button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {expenses.map((exp) => {
            const cat = CATEGORY_MAP[exp.category];
            return (
              <Card key={exp._id} style={{ opacity: exp.isActive ? 1 : 0.6 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: `${cat?.color || '#6366f1'}14` }}>{cat?.icon || '📦'}</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{exp.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{cat?.label || exp.category}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--foreground)' }}>{formatCurrency(exp.amount)}</p>
                    <Badge variant={exp.isActive ? 'success' : 'default'}>{exp.isActive ? 'Active' : 'Paused'}</Badge>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
                    <RefreshCw size={12} />
                    <span>Every {exp.dayOfMonth}{ORDINAL_SUFFIX(exp.dayOfMonth)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    <ActionBtn icon={exp.isActive ? Pause : Play} onClick={() => toggleActive(exp)} title={exp.isActive ? 'Pause' : 'Activate'} />
                    <ActionBtn icon={Edit2} onClick={() => openEdit(exp)} title="Edit" />
                    <ActionBtn icon={Trash2} onClick={() => handleDelete(exp._id)} title="Delete" dangerHover />
                  </div>
                </div>
                {exp.notes && <p className="line-clamp-2" style={{ fontSize: 12, marginTop: 8, color: 'var(--muted)' }}>{exp.notes}</p>}
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Recurring' : 'Add Recurring Expense'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input id="rec-title" label="Title" placeholder="e.g. Netflix" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input id="rec-amount" label="Amount" type="number" step="0.01" min="0.01" placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Select id="rec-cat" label="Category" options={CATEGORIES.map((c) => ({ value: c.value, label: `${c.icon} ${c.label}` }))} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Select id="rec-day" label="Day of Month" options={DAY_OPTS} value={form.dayOfMonth} onChange={(e) => setForm({ ...form, dayOfMonth: e.target.value })} />
          <Input id="rec-notes" label="Notes (optional)" placeholder="Any notes…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div style={{ display: 'flex', gap: 12, paddingTop: 8, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting} id="rec-submit">{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
