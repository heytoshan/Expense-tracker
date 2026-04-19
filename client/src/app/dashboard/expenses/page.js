'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { Card, Button, Input, Select, Modal, LoadingPage, EmptyState, Badge } from '@/components/ui';
import { CATEGORIES, CATEGORY_MAP, formatCurrency, formatDate } from '@/lib/constants';
import toast from 'react-hot-toast';
import { Plus, Search, Filter, Edit2, Trash2, Download, Upload, ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  ...CATEGORIES.map((c) => ({ value: c.value, label: `${c.icon} ${c.label}` }))
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', amount: '', category: 'food', date: '', notes: '' });
  const [formErrs, setFormErrs] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Import state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  const fetchExpenses = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 10, sortBy: 'date', sortOrder: 'desc' };
      if (search) params.search = search;
      if (catFilter) params.category = catFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const { data } = await api.get('/expenses', { params });
      setExpenses(data.data.expenses);
      setPagination(data.data.pagination);
    } catch { toast.error('Failed to fetch expenses'); }
    finally { setLoading(false); }
  }, [search, catFilter, startDate, endDate]);

  useEffect(() => {
    const t = setTimeout(() => fetchExpenses(1), 300);
    return () => clearTimeout(t);
  }, [fetchExpenses]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', amount: '', category: 'food', date: new Date().toISOString().split('T')[0], notes: '' });
    setFormErrs({});
    setModalOpen(true);
  };

  const openEdit = (exp) => {
    setEditing(exp);
    setForm({ title: exp.title, amount: exp.amount.toString(), category: exp.category, date: new Date(exp.date).toISOString().split('T')[0], notes: exp.notes || '' });
    setFormErrs({});
    setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.amount || +form.amount <= 0) e.amount = 'Valid amount required';
    if (!form.date) e.date = 'Date is required';
    setFormErrs(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { title: form.title.trim(), amount: parseFloat(form.amount), category: form.category, date: form.date, notes: form.notes.trim() };
      editing ? await api.put(`/expenses/${editing._id}`, payload) : await api.post('/expenses', payload);
      toast.success(editing ? 'Expense updated' : 'Expense added');
      setModalOpen(false);
      fetchExpenses(pagination.page);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try { await api.delete(`/expenses/${id}`); toast.success('Deleted'); fetchExpenses(pagination.page); }
    catch { toast.error('Failed to delete'); }
  };

  const handleExport = async () => {
    try {
      const params = {};
      if (catFilter) params.category = catFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const { data } = await api.get('/expenses/export', { params, responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([data]));
      Object.assign(document.createElement('a'), { href: url, download: 'expenses.csv' }).click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported!');
    } catch { toast.error('Export failed'); }
  };

  const handleImport = async (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/expenses/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportResult(data.data);
      toast.success(data.message);
      fetchExpenses(1);
    } catch (err) {
      const msg = err.response?.data?.message || 'Import failed';
      toast.error(msg);
      setImportResult({ error: msg });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--foreground)' }}>Expenses</h1>
          <p style={{ fontSize: 13, marginTop: 4, color: 'var(--muted)' }}>{pagination.total} total</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={() => { setImportResult(null); setImportModalOpen(true); }} id="import-expenses"><Upload size={14} /> Import</Button>
          <Button variant="secondary" onClick={handleExport} id="export-expenses"><Download size={14} /> Export CSV</Button>
          <Button onClick={openCreate} id="add-expense"><Plus size={14} /> Add Expense</Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input id="search-expenses" type="text" placeholder="Search expenses…" value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 'var(--radius-sm)', fontSize: 13, outline: 'none', background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--border-color)', transition: 'border-color 0.2s ease' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; }}
            />
          </div>
          <Button variant={showFilters ? 'primary' : 'secondary'} onClick={() => setShowFilters(!showFilters)} id="toggle-filters">
            <Filter size={14} /> Filters
          </Button>
        </div>

        {showFilters && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            <Select id="filter-category" label="Category" options={CATEGORY_OPTIONS} value={catFilter} onChange={(e) => setCatFilter(e.target.value)} />
            <Input id="filter-start" label="From" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input id="filter-end" label="To" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: '1 / -1', justifyContent: 'flex-end' }}>
              <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setCatFilter(''); setStartDate(''); setEndDate(''); }}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* List */}
      {loading ? <LoadingPage /> : expenses.length === 0 ? (
        <EmptyState icon="🧾" title="No expenses found"
          description={search || catFilter ? 'Try adjusting your filters' : 'Add your first expense to get started'}
          action={!search && !catFilter && <Button onClick={openCreate}><Plus size={14} /> Add Expense</Button>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {expenses.map((exp) => {
            const cat = CATEGORY_MAP[exp.category];
            return (
              <div key={exp._id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px',
                borderRadius: 'var(--radius-sm)', background: 'var(--surface)', border: '1px solid var(--border-color)', transition: 'border-color 0.15s ease',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--muted)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, background: `${cat?.color || '#6366f1'}14` }}>
                    {cat?.icon || '📦'}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)' }}>{exp.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                      <Badge variant="primary">{cat?.label || exp.category}</Badge>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{formatDate(exp.date)}</span>
                    </div>
                    {exp.notes && <p className="line-clamp-1" style={{ fontSize: 12, marginTop: 2, color: 'var(--muted)' }}>{exp.notes}</p>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>{formatCurrency(exp.amount)}</p>
                  <button onClick={() => openEdit(exp)} title="Edit" style={{ padding: 6, borderRadius: 'var(--radius-sm)', background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', transition: 'all 0.15s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--foreground)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(exp._id)} title="Delete" style={{ padding: 6, borderRadius: 'var(--radius-sm)', background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', transition: 'all 0.15s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in srgb, var(--danger) 8%, transparent)'; e.currentTarget.style.color = 'var(--danger)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Button variant="secondary" size="sm" disabled={pagination.page <= 1} onClick={() => fetchExpenses(pagination.page - 1)}>
            <ChevronLeft size={14} /> Prev
          </Button>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>Page {pagination.page} of {pagination.pages}</span>
          <Button variant="secondary" size="sm" disabled={pagination.page >= pagination.pages} onClick={() => fetchExpenses(pagination.page + 1)}>
            Next <ChevronRight size={14} />
          </Button>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Expense' : 'Add Expense'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input id="exp-title" label="Title" placeholder="e.g. Lunch at Cafe" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} error={formErrs.title} />
          <Input id="exp-amount" label="Amount" type="number" step="0.01" min="0.01" placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} error={formErrs.amount} />
          <Select id="exp-cat" label="Category" options={CATEGORIES.map((c) => ({ value: c.value, label: `${c.icon} ${c.label}` }))} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input id="exp-date" label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} error={formErrs.date} />
          <Input id="exp-notes" label="Notes (optional)" placeholder="Any additional notes…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div style={{ display: 'flex', gap: 12, paddingTop: 8, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting} id="exp-submit">{editing ? 'Update' : 'Add Expense'}</Button>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} title="Import Expenses">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
            Upload an Excel (.xlsx) or CSV file. Your file should have columns like:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['Title', 'Amount', 'Category', 'Date', 'Notes'].map((col) => (
              <span key={col} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)' }}>
                {col}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>
            Only Title and Amount are required. Categories will be auto-detected. Unknown categories default to &quot;Other&quot;.
          </p>

          {/* File input */}
          <div style={{ padding: 24, borderRadius: 'var(--radius-sm)', border: '2px dashed var(--border-color)', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s ease' }}
            onClick={() => fileInputRef.current?.click()}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          >
            <Upload size={24} style={{ color: 'var(--muted)', margin: '0 auto 8px' }} />
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)' }}>
              {importing ? 'Importing…' : 'Click to select file'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>.xlsx, .xls, or .csv (max 5MB)</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleImport}
            style={{ display: 'none' }}
          />

          {/* Import result */}
          {importResult && !importResult.error && (
            <div style={{ padding: 16, borderRadius: 'var(--radius-sm)', background: 'color-mix(in srgb, var(--success) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--success) 20%, transparent)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)', marginBottom: 8 }}>Import Complete</p>
              <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                <span style={{ color: 'var(--foreground)' }}><strong>{importResult.imported}</strong> imported</span>
                {importResult.skipped > 0 && <span style={{ color: 'var(--warning)' }}><strong>{importResult.skipped}</strong> skipped</span>}
              </div>
              {importResult.errors?.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  {importResult.errors.map((err, i) => (
                    <p key={i} style={{ fontSize: 12, color: 'var(--muted)' }}>{err}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {importResult?.error && (
            <div style={{ padding: 16, borderRadius: 'var(--radius-sm)', background: 'color-mix(in srgb, var(--danger) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--danger) 20%, transparent)' }}>
              <p style={{ fontSize: 13, color: 'var(--danger)' }}>{importResult.error}</p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
            <Button variant="secondary" onClick={() => setImportModalOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
