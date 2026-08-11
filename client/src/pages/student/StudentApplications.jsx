import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import CollegeDetailsModal from '../../components/CollegeDetailsModal';
import { FileText, Calendar, Eye, MapPin } from 'lucide-react';

const STATUS_COLORS = {
  'Applied': 'badge-target',
  'Under Review': 'badge-target',
  'Shortlisted': 'badge-safe',
  'Accepted': 'badge-safe',
  'Rejected': 'badge-ambitious',
  'Waitlisted': 'badge-ambitious',
  'Draft': 'badge-ambitious',
  'Submitted': 'badge-target',
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailsCollege, setDetailsCollege] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get('/student/applications');
        setApplications(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  if (loading) {
    return <div className="container" style={{ paddingTop: '2rem' }}>Loading applications...</div>;
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">My Applications</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Track the latest status updated by your consultant.
          </p>
        </div>
      </div>

      {error && <p style={{ color: '#f87171', marginBottom: '1rem' }}>{error}</p>}

      {applications.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <FileText size={48} style={{ color: 'var(--primary)', marginBottom: '1rem', opacity: 0.5 }} />
          <h3>No applications yet</h3>
          <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>
            Apply to colleges from your predictions or the university catalog.
          </p>
          <Link to="/student/dashboard" className="btn btn-primary">View Predictions</Link>
        </div>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '1.5rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>College</th>
                <th>Course</th>
                <th>Applied On</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id}>
                  <td>
                    <strong>{app.universityName || app.university?.name}</strong>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={12} /> {app.country || app.university?.country}
                    </p>
                  </td>
                  <td>{app.course}</td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)' }}>
                    <Calendar size={13} /> {formatDate(app.submittedDate)}
                  </td>
                  <td>
                    <span className={`badge ${STATUS_COLORS[app.status] || 'badge-target'}`}>{app.status}</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                      onClick={() => setDetailsCollege(app.university)}
                    >
                      <Eye size={14} style={{ marginRight: '0.3rem' }} /> Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detailsCollege && (
        <CollegeDetailsModal university={detailsCollege} onClose={() => setDetailsCollege(null)} />
      )}
    </div>
  );
};

export default StudentApplications;
