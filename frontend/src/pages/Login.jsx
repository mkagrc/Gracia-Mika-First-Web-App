import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  function onChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    }
  }

  return (
    <main className="auth-page">
      <form className="card" onSubmit={onSubmit}>
        <p className="eyebrow">USERHUB</p>
        <h2>Log in</h2>
        <label>Email<input name="email" type="email" value={form.email} onChange={onChange} placeholder="Email" required /></label>
        <label>Password<input name="password" type="password" value={form.password} onChange={onChange} placeholder="Password" required /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="button button-primary" type="submit">Log in</button>
        <p className="form-footer">No account? <Link to="/register">Register</Link></p>
      </form>
    </main>
  );
}
