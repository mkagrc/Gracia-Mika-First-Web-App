import { NavLink, useNavigate } from 'react-router-dom';
import api, { getStoredUser } from '../api/client.js';

export default function Navbar() {
  const navigate = useNavigate();
  const user = getStoredUser();

  async function handleLogout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Clear the browser session even if the API is unavailable.
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  }

  return (
    <header className="navbar">
      <NavLink className="navbar-brand" to="/dashboard">UserHub</NavLink>
      <nav className="navbar-links" aria-label="Main navigation">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/profile">Profile</NavLink>
        {user?.role === 'ADMIN' && <NavLink to="/admin/users">Users</NavLink>}
      </nav>
      <button className="button button-secondary navbar-logout" type="button" onClick={handleLogout}>Logout</button>
    </header>
  );
}
