'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button, Input } from '@/components/ui';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, ChevronLeft } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPass] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { signup, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => { if (isAuthenticated) router.push('/dashboard'); }, [isAuthenticated, router]);

  const validate = () => {
    const e = {};
    if (!name || name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!email) e.email = 'Email is required';
    if (!password || password.length < 6) e.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) e.confirm = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(name, email, password);
      toast.success('Account created!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0] || 'Signup failed');
    } finally { setLoading(false); }
  };

  // Password strength
  const getStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return { level: score, label: 'Weak', color: 'var(--danger)' };
    if (score <= 3) return { level: score, label: 'Fair', color: 'var(--warning)' };
    return { level: score, label: 'Strong', color: 'var(--success)' };
  };
  const strength = getStrength();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Back to home */}
        <Link
          href="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24,
            fontSize: 13, color: 'var(--muted)', textDecoration: 'none',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--foreground)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)'; }}
        >
          <ChevronLeft size={15} /> Back to home
        </Link>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>E</span>
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--foreground)' }}>ExpenseIQ</span>
        </div>

        {/* Header */}
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--foreground)', marginBottom: 8 }}>
          Create your account
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>
          Free forever. No credit card required.
        </p>

        {/* Form */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 24 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input id="signup-name" label="Full Name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} autoComplete="name" />
            <Input id="signup-email" label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoComplete="email" />

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="signup-pwd"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  style={{
                    width: '100%', padding: '10px 40px 10px 14px', borderRadius: 'var(--radius-sm)', fontSize: 13,
                    background: 'var(--background)', color: 'var(--foreground)',
                    border: `1px solid ${errors.password ? 'var(--danger)' : 'var(--border-color)'}`,
                    outline: 'none', transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                  onBlur={(e) => { e.target.style.borderColor = errors.password ? 'var(--danger)' : 'var(--border-color)'; }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', padding: 2, background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: 12, color: 'var(--danger)' }}>{errors.password}</p>}
              {password && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <div style={{ flex: 1, display: 'flex', gap: 3 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= strength.level ? strength.color : 'var(--border-color)', transition: 'background 0.2s ease' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500, color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <Input id="signup-confirm" label="Confirm Password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPass(e.target.value)} error={errors.confirm} autoComplete="new-password" />

            <Button type="submit" size="lg" loading={loading} id="signup-submit" style={{ width: '100%', marginTop: 4 }}>
              Create Account
              <ArrowRight size={16} style={{ marginLeft: 4 }} />
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>Already have an account? </span>
          <Link href="/login" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
