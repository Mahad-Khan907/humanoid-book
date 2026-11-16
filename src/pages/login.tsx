import React, { useState, useContext } from 'react';
import Layout from '@theme/Layout';
import { useHistory } from '@docusaurus/router';
import Link from '@docusaurus/Link';
import { AuthContext } from '../lib/better-auth-client';

export default function Login() {
  const authClient = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  if (!authClient) {
    return (
      <Layout title="Login">
        <div style={{ padding: '2rem', maxWidth: '420px', margin: '50px auto', textAlign: 'center' }}>
          Loading authentication system...
        </div>
      </Layout>
    );
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const res = await authClient.signIn.email(
        {
          email: email.trim(),
          password,
        },
        {
          onSuccess: () => {
            history.push('/docs/chapter1/foundations-of-physical-ai');
          },
          onError: (ctx) => {
            setError(ctx.error.message || 'Invalid email or password.');
            setIsLoading(false);
          },
        }
      );

      if (res?.error) {
        setError(res.error.message || 'Login failed. Please check your credentials.');
      } else if (res?.data) {
        history.push('/docs/chapter1/foundations-of-physical-ai');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your network and server status.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.6rem 0.8rem',
    marginTop: '0.35rem',
    borderRadius: '6px',
    border: '1px solid var(--ifm-color-emphasis-300, #ccc)',
    fontSize: '0.95rem',
    boxSizing: 'border-box' as const,
  };

  return (
    <Layout title="Login">
      <div style={{ padding: '2rem 1rem', maxWidth: '440px', margin: '40px auto' }}>
        <div className="card shadow--md" style={{ borderRadius: '10px', overflow: 'hidden' }}>
          <div className="card__header" style={{ borderBottom: '1px solid var(--ifm-color-emphasis-200, #eee)' }}>
            <h3 style={{ margin: 0 }}>Login to Your Account</h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--ifm-color-emphasis-600, #666)', fontSize: '0.9rem' }}>
              Access AI features and personalized learning
            </p>
          </div>
          <div className="card__body">
            <form onSubmit={handleSignIn}>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  placeholder="you@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Password</label>
                <input
                  type="password"
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="alert alert--danger" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                  {error}
                </div>
              )}

              <div style={{ marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  className="button button--primary button--block button--lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
          <div className="card__footer text--center" style={{ backgroundColor: 'var(--ifm-card-background-color, #fafafa)' }}>
            <small>
              Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Create an account</Link>
            </small>
          </div>
        </div>
      </div>
    </Layout>
  );
}
