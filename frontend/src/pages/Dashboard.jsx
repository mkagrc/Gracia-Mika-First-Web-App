import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import Navbar from '../components/Navbar.jsx';

function formatMemberSince(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
}

function initials(name) {
  return (name || 'User')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [info, setInfo] = useState(null);

  useEffect(() => {
    let active = true;
    api.get('/dashboard')
      .then((response) => { if (active) setInfo(response.data); })
      .catch(() => {
        localStorage.clear();
        navigate('/login');
      });
    return () => { active = false; };
  }, [navigate]);

  return (
    <>
      <Navbar />
      <main className="page-container">
        {!info ? <p>Loading…</p> : (
          <>
            <div className="page-heading dashboard-heading">
              <div>
                <p className="eyebrow">{info.role === 'ADMIN' ? 'ADMINISTRATOR OVERVIEW' : 'YOUR USERHUB ACCOUNT'}</p>
                <h1>{info.role === 'ADMIN' ? `Welcome Admin, ${info.fullName}!` : `Welcome, ${info.fullName}!`}</h1>
              </div>
              <span className={`badge badge-${info.role}`}>{info.role}</span>
            </div>

            <section className="card profile-summary" aria-label="Account profile">
              {info.profilePicture ? (
                <img className="profile-avatar" src={info.profilePicture} alt={`${info.fullName} profile`} />
              ) : (
                <div className="profile-avatar profile-avatar-fallback" aria-label="Default profile avatar">{initials(info.fullName)}</div>
              )}
              <div className="profile-summary-name">
                <span className="summary-label">PROFILE</span>
                <strong>{info.fullName}</strong>
              </div>
            </section>

            <section className="card details-card">
              <h2>Account Summary</h2>
              <dl className="details-grid">
                <div><dt>Email</dt><dd>{info.email}</dd></div>
                <div><dt>Member since</dt><dd>{formatMemberSince(info.memberSince)}</dd></div>
                <div><dt>Total users</dt><dd>{info.totalUsers}</dd></div>
              </dl>
            </section>

            {info.role === 'ADMIN' && (
              <section className="dashboard-actions" aria-label="Dashboard actions">
                <Link className="button button-secondary" to="/admin/users">View all users</Link>
              </section>
            )}
          </>
        )}
      </main>
    </>
  );
}
