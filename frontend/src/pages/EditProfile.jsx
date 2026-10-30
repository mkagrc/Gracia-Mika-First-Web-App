import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getStoredUser } from '../api/client.js';
import Navbar from '../components/Navbar.jsx';

const MAX_IMAGE_BYTES = 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

export default function EditProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    api.get('/dashboard')
      .then(({ data }) => {
        if (!active) return;
        setUser(data);
        setFullName(data.fullName || '');
        setAddress(data.address || '');
        setPhone(data.phone || '');
        setProfilePicture(data.profilePicture || '');
      })
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

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    setError('');
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Choose a JPEG or PNG image.');
      event.target.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Profile picture must be no larger than 1 MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setProfilePicture(String(reader.result || ''));
    reader.onerror = () => setError('Could not read the selected image.');
    reader.readAsDataURL(file);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const { data } = await api.put('/users/me', {
        fullName,
        address,
        phone,
        profilePicture: profilePicture || null,
      });
      const storedUser = { ...(getStoredUser() || {}) };
      delete storedUser.profilePicture;
      storedUser.fullName = data.fullName;
      storedUser.role = data.role;
      localStorage.setItem('user', JSON.stringify(storedUser));
      navigate('/profile', { state: { profileUpdated: true } });
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }
      setError(requestError.response?.data?.error ?? 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="page-container narrow-page">
        <p className="eyebrow">YOUR ACCOUNT</p>
        <h1>Edit Profile</h1>
        {loading ? <p>Loading profile…</p> : error && !user.email ? <p className="error" role="alert">{error}</p> : (
          <form className="card profile-form" onSubmit={onSubmit}>
            <div className="profile-picture-editor">
              {profilePicture
                ? <img className="profile-avatar" src={profilePicture} alt="Profile preview" />
                : <div className="profile-avatar profile-avatar-fallback" aria-label="Default profile avatar">{(fullName || 'User').trim().charAt(0).toUpperCase()}</div>}
            </div>
            <label>Full Name<input name="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} required /></label>
            <label>Address<input name="address" value={address} maxLength={255} onChange={(event) => setAddress(event.target.value)} placeholder="Optional" /></label>
            <label>Phone number<input name="phone" type="tel" value={phone} maxLength={20} pattern="[0-9+ -]*" onChange={(event) => setPhone(event.target.value)} placeholder="Optional" /></label>
            <label>Email<input type="email" value={user.email || ''} readOnly disabled /></label>
            <label>Profile picture (JPEG or PNG, up to 1 MB)<input name="profilePicture" type="file" accept="image/jpeg,image/png" onChange={handleImageChange} /></label>
            {error && <p className="error" role="alert">{error}</p>}
            <div className="profile-edit-actions">
              <button className="button button-secondary" type="button" onClick={() => navigate('/profile')}>Cancel</button>
              <button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>
            </div>
          </form>
        )}
      </main>
    </>
  );
}
