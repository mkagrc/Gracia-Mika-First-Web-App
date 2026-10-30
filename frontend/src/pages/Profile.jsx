import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const success = location.state?.profileUpdated ? 'Profile updated successfully.' : '';

  useEffect(() => {
    let active = true;
    api.get('/dashboard')
      .then(({ data }) => { if (active) setUser(data); })
      .catch((requestError) => {
        if (requestError.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        } else if (active) {
          setError(requestError.response?.data?.error ?? 'Could not load your profile');
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [navigate]);

  return (
    <>
      <Navbar />
      <main className="page-container narrow-page">
        <p className="eyebrow">YOUR ACCOUNT</p>
        <h1>Profile</h1>
        {success && <p className="success" role="status">{success}</p>}
        {error && <p className="error" role="alert">{error}</p>}
        {loading ? <p>Loading profile…</p> : user && (
          <section className="card profile-view-card">
            <div className="profile-view-header">
              {user.profilePicture
                ? <img className="profile-avatar" src={user.profilePicture} alt={`${user.fullName} profile`} />
                : <div className="profile-avatar profile-avatar-fallback" aria-label="Default profile avatar">{initials(user.fullName)}</div>}
              <div className="profile-view-heading">
                <span className="summary-label">ACCOUNT PROFILE</span>
                <h2>{user.fullName}</h2>
                <span className={`badge badge-${user.role}`}>{user.role}</span>
              </div>
            </div>
            <dl className="details-grid profile-view-details">
              <div><dt>Full Name</dt><dd>{user.fullName}</dd></div>
              <div><dt>Email</dt><dd>{user.email}</dd></div>
              <div><dt>Address</dt><dd>{user.address || 'Not set'}</dd></div>
              <div><dt>Phone</dt><dd>{user.phone || 'Not set'}</dd></div>
              <div><dt>Member since</dt><dd>{formatMemberSince(user.memberSince)}</dd></div>
            </dl>
            <div className="profile-view-actions">
              <Link className="button button-primary" to="/profile/edit">Edit Profile</Link>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
