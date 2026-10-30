import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');

  function onChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (requestError) {
      setError(requestError.response?.data?.error ?? 'Check your inputs');
    }
  }

  return (
    <main className="auth-page">
      <form className="card" onSubmit={onSubmit}>
        <p className="eyebrow">USERHUB</p>
        <h2>Create an account</h2>
        <label>Full name<input name="fullName" value={form.fullName} onChange={onChange} placeholder="Full name" required /></label>
        <label>Email<input name="email" type="email" value={form.email} onChange={onChange} placeholder="Email" required /></label>
        <label>Password<input name="password" type="password" value={form.password} onChange={onChange} placeholder="Password" minLength={8} required /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="button button-primary" type="submit">Register</button>
        <p className="form-footer">Have an account? <Link to="/login">Log in</Link></p>
      </form>
    </main>
  );
}
