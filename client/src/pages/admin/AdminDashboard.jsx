import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, GraduationCap, Shield, Plus, AlertCircle } from 'lucide-react';

const emptyUniversity = {
  name: '',
  country: '',
  worldRank: '',
  avgGre: '',
  avgToefl: '',
  avgCgpa: '',
  acceptanceRate: '',
  tuitionFee: '',
  programs: '',
};

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uniForm, setUniForm] = useState(emptyUniversity);
  const [adding, setAdding] = useState(false);
  const [addMessage, setAddMessage] = useState('');
  const [addError, setAddError] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, uniRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/universities'),
      ]);
      setUsers(usersRes.data);
      setUniversities(uniRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const stats = {
    students: users.filter((u) => u.role === 'student').length,
    consultants: users.filter((u) => u.role === 'consultant').length,
    admins: users.filter((u) => u.role === 'admin').length,
  };

  const handleUniChange = (e) => {
    const { name, value } = e.target;
    setUniForm({ ...uniForm, [name]: value });
  };

  const handleAddUniversity = async (e) => {
    e.preventDefault();
    setAdding(true);
    setAddMessage('');
    setAddError('');
    try {
      const payload = {};
      Object.entries(uniForm).forEach(([key, value]) => {
        if (value === '') return;
        payload[key] = key === 'programs'
          ? value.split(',').map((s) => s.trim()).filter(Boolean)
          : key === 'name' || key === 'country'
            ? value
            : Number(value);
      });
      await api.post('/admin/universities', payload);
      setAddMessage('University added successfully!');
      setUniForm(emptyUniversity);
      await fetchAll();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add university');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <div className="container" style={{ paddingTop: '2rem' }}>Loading dashboard...</div>;
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Manage users and the university catalog.</p>
        </div>
      </div>

      {error && <p style={{ color: '#f87171', marginBottom: '1rem' }}>{error}</p>}

      <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(79, 70, 229, 0.2)', borderRadius: '0.75rem', color: '#818cf8' }}>
            <Users size={24} />
          </div>
          <div>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Total Users</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{users.length}</p>
          </div>
        </div>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '0.75rem', color: '#34d399' }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Universities</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{universities.length}</p>
          </div>
        </div>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.2)', borderRadius: '0.75rem', color: '#fbbf24' }}>
            <Shield size={24} />
          </div>
          <div>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Students / Consultants</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.students} / {stats.consultants}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ marginBottom: '2rem' }}>
        <div className="glass-panel">
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} /> Users
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                    <td><span className={`badge badge-${u.role === 'admin' ? 'target' : u.role === 'consultant' ? 'ambitious' : 'safe'}`}>{u.role}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel">
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GraduationCap size={20} /> Universities
          </h2>
          <div style={{ overflowX: 'auto', maxHeight: '320px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Country</th><th>Rank</th><th>Acceptance</th></tr>
              </thead>
              <tbody>
                {universities.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.country}</td>
                    <td>#{u.worldRank ?? '—'}</td>
                    <td>{u.acceptanceRate ?? '—'}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ maxWidth: '720px' }}>
        <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} /> Add University
        </h2>
        {addMessage && <p style={{ color: '#34d399', marginBottom: '1rem' }}>{addMessage}</p>}
        {addError && <p style={{ color: '#f87171', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertCircle size={16} /> {addError}</p>}
        <form onSubmit={handleAddUniversity}>
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input type="text" name="name" className="form-input" value={uniForm.name} onChange={handleUniChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Country *</label>
              <input type="text" name="country" className="form-input" value={uniForm.country} onChange={handleUniChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">World Rank</label>
              <input type="number" name="worldRank" className="form-input" value={uniForm.worldRank} onChange={handleUniChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Acceptance Rate (%)</label>
              <input type="number" name="acceptanceRate" className="form-input" value={uniForm.acceptanceRate} onChange={handleUniChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Avg GRE</label>
              <input type="number" name="avgGre" className="form-input" value={uniForm.avgGre} onChange={handleUniChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Avg TOEFL</label>
              <input type="number" name="avgToefl" className="form-input" value={uniForm.avgToefl} onChange={handleUniChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Avg CGPA (0–10)</label>
              <input type="number" name="avgCgpa" className="form-input" step="0.1" value={uniForm.avgCgpa} onChange={handleUniChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Tuition Fee / Year</label>
              <input type="number" name="tuitionFee" className="form-input" value={uniForm.tuitionFee} onChange={handleUniChange} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Programs (comma separated)</label>
              <input type="text" name="programs" className="form-input" value={uniForm.programs} onChange={handleUniChange} placeholder="Computer Science, Data Science" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={adding}>
            <Plus size={18} style={{ marginRight: '0.5rem' }} /> {adding ? 'Adding...' : 'Add University'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
