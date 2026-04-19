'use client';

// ─── Spinner ────────────────────────────────────────────────────────────────
export function LoadingSpinner({ size = 'md' }) {
  const px = { sm: 16, md: 24, lg: 32 }[size];
  const border = { sm: 2, md: 2, lg: 3 }[size];
  return (
    <div
      className="animate-spin rounded-full flex-shrink-0"
      style={{
        width: px,
        height: px,
        border: `${border}px solid var(--border-color)`,
        borderTopColor: 'var(--primary)',
      }}
    />
  );
}

// ─── Full-page loader ────────────────────────────────────────────────────────
export function LoadingPage() {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: '40vh' }}>
      <div className="flex flex-col items-center" style={{ gap: 12 }}>
        <LoadingSpinner size="lg" />
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center" style={{ padding: '64px 16px' }}>
      {icon && <div style={{ fontSize: 40, marginBottom: 16 }}>{icon}</div>}
      <h3 className="font-semibold" style={{ fontSize: 16, color: 'var(--foreground)', marginBottom: 8 }}>{title}</h3>
      <p className="text-sm" style={{ color: 'var(--muted)', maxWidth: 360, marginBottom: 24 }}>{description}</p>
      {action}
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', hover = false, style }) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: 24,
        transition: hover ? 'border-color 0.2s ease' : undefined,
        ...style,
      }}
      onMouseEnter={hover ? (e) => { e.currentTarget.style.borderColor = 'var(--muted)'; } : undefined}
      onMouseLeave={hover ? (e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; } : undefined}
    >
      {children}
    </div>
  );
}

// ─── Button ──────────────────────────────────────────────────────────────────
const VARIANT_STYLES = {
  primary:   { background: 'var(--primary)', color: '#fff', border: '1px solid var(--primary)' },
  secondary: { background: 'var(--surface)', color: 'var(--foreground)', border: '1px solid var(--border-color)' },
  danger:    { background: 'var(--danger)', color: '#fff', border: '1px solid var(--danger)' },
  ghost:     { background: 'transparent', color: 'var(--muted)', border: '1px solid transparent' },
  outline:   { background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border-color)' },
};

const SIZE_STYLES = {
  sm: { padding: '6px 12px', fontSize: 12, gap: 6 },
  md: { padding: '8px 16px', fontSize: 13, gap: 8 },
  lg: { padding: '10px 20px', fontSize: 14, gap: 8 },
};

export function Button({
  children, variant = 'primary', size = 'md',
  className = '', disabled = false, loading = false, style, ...props
}) {
  return (
    <button
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-sm)',
        fontWeight: 500,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.5 : 1,
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
        lineHeight: 1,
        ...VARIANT_STYLES[variant],
        ...SIZE_STYLES[size],
        ...style,
      }}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────
export function Input({ label, error, className = '', id, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)' }}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={className}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          fontSize: 13,
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border-color)'}`,
          outline: 'none',
          transition: 'border-color 0.2s ease',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
        onBlur={(e) => { e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border-color)'; }}
        {...props}
      />
      {error && <p style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</p>}
    </div>
  );
}

// ─── Select ──────────────────────────────────────────────────────────────────
export function Select({ label, error, options = [], className = '', id, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)' }}>
          {label}
        </label>
      )}
      <select
        id={id}
        className={className}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          fontSize: 13,
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border-color)'}`,
          outline: 'none',
          cursor: 'pointer',
          transition: 'border-color 0.2s ease',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
        onBlur={(e) => { e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border-color)'; }}
        {...props}
      >
        {options.map(({ value, label: optLabel }) => (
          <option key={value} value={value}>{optLabel}</option>
        ))}
      </select>
      {error && <p style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</p>}
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />
      <div
        className="animate-fade-in"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-md)',
          background: 'var(--surface)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--foreground)' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              padding: 4,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'transparent',
              color: 'var(--muted)',
              cursor: 'pointer',
              fontSize: 16,
              lineHeight: 1,
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--foreground)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)'; }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
const BADGE_STYLES = {
  default: { background: 'var(--surface-hover)', color: 'var(--muted)' },
  success: { background: 'color-mix(in srgb, var(--success) 12%, transparent)', color: 'var(--success)' },
  warning: { background: 'color-mix(in srgb, var(--warning) 12%, transparent)', color: 'var(--warning)' },
  danger:  { background: 'color-mix(in srgb, var(--danger) 12%, transparent)', color: 'var(--danger)' },
  primary: { background: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' },
};

export function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 500,
        lineHeight: 1.4,
        ...BADGE_STYLES[variant],
      }}
    >
      {children}
    </span>
  );
}

// ─── Skeleton card ───────────────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div style={{ borderRadius: 'var(--radius-md)', padding: 24, background: 'var(--surface)', border: '1px solid var(--border-color)' }}>
      <div className="skeleton" style={{ height: 14, width: '75%', marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 24, width: '50%', marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 10, width: '100%' }} />
    </div>
  );
}
