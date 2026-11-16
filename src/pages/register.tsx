import React, { useState, useContext } from 'react';
import Layout from '@theme/Layout';
import { useHistory } from '@docusaurus/router';
import Link from '@docusaurus/Link';
import { AuthContext } from '../lib/better-auth-client';

export default function Register() {
  const authClient = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [softwareBg, setSoftwareBg] = useState('Beginner');
  const [hardwareBg, setHardwareBg] = useState('None');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  if (!authClient) {
    return (
      <Layout title="Sign Up">
        <div style={{ padding: '2rem', maxWidth: '420px', margin: '50px auto', textAlign: 'center' }}>
          Loading authentication system...
        </div>
      </Layout>
    );
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setError('Please provide your name, email, and password.');
      return;
    }
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await authClient.signUp.email(
        {
          email: email.trim(),
          password,
          name: name.trim(),
          softwareBackground: softwareBg,
          hardwareBackground: hardwareBg,
        },
        {
          onSuccess: () => {
            setSuccess('Account created successfully! Redirecting to chapter 1...');
            setTimeout(() => {
              history.push('/docs/chapter1/foundations-of-physical-ai');
            }, 1500);
          },
          onError: (ctx) => {
            setError(ctx.error.message || 'Registration failed. Please try again.');
            setIsLoading(false);
          },
        }
      );

      if (res?.error) {
        setError(res.error.message || 'Registration failed.');
      } else if (res?.data) {
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          history.push('/docs/chapter1/foundations-of-physical-ai');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Could not connect to authentication server.');
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
    <Layout title="Sign Up">
      <div style={{ padding: '2rem 1rem', maxWidth: '480px', margin: '30px auto' }}>
        <div className="card shadow--md" style={{ borderRadius: '10px', overflow: 'hidden' }}>
          <div className="card__header" style={{ borderBottom: '1px solid var(--ifm-color-emphasis-200, #eee)' }}>
            <h3 style={{ margin: 0 }}>Create Your Account</h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--ifm-color-emphasis-600, #666)', fontSize: '0.9rem' }}>
              Personalize your Physical AI textbook learning journey
            </p>
          </div>
          <div className="card__body">
            <form onSubmit={handleSignUp}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  placeholder="Your Name"
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                  required
                  disabled={isLoading}
                  autoComplete="name"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
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

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Password</label>
                <input
                  type="password"
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </div>

              <hr style={{ margin: '1.2rem 0', borderColor: 'var(--ifm-color-emphasis-200, #eee)' }} />

              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem' }}>Personalize Learning Track</h4>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Software Experience</label>
                <select
                  value={softwareBg}
                  onChange={(e) => setSoftwareBg(e.target.value)}
                  style={inputStyle}
                  disabled={isLoading}
                >
                  <option value="Beginner">Beginner (No coding experience)</option>
                  <option value="Intermediate">Intermediate (Python, JavaScript, Git)</option>
                  <option value="Advanced">Advanced (C++, ROS 2, Systems Engineering)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Hardware / Robotics Experience</label>
                <select
                  value={hardwareBg}
                  onChange={(e) => setHardwareBg(e.target.value)}
                  style={inputStyle}
                  disabled={isLoading}
                >
                  <option value="None">None (Starting fresh)</option>
                  <option value="Hobbyist">Hobbyist (Arduino, Raspberry Pi, 3D Printing)</option>
                  <option value="Industrial">Professional (Industrial Arms, Mobile Bases, Humanoids)</option>
                </select>
              </div>

              {error && (
                <div className="alert alert--danger" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert--success" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                  {success}
                </div>
              )}

              <div style={{ marginTop: '1.2rem' }}>
                <button
                  type="submit"
                  className="button button--primary button--block button--lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Sign Up & Start Learning'}
                </button>
              </div>
            </form>
          </div>
          <div className="card__footer text--center" style={{ backgroundColor: 'var(--ifm-card-background-color, #fafafa)' }}>
            <small>
              Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Log In here</Link>
            </small>
          </div>
        </div>
      </div>
    </Layout>
  );
}
