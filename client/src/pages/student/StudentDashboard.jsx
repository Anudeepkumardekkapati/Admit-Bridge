import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';
import CollegeDetailsModal from '../../components/CollegeDetailsModal';
import { Award, BookOpen, Target, Sparkles, ChevronRight, AlertCircle, Eye, Send, CheckCircle } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [predictions, setPredictions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [profileMissing, setProfileMissing] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Details modal
  const [detailsCollege, setDetailsCollege] = useState(null);

  // Apply modal
  const [applyCollege, setApplyCollege] = useState(null);
  const [applyCourse, setApplyCourse] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [predRes, appRes] = await Promise.all([
          api.get('/prediction'),
          api.get('/student/applications'),
        ]);
        setPredictions(predRes.data);
        setApplications(appRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleGeneratePredictions = async () => {
    setGenerating(true);
    setProfileMissing(false);
    try {
      const res = await api.post('/prediction/generate');
      setPredictions(res.data.predictions || []);
    } catch (error) {
      if (error.response?.status === 400) {
        setProfileMissing(true);
      } else {
        alert(error.response?.data?.message || "Failed to generate predictions");
      }
    } finally {
      setGenerating(false);
    }
  };

  const openApply = (pred) => {
    setApplyCollege(pred.university);
    const programs = pred.university.programs || [];
    setApplyCourse(programs[0] || '');
    setApplyMessage('');
    setApplyError('');
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!applyCourse) {
      setApplyError('Please select a course.');
      return;
    }
    setApplying(true);
    setApplyError('');
    setApplyMessage('');
    try {
      const res = await api.post('/student/applications', {
        universityId: applyCollege._id,
        course: applyCourse,
      });
      setApplications((prev) => [res.data, ...prev]);
      setApplyMessage('Application submitted successfully!');
      setTimeout(() => setApplyCollege(null), 1200);
    } catch (error) {
      setApplyError(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const alreadyApplied = (university) =>
    applications.some(
      (a) => a.university?._id === university._id && a.course === applyCourse
    );

  const visiblePredictions = showAll ? predictions : predictions.slice(0, 4);

  if (loading) {
    return <div className="container" style={{paddingTop: '2rem'}}>Loading dashboard...</div>;
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Student Dashboard</h1>
          <p style={{color: 'var(--text-muted)', marginTop: '0.5rem'}}>Welcome back, {user.name}!</p>
        </div>
        <button onClick={handleGeneratePredictions} className="btn btn-primary" disabled={generating}>
          <Sparkles size={18} style={{marginRight: '0.5rem'}} /> {generating ? 'Generating...' : 'Update AI Predictions'}
        </button>
      </div>

      {profileMissing && (
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#fbbf24', marginBottom: '1.5rem', padding: '1rem' }}>
          <AlertCircle size={20} />
          <div style={{ flex: 1 }}>
            <strong>Complete your academic profile first.</strong> We need your GRE/CGPA scores and preferences to recommend universities.
          </div>
          <Link to="/student/profile" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Complete Profile</Link>
        </div>
      )}

      <div className="grid grid-cols-3" style={{marginBottom: '2rem'}}>
        <div className="glass-panel" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <div style={{padding: '1rem', background: 'rgba(79, 70, 229, 0.2)', borderRadius: '0.75rem', color: '#818cf8'}}>
            <Award size={24} />
          </div>
          <div>
            <h3 style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem'}}>Recommended Universities</h3>
            <p style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{predictions.length}</p>
          </div>
        </div>
        
        <div className="glass-panel" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <div style={{padding: '1rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '0.75rem', color: '#34d399'}}>
            <Target size={24} />
          </div>
          <div>
            <h3 style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem'}}>Active Applications</h3>
            <p style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{applications.length}</p>
          </div>
        </div>

        <div className="glass-panel" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <div style={{padding: '1rem', background: 'rgba(245, 158, 11, 0.2)', borderRadius: '0.75rem', color: '#fbbf24'}}>
            <BookOpen size={24} />
          </div>
          <div>
            <h3 style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem'}}>University Catalog</h3>
            <Link to="/universities" className="btn btn-secondary" style={{padding: '0.25rem 0.75rem', fontSize: '0.85rem'}}>Browse</Link>
          </div>
        </div>
      </div>

      <h2 style={{marginBottom: '1rem'}}>AI University Recommendations</h2>
      
      {predictions.length === 0 ? (
        <div className="glass-panel" style={{textAlign: 'center', padding: '3rem'}}>
          <Sparkles size={48} style={{color: 'var(--primary)', marginBottom: '1rem', opacity: 0.5}} />
          <h3>No predictions yet</h3>
          <p style={{color: 'var(--text-muted)', margin: '1rem 0'}}>Generate AI predictions to see which universities fit your profile.</p>
          <button onClick={handleGeneratePredictions} className="btn btn-primary" disabled={generating}>
            {generating ? 'Generating...' : 'Generate Now'}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2">
            {visiblePredictions.map(pred => (
              <div key={pred._id} className="glass-panel" style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
                  <div>
                    <h3 style={{fontSize: '1.25rem', marginBottom: '0.25rem'}}>{pred.university.name}</h3>
                    <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>{pred.university.country} • Rank #{pred.university.worldRank}</p>
                  </div>
                  <span className={`badge badge-${pred.category.toLowerCase()}`}>{pred.category}</span>
                </div>
                
                {pred.reason && (
                  <p style={{color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem'}}>{pred.reason}</p>
                )}
                
                <div style={{marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>AI Probability</span>
                    <p style={{fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.2rem'}}>{pred.probabilityScore}%</p>
                  </div>
                  <div style={{display: 'flex', gap: '0.5rem'}}>
                    <button className="btn btn-secondary" style={{padding: '0.5rem 1rem'}} onClick={() => setDetailsCollege(pred.university)}>
                      <Eye size={16} style={{marginRight: '0.35rem'}} /> Details
                    </button>
                    <button className="btn btn-primary" style={{padding: '0.5rem 1rem'}} onClick={() => openApply(pred)}>
                      <Send size={16} style={{marginRight: '0.35rem'}} /> Apply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {predictions.length > 4 && (
            <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
              <button className="btn btn-secondary" onClick={() => setShowAll(!showAll)}>
                {showAll ? 'Show fewer colleges' : `Show more matching colleges (${predictions.length - 4} more)`}
                <ChevronRight size={16} style={{marginLeft: '0.4rem', transform: showAll ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s'}} />
              </button>
            </div>
          )}
        </>
      )}

      {detailsCollege && (
        <CollegeDetailsModal university={detailsCollege} onClose={() => setDetailsCollege(null)} />
      )}

      {applyCollege && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1.5rem',
        }} onClick={() => !applying && setApplyCollege(null)}>
          <form onSubmit={handleApply} className="glass-panel" style={{maxWidth: '440px', width: '100%'}} onClick={(e) => e.stopPropagation()}>
            <h3 style={{fontSize: '1.25rem', marginBottom: '0.25rem'}}>Apply to {applyCollege.name}</h3>
            <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem'}}>
              {applyCollege.country} • {applyCollege.location || ''}
            </p>

            <div className="form-group">
              <label className="form-label">Select Course</label>
              <select className="form-input" value={applyCourse} onChange={(e) => setApplyCourse(e.target.value)} required>
                <option value="" disabled>Select a course...</option>
                {(applyCollege.programs || []).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {applyMessage && (
              <p style={{color: '#34d399', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
                <CheckCircle size={16} /> {applyMessage}
              </p>
            )}
            {applyError && <p style={{color: '#f87171', marginBottom: '1rem'}}>{applyError}</p>}
            {alreadyApplied(applyCollege) && !applyMessage && (
              <p style={{color: '#fbbf24', marginBottom: '1rem'}}>You have already applied to this college for this course.</p>
            )}

            <div style={{display: 'flex', gap: '0.75rem'}}>
              <button type="button" className="btn btn-secondary" style={{flex: 1}} onClick={() => setApplyCollege(null)} disabled={applying}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{flex: 1}} disabled={applying || alreadyApplied(applyCollege)}>
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
