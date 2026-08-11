import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Save, GraduationCap, AlertCircle } from 'lucide-react';

const emptyForm = {
  greScore: '',
  toeflScore: '',
  ieltsScore: '',
  cgpa: '',
  percentage: '',
  preferredCountry: '',
  budget: '',
  researchExperience: '',
  workExperience: '',
  intendedMajor: '',
  specialization: '',
  bachelorDegree: '',
  bachelorUniversity: '',
  skills: '',
  targetTerm: '',
};

const COUNTRIES = [
  'USA', 'Canada', 'UK', 'Germany', 'Australia', 'Singapore',
  'Switzerland', 'Netherlands', 'New Zealand', 'India', 'Ireland', 'France',
];

const StudentProfile = () => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/student/profile');
        const p = res.data;
        setForm({
          greScore: p.greScore ?? '',
          toeflScore: p.toeflScore ?? '',
          ieltsScore: p.ieltsScore ?? '',
          cgpa: p.cgpa ?? '',
          percentage: p.percentage ?? '',
          preferredCountry: p.preferredCountry ?? '',
          budget: p.budget ?? '',
          researchExperience: p.researchExperience ?? '',
          workExperience: p.workExperience ?? '',
          intendedMajor: p.intendedMajor ?? '',
          specialization: p.specialization ?? '',
          bachelorDegree: p.bachelorDegree ?? '',
          bachelorUniversity: p.bachelorUniversity ?? '',
          skills: (p.skills || []).join(', '),
          targetTerm: p.targetTerm ?? '',
        });
      } catch (err) {
        if (err.response?.status === 404) {
          // No profile yet — that's fine, show an empty form.
          console.log('No profile found yet');
        } else {
          setError(err.response?.data?.message || 'Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      // Convert numeric fields, leave empty strings as undefined so they aren't saved
      const payload = {};
      Object.entries(form).forEach(([key, value]) => {
        if (value === '') return;
        if (key === 'skills') {
          payload[key] = value.split(',').map((s) => s.trim()).filter(Boolean);
        } else if (key === 'intendedMajor' || key === 'targetTerm' || key === 'preferredCountry' ||
                   key === 'specialization' || key === 'bachelorDegree' || key === 'bachelorUniversity') {
          payload[key] = value;
        } else {
          payload[key] = Number(value);
        }
      });
      await api.put('/student/profile', payload);
      setMessage('Profile saved successfully! You can now generate AI predictions.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container" style={{ paddingTop: '2rem' }}>Loading profile...</div>;
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Academic Profile</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Your scores and background power the AI recommendations.
          </p>
        </div>
      </div>

      {error && (
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f87171', marginBottom: '1.5rem', padding: '1rem' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}
      {message && (
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#34d399', marginBottom: '1.5rem', padding: '1rem' }}>
          <GraduationCap size={20} /> {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ maxWidth: '720px' }}>
        <div className="grid grid-cols-2">
          <div className="form-group">
            <label className="form-label">GRE Score (260–340)</label>
            <input type="number" name="greScore" className="form-input" min="260" max="340"
              value={form.greScore} onChange={handleChange} placeholder="e.g. 320" />
          </div>
          <div className="form-group">
            <label className="form-label">TOEFL Score (0–120)</label>
            <input type="number" name="toeflScore" className="form-input" min="0" max="120"
              value={form.toeflScore} onChange={handleChange} placeholder="e.g. 105" />
          </div>
          <div className="form-group">
            <label className="form-label">IELTS Score (0–9)</label>
            <input type="number" name="ieltsScore" className="form-input" min="0" max="9" step="0.5"
              value={form.ieltsScore} onChange={handleChange} placeholder="e.g. 7.0" />
          </div>
          <div className="form-group">
            <label className="form-label">CGPA (0–10)</label>
            <input type="number" name="cgpa" className="form-input" min="0" max="10" step="0.1"
              value={form.cgpa} onChange={handleChange} placeholder="e.g. 8.7" />
          </div>
          <div className="form-group">
            <label className="form-label">Percentage (0–100)</label>
            <input type="number" name="percentage" className="form-input" min="0" max="100" step="0.1"
              value={form.percentage} onChange={handleChange} placeholder="e.g. 87" />
          </div>
          <div className="form-group">
            <label className="form-label">Preferred Country</label>
            <select name="preferredCountry" className="form-input"
              value={form.preferredCountry} onChange={handleChange}>
              <option value="">Any country</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Budget (USD / Year)</label>
            <input type="number" name="budget" className="form-input" min="0"
              value={form.budget} onChange={handleChange} placeholder="e.g. 40000" />
          </div>
          <div className="form-group">
            <label className="form-label">Research Experience (months)</label>
            <input type="number" name="researchExperience" className="form-input" min="0"
              value={form.researchExperience} onChange={handleChange} placeholder="e.g. 12" />
          </div>
          <div className="form-group">
            <label className="form-label">Work Experience (months)</label>
            <input type="number" name="workExperience" className="form-input" min="0"
              value={form.workExperience} onChange={handleChange} placeholder="e.g. 24" />
          </div>
          <div className="form-group">
            <label className="form-label">Intended Major / Course</label>
            <input type="text" name="intendedMajor" className="form-input"
              value={form.intendedMajor} onChange={handleChange} placeholder="e.g. MS Computer Science" />
          </div>
          <div className="form-group">
            <label className="form-label">Specialization</label>
            <input type="text" name="specialization" className="form-input"
              value={form.specialization} onChange={handleChange} placeholder="e.g. Data Science" />
          </div>
          <div className="form-group">
            <label className="form-label">Bachelor's Degree</label>
            <input type="text" name="bachelorDegree" className="form-input"
              value={form.bachelorDegree} onChange={handleChange} placeholder="e.g. B.Tech in Computer Science" />
          </div>
          <div className="form-group">
            <label className="form-label">Bachelor's University</label>
            <input type="text" name="bachelorUniversity" className="form-input"
              value={form.bachelorUniversity} onChange={handleChange} placeholder="e.g. IIT Delhi" />
          </div>
          <div className="form-group">
            <label className="form-label">Skills (comma separated)</label>
            <input type="text" name="skills" className="form-input"
              value={form.skills} onChange={handleChange} placeholder="e.g. Python, Machine Learning, SQL" />
          </div>
          <div className="form-group">
            <label className="form-label">Target Term</label>
            <input type="text" name="targetTerm" className="form-input"
              value={form.targetTerm} onChange={handleChange} placeholder="e.g. Fall 2027" />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: '0.5rem' }}>
          <Save size={18} style={{ marginRight: '0.5rem' }} /> {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default StudentProfile;
