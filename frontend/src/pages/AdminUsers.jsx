import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import Navbar from '../components/Navbar.jsx';

function formatCreatedAt(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/users')
      .then((response) => setUsers(response.data))
      .catch((requestError) => {
        if (requestError.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        } else if (requestError.response?.status === 403) {
          setError('Access denied');
        } else {
          setError(requestError.response?.data?.error ?? 'Unable to load users');
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <>
      <Navbar />
      <main className="page-container">
        <div className="page-heading">
          <div><p className="eyebrow">ADMINISTRATION</p><h1>All users</h1></div>
          <Link to="/dashboard">Back to dashboard</Link>
        </div>
        {loading ? <p>Loading…</p> : error ? <p className="error" role="alert">{error}</p> : (
          <div className="card table-card">
            <div className="table-scroll"><table>
              <thead><tr><th>ID</th><th>Full name</th><th>Email</th><th>Role</th><th>Member since</th></tr></thead>
              <tbody>{users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                  <td>{formatCreatedAt(user.createdAt)}</td>
                </tr>
              ))}</tbody>
            </table></div>
          </div>
        )}
      </main>
    </>
  );
}
