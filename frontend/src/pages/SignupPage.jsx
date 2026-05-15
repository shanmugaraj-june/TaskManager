import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const upd = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError('');
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.logo}><span style={styles.dot} />Taskflow</div>
        <h1 style={styles.title}>Create your account</h1>
        <p style={styles.sub}>Start managing tasks with your team.</p>

        <form onSubmit={handleSubmit} style={{ marginTop: '1.75rem' }}>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input className="form-input" value={form.name} onChange={upd('name')} placeholder="Your name" required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" value={form.email} onChange={upd('email')} placeholder="your@email.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password} onChange={upd('password')} placeholder="Min 8 characters" required />
          </div>
          {error && <p className="form-error" style={{ marginBottom: '1rem' }}>{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--blue)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '1rem' },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '2.5rem', width: 420, maxWidth: '100%' },
  logo: { fontSize: 20, fontWeight: 700, letterSpacing: -0.5, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 },
  dot: { width: 9, height: 9, borderRadius: '50%', background: 'var(--blue)', display: 'inline-block' },
  title: { fontSize: 20, fontWeight: 600, letterSpacing: -0.4 },
  sub: { fontSize: 13, color: 'var(--text2)', marginTop: 4 },
  footer: { textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: '1.25rem' },
};
