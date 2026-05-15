import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const upd = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email) => setForm({ email, password: 'password123' });

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.dot} />
          Taskflow
        </div>
        <h1 style={styles.title}>Sign in to your account</h1>
        <p style={styles.sub}>Team task management, simplified.</p>

        <form onSubmit={handleSubmit} style={{ marginTop: '1.75rem' }}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              className="form-input"
              type="email"
              value={form.email}
              onChange={upd('email')}
              placeholder="your@email.com"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={form.password}
              onChange={upd('password')}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="form-error" style={{ marginBottom: '1rem' }}>{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div style={styles.divider}><span>Demo accounts</span></div>
        <div style={styles.demoGrid}>
          {[
            { label: 'Admin', email: 'alex@example.com' },
            { label: 'Member', email: 'sam@example.com' },
            { label: 'Member', email: 'jordan@example.com' },
            { label: 'Member', email: 'casey@example.com' },
          ].map(d => (
            <button key={d.email} style={styles.demoBtn} onClick={() => fillDemo(d.email)}>
              <span style={styles.demoRole}>{d.label}</span>
              <span style={styles.demoEmail}>{d.email}</span>
            </button>
          ))}
        </div>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--blue)' }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '1rem' },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '2.5rem', width: 420, maxWidth: '100%' },
  logo: { fontSize: 20, fontWeight: 700, letterSpacing: -0.5, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)' },
  dot: { width: 9, height: 9, borderRadius: '50%', background: 'var(--blue)', display: 'inline-block', flexShrink: 0 },
  title: { fontSize: 20, fontWeight: 600, letterSpacing: -0.4 },
  sub: { fontSize: 13, color: 'var(--text2)', marginTop: 4 },
  divider: { textAlign: 'center', margin: '1.5rem 0 1rem', position: 'relative', color: 'var(--text3)', fontSize: 11, letterSpacing: '.5px', textTransform: 'uppercase', borderTop: '1px solid var(--border)', paddingTop: '1rem' },
  demoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  demoBtn: { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', textAlign: 'left', transition: 'border-color .15s', fontFamily: 'inherit' },
  demoRole: { display: 'block', fontSize: 10, color: 'var(--blue)', fontWeight: 600, letterSpacing: '.3px', textTransform: 'uppercase', marginBottom: 2 },
  demoEmail: { display: 'block', fontSize: 11, color: 'var(--text2)' },
  footer: { textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: '1.25rem' },
};
