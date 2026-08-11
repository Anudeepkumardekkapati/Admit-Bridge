import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import CollegeDetailsModal from '../../components/CollegeDetailsModal';
import { Search, MapPin, TrendingUp, DollarSign, GraduationCap, Eye } from 'lucide-react';

const UniversityList = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [detailsCollege, setDetailsCollege] = useState(null);

  const countries = [...new Set(universities.map((u) => u.country).filter(Boolean))].sort();

  const fetchUniversities = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (query) params.q = query;
      if (country) params.country = country;
      const res = await api.get('/universities', { params });
      setUniversities(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load universities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUniversities();
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">University Catalog</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Explore universities and their admission profiles.
          </p>
        </div>
      </div>

      <div className="glass-panel" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search universities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-secondary"><Search size={16} style={{ marginRight: '0.5rem' }} />Search</button>
        </form>
        <select className="form-input" value={country} onChange={(e) => setCountry(e.target.value)} style={{ maxWidth: '200px' }}>
          <option value="">All countries</option>
          {countries.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {error && <p style={{ color: '#f87171', marginBottom: '1rem' }}>{error}</p>}

      {loading ? (
        <div style={{ padding: '2rem 0' }}>Loading universities...</div>
      ) : universities.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <GraduationCap size={48} style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '1rem' }} />
          <h3>No universities found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Try a different search or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2">
          {universities.map((uni) => (
            <div key={uni._id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{uni.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={14} /> {uni.country}{uni.worldRank ? ` • World Rank #${uni.worldRank}` : ''}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avg GRE / TOEFL</p>
                  <p style={{ fontWeight: 'bold' }}>{uni.avgGre ?? '—'} / {uni.avgToefl ?? '—'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avg CGPA</p>
                  <p style={{ fontWeight: 'bold' }}>{uni.avgCgpa ?? '—'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Acceptance Rate</p>
                  <p style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <TrendingUp size={14} style={{ color: '#34d399' }} /> {uni.acceptanceRate ?? '—'}%
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tuition / Year</p>
                  <p style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <DollarSign size={14} style={{ color: '#fbbf24' }} /> {uni.tuitionFee ? uni.tuitionFee.toLocaleString() : '—'}
                  </p>
                </div>
              </div>

              {uni.programs?.length > 0 && (
                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {uni.programs.map((p) => (
                    <span key={p} className="badge badge-target">{p}</span>
                  ))}
                </div>
              )}

              <button className="btn btn-secondary" style={{ width: '100%', padding: '0.6rem 1rem' }} onClick={() => setDetailsCollege(uni)}>
                <Eye size={16} style={{ marginRight: '0.4rem' }} /> View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {detailsCollege && (
        <CollegeDetailsModal university={detailsCollege} onClose={() => setDetailsCollege(null)} />
      )}
    </div>
  );
};

export default UniversityList;
